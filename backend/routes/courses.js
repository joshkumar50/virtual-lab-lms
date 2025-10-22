const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');
const { autoGrade } = require('../utils/autoGrader');

// GET /api/courses
// - students/guests: list published courses
// - teachers: list courses they created
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user && (req.user.role || '').toString().toLowerCase() === 'teacher') {
      const courses = await Course.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .populate('students', 'name email lastLogin createdAt')
        .populate('enrolledStudents', 'name email lastLogin createdAt')
        .populate('labs');
      
      // Manually populate student info in nested submissions
      for (let course of courses) {
        if (course.assignments && course.assignments.length > 0) {
          for (let assignment of course.assignments) {
            if (assignment.submissions && assignment.submissions.length > 0) {
              await Course.populate(assignment.submissions, {
                path: 'student',
                select: 'name email'
              });
            }
          }
        }
      }
      
      return res.json(courses);
    }
    const courses = await Course.find({ status: 'published' })
      .populate('createdBy', 'name email')
      .populate('labs');
    return res.json(courses);
  } catch (err) {
    console.error('GET /api/courses error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/:courseId/enroll - Enroll in course
router.post('/:courseId/enroll', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check both students and enrolledStudents arrays
    const isEnrolled = course.students.includes(req.user._id) || 
                       course.enrolledStudents.includes(req.user._id);
    
    if (isEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add to both arrays for compatibility
    course.students.push(req.user._id);
    course.enrolledStudents.push(req.user._id);
    await course.save();

    console.log(`✅ Student ${req.user.name} enrolled in course "${course.title}"`);
    res.json({ message: 'Successfully enrolled in course', course });
  } catch (err) {
    console.error('POST /api/courses/:courseId/enroll error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// IMPORTANT: Specific routes must come BEFORE dynamic '/:id'
// GET /api/courses/student/assignments - Get student's assignments
// Rules:
// - Return assignments explicitly assigned to the student
// - Also return assignments with an empty assignedStudents list (treat as assigned to all)
// - Prefer courses with status 'published'; if student is enrolled, include regardless of status field inconsistencies
router.get('/student/assignments', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'student') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Fetch all published courses plus any courses the student is enrolled in
    const courses = await Course.find({
      $or: [
        { status: 'published' },
        { students: req.user._id }
      ]
    }).populate('createdBy', 'name email');

    console.log(`📚 Found ${courses.length} courses for student ${req.user._id}`);
    courses.forEach(c => {
      console.log(`  - Course: ${c.title}, Assignments: ${c.assignments?.length || 0}, Status: ${c.status}`);
      if (c.assignments) {
        c.assignments.forEach(a => {
          console.log(`    - Assignment: ${a.title}, assignedStudents: ${a.assignedStudents?.length || 0}`);
        });
      }
    });

    const assignments = [];
    courses.forEach(course => {
      // Check if student is enrolled in this course
      const isEnrolled = course.students && course.students.some(s => 
        s.equals ? s.equals(req.user._id) : String(s) === String(req.user._id)
      );
      
      (course.assignments || []).forEach(assignment => {
        // Assignment is visible if:
        // 1. Student is enrolled in the course, OR
        // 2. assignedStudents is empty (assigned to all), OR
        // 3. Student is explicitly in assignedStudents list
        const hasNoSpecificStudents = !Array.isArray(assignment.assignedStudents) || assignment.assignedStudents.length === 0;
        const isExplicitlyAssigned = Array.isArray(assignment.assignedStudents) && assignment.assignedStudents.length > 0
          && assignment.assignedStudents.some(s => s.equals ? s.equals(req.user._id) : String(s) === String(req.user._id));
        
        const shouldShow = isEnrolled || hasNoSpecificStudents || isExplicitlyAssigned;
        
        console.log(`    📝 Assignment "${assignment.title}": isEnrolled=${isEnrolled}, hasNoSpecificStudents=${hasNoSpecificStudents}, isExplicitlyAssigned=${isExplicitlyAssigned}, shouldShow=${shouldShow}`);

        if (shouldShow) {
          // Filter submissions to only include the current student's submissions
          const studentSubmissions = assignment.submissions ? 
            assignment.submissions.filter(sub => 
              sub.student && (sub.student.equals ? sub.student.equals(req.user._id) : String(sub.student) === String(req.user._id))
            ) : [];
          
          const assignmentData = assignment.toObject();
          assignmentData.submissions = studentSubmissions;
          
          assignments.push({
            ...assignmentData,
            courseTitle: course.title,
            courseId: course._id,
            instructor: course.createdBy
          });
        }
      });
    });

    console.log(`✅ Returning ${assignments.length} assignments to student`);
    res.json(assignments);
  } catch (err) {
    console.error('❌ GET student assignments error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/teacher/submissions - Get all submissions for teacher
router.get('/teacher/submissions', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const courses = await Course.find({
      createdBy: req.user._id
    })
    .populate('createdBy', 'name email');

    // Manually populate student info in nested submissions
    for (let course of courses) {
      if (course.assignments && course.assignments.length > 0) {
        for (let assignment of course.assignments) {
          if (assignment.submissions && assignment.submissions.length > 0) {
            await Course.populate(assignment.submissions, {
              path: 'student',
              select: 'name email'
            });
          }
        }
      }
    }

    const submissions = [];
    courses.forEach(course => {
      course.assignments.forEach(assignment => {
        if (assignment.submissions && assignment.submissions.length > 0) {
          assignment.submissions.forEach(submission => {
            submissions.push({
              ...submission.toObject(),
              assignmentTitle: assignment.title,
              courseTitle: course.title,
              courseId: course._id,
              assignmentId: assignment._id
            });
          });
        }
      });
    });

    res.json(submissions);
  } catch (err) {
    console.error('GET teacher submissions error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id - Get single course (keep dynamic route AFTER specific ones)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('students', 'name email')
      .populate('enrolledStudents', 'name email')
      .populate('assignments')
      .populate('submissions.student', 'name email')
      .populate('labs');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the teacher
    const isTeacher = req.user && course.createdBy.equals(req.user._id);
    const isEnrolled = req.user && (
      course.students.some(s => s._id.equals(req.user._id)) ||
      course.enrolledStudents.some(s => s._id.equals(req.user._id))
    );

    // If student and not enrolled, hide sensitive materials
    if (req.user && req.user.role === 'student' && !isEnrolled && !isTeacher) {
      const publicCourse = course.toObject();
      // Hide materials from non-enrolled students
      publicCourse.materialLinks = [];
      publicCourse.zoomLink = null;
      publicCourse.announcement = 'Enroll in this course to access materials';
      return res.json(publicCourse);
    }

    res.json(course);
  } catch (err) {
    console.error('GET /api/courses/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses - Create new course (teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const courseData = {
      ...req.body,
      createdBy: req.user._id,
      instructor: req.user._id
    };

    const course = await Course.create(courseData);
    await course.populate('createdBy', 'name email');
    
    return res.status(201).json(course);
  } catch (err) {
    console.error('POST /api/courses error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/:courseId/assignments  (teacher only)
router.post('/:courseId/assignments', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can add assignment' });

    const { title, description, dueDate, assignedStudents, autoGrade, gradingCriteria, maxScore } = req.body;
    
    // Create assignment with assigned students and auto-grading settings
    const assignment = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      // if payload didn't specify, leave empty (assignment for ALL students)
      // If specific students provided, use those
      assignedStudents: Array.isArray(assignedStudents) && assignedStudents.length > 0
        ? assignedStudents
        : [],
      // Auto-grading settings
      autoGrade: autoGrade || false,
      gradingCriteria: gradingCriteria || null,
      maxScore: maxScore || 100,
      submissions: []
    };
    
    course.assignments = course.assignments || [];
    course.assignments.push(assignment);
    await course.save();
    
    return res.status(201).json(course);
  } catch (err) {
    console.error('POST assignment error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/courses/:courseId/assignments/:assignmentId (teacher only)
router.delete('/:courseId/assignments/:assignmentId', authMiddleware, async (req, res) => {
  try {
    console.log(`🗑️  DELETE assignment request: courseId=${req.params.courseId}, assignmentId=${req.params.assignmentId}, user=${req.user._id}`);
    
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      console.log('❌ User is not a teacher');
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!course.createdBy.equals(req.user._id)) {
      console.log('❌ User is not the course owner');
      return res.status(403).json({ message: 'Only owner can delete assignments' });
    }

    // Find and remove the assignment
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) {
      console.log(`❌ Assignment not found in course. Available assignments: ${course.assignments.map(a => a._id).join(', ')}`);
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    console.log(`✅ Found assignment "${assignment.title}", deleting...`);
    
    // Remove the assignment using pull
    course.assignments.pull(req.params.assignmentId);
    await course.save();
    
    console.log('✅ Assignment deleted successfully');
    return res.json({ message: 'Assignment deleted successfully', course });
  } catch (err) {
    console.error('❌ DELETE assignment error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/courses/:courseId/assignments/:assignmentId (teacher only)
router.put('/:courseId/assignments/:assignmentId', authMiddleware, async (req, res) => {
  try {
    console.log(`📝 UPDATE assignment request: courseId=${req.params.courseId}, assignmentId=${req.params.assignmentId}`);
    
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!course.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only owner can update assignments' });
    }

    // Find the assignment
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Update assignment fields
    const { title, description, dueDate, status } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;
    if (status) assignment.status = status;
    
    await course.save();
    
    console.log('✅ Assignment updated successfully');
    return res.json({ message: 'Assignment updated successfully', assignment });
  } catch (err) {
    console.error('❌ UPDATE assignment error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/courses/:courseId/assignments/:assignmentId/reminder (teacher only)
router.post('/:courseId/assignments/:assignmentId/reminder', authMiddleware, async (req, res) => {
  try {
    console.log(`📧 SEND reminder request: courseId=${req.params.courseId}, assignmentId=${req.params.assignmentId}`);
    
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    const course = await Course.findById(req.params.courseId).populate('students', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!course.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only owner can send reminders' });
    }

    // Find the assignment
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    const { subject, message, sendToAll } = req.body;
    
    let studentsToRemind = [];
    
    if (sendToAll) {
      // Send to all students who haven't submitted
      const studentsWhoSubmitted = assignment.submissions.map(sub => sub.student.toString());
      studentsToRemind = course.students.filter(student => 
        !studentsWhoSubmitted.includes(student._id.toString())
      );
    } else {
      // Send to all enrolled students
      studentsToRemind = course.students;
    }
    
    // Create reminder record in the assignment
    const reminder = {
      subject,
      message,
      sentBy: req.user._id,
      sentAt: new Date(),
      recipients: studentsToRemind.map(student => ({
        student: student._id,
        read: false
      }))
    };
    
    assignment.reminders = assignment.reminders || [];
    assignment.reminders.push(reminder);
    
    // Also add to global course notifications for easier access
    const notification = {
      type: 'reminder',
      title: subject,
      message: message,
      sentBy: req.user._id,
      sentAt: new Date(),
      recipients: studentsToRemind.map(student => ({
        student: student._id,
        read: false
      })),
      relatedAssignment: assignment._id
    };
    
    course.notifications = course.notifications || [];
    course.notifications.push(notification);
    
    await course.save();
    
    console.log(`✅ Reminder stored and sent to ${studentsToRemind.length} students`);
    console.log(`📧 Recipients:`, studentsToRemind.map(s => s.email));
    
    return res.json({ 
      message: `Reminder sent successfully to ${studentsToRemind.length} students`,
      recipientCount: studentsToRemind.length,
      subject,
      message,
      reminderId: reminder._id,
      notificationId: notification._id
    });
  } catch (err) {
    console.error('❌ SEND reminder error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/courses/student/notifications - Get all notifications for student
router.get('/student/notifications', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'student') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Find all courses where the student is enrolled
    const courses = await Course.find({
      $or: [
        { students: req.user._id },
        { enrolledStudents: req.user._id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('notifications.sentBy', 'name email');

    const notifications = [];
    
    courses.forEach(course => {
      if (course.notifications && course.notifications.length > 0) {
        course.notifications.forEach(notification => {
          // Check if this notification is for this student
          const recipient = notification.recipients.find(r => 
            r.student.equals ? r.student.equals(req.user._id) : String(r.student) === String(req.user._id)
          );
          
          if (recipient) {
            notifications.push({
              ...notification.toObject(),
              courseTitle: course.title,
              courseId: course._id,
              read: recipient.read,
              readAt: recipient.readAt
            });
          }
        });
      }
    });

    // Sort by most recent first
    notifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

    console.log(`📬 Returning ${notifications.length} notifications for student ${req.user.name}`);
    res.json(notifications);
  } catch (err) {
    console.error('❌ GET student notifications error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/student/notifications/:notificationId/read - Mark notification as read
router.post('/student/notifications/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'student') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Find the course containing this notification
    const course = await Course.findOne({
      'notifications._id': req.params.notificationId,
      $or: [
        { students: req.user._id },
        { enrolledStudents: req.user._id }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Find the notification and update read status
    const notification = course.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const recipient = notification.recipients.find(r => 
      r.student.equals ? r.student.equals(req.user._id) : String(r.student) === String(req.user._id)
    );

    if (!recipient) {
      return res.status(403).json({ message: 'Not authorized to read this notification' });
    }

    recipient.read = true;
    recipient.readAt = new Date();

    await course.save();

    console.log(`✅ Notification marked as read by student ${req.user.name}`);
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('❌ Mark notification as read error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/courses/:courseId - Delete entire course (teacher only)
router.delete('/:courseId', authMiddleware, async (req, res) => {
  try {
    console.log(`🗑️  DELETE course request: courseId=${req.params.courseId}, user=${req.user._id}`);
    
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      console.log('❌ User is not a teacher');
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (!course.createdBy.equals(req.user._id)) {
      console.log('❌ User is not the course owner');
      return res.status(403).json({ message: 'Only course owner can delete' });
    }

    console.log(`✅ Deleting course "${course.title}"...`);
    
    // Delete the course completely
    await Course.findByIdAndDelete(req.params.courseId);
    
    console.log('✅ Course deleted successfully');
    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE course error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/courses/:courseId/submissions (student only)
router.post('/:courseId/submissions', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'student') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { assignmentId, content } = req.body;
    
    // Find the assignment
    const assignment = course.assignments.id(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    // Check if student can submit to this assignment
    // Allow if: assignedStudents is empty (for all students) OR student is explicitly assigned
    const hasNoSpecificStudents = !Array.isArray(assignment.assignedStudents) || assignment.assignedStudents.length === 0;
    const isExplicitlyAssigned = Array.isArray(assignment.assignedStudents) && 
      assignment.assignedStudents.some(s => s.equals ? s.equals(req.user._id) : String(s) === String(req.user._id));
    
    if (!hasNoSpecificStudents && !isExplicitlyAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this assignment' });
    }
    
    // Create submission
    const submission = {
      student: req.user._id,
      content,
      submittedAt: new Date(),
      status: 'submitted'
    };
    
    // AUTO-GRADE if enabled for this assignment
    let gradeResult = null;
    if (assignment.autoGrade && assignment.gradingCriteria) {
      console.log(`🤖 Auto-grading assignment "${assignment.title}"...`);
      gradeResult = autoGrade(content, assignment.gradingCriteria);
      
      submission.status = 'graded';
      submission.grade = {
        marks: gradeResult.score,
        feedback: gradeResult.overallFeedback,
        feedbackArray: gradeResult.feedback,
        breakdown: gradeResult.breakdown,
        gradedBy: null, // System graded
        gradedAt: new Date(),
        autoGraded: true
      };
      
      console.log(`✅ Auto-graded: ${gradeResult.score}/${gradeResult.maxScore} (${gradeResult.percentage}%)`);
    }
    
    assignment.submissions = assignment.submissions || [];
    assignment.submissions.push(submission);
    await course.save();
    
    // Return response with auto-grade results if available
    const response = {
      message: gradeResult ? 'Submission graded instantly!' : 'Submission created',
      course,
      autoGraded: !!gradeResult,
      gradeResult: gradeResult
    };
    
    return res.status(201).json(response);
  } catch (err) {
    console.error('POST submission error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/:courseId/submissions/:submissionId/grade
// Teacher manual grading - can override auto-grades
router.post('/:courseId/submissions/:submissionId/grade', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { marks, feedback } = req.body;
    
    // Validate marks is provided and is a valid number
    if (marks === undefined || marks === null || marks === '') {
      return res.status(400).json({ message: 'Marks is required' });
    }
    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      return res.status(400).json({ message: 'Marks must be a number between 0 and 100' });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    // Check if teacher owns this course
    if (!course.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only course owner can grade submissions' });
    }
    
    // Find the submission across all assignments in the course
    let foundSubmission = null;
    let foundAssignment = null;
    
    for (let assignment of course.assignments) {
      if (assignment.submissions && assignment.submissions.length > 0) {
        foundSubmission = assignment.submissions.id(req.params.submissionId);
        if (foundSubmission) {
          foundAssignment = assignment;
          break;
        }
      }
    }
    
    if (!foundSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if this was auto-graded before
    const wasAutoGraded = foundSubmission.grade?.autoGraded || false;
    const previousScore = foundSubmission.grade?.marks || null;
    
    // REPLACE auto-grade with teacher's manual grade
    foundSubmission.grade = { 
      marks: marksNum, 
      feedback: feedback || '',
      feedbackArray: [], // Clear auto-grade feedback array
      breakdown: null,   // Clear auto-grade breakdown
      gradedBy: req.user._id, 
      gradedAt: new Date(),
      autoGraded: false, // Mark as manually graded
      wasAutoGraded: wasAutoGraded, // Keep history that it was auto-graded
      previousAutoScore: wasAutoGraded ? previousScore : null // Store previous auto-score
    };
    
    // Update submission status
    foundSubmission.status = 'graded';
    
    await course.save();
    
    console.log(`✅ Teacher ${req.user.name} ${wasAutoGraded ? 'overrode auto-grade' : 'manually graded'} submission. New score: ${marksNum}`);
    
    return res.json({ 
      message: wasAutoGraded ? 'Auto-grade replaced with manual grade' : 'Graded successfully', 
      submission: foundSubmission,
      wasAutoGraded: wasAutoGraded,
      override: wasAutoGraded
    });
  } catch (err) {
    console.error('POST grade error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/courses/:id - Update course (teacher only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can update course' });

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return res.json(updatedCourse);
  } catch (err) {
    console.error('PUT /api/courses/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/courses/:id - Delete course (teacher only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Only owner can delete course' });

    await Course.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/courses/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;