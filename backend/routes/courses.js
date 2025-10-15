const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { authMiddleware } = require('../middleware/auth');

// GET /api/courses
// - students/guests: list published courses
// - teachers: list courses they created
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user && (req.user.role || '').toString().toLowerCase() === 'teacher') {
      const courses = await Course.find({ createdBy: req.user._id }).populate('createdBy', 'name email').populate('labs');
      return res.json(courses);
    }
    const courses = await Course.find({ status: 'published' }).populate('createdBy', 'name email').populate('labs');
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
    }).populate('createdBy', 'name email');

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

    const { title, description, dueDate, assignedStudents } = req.body;
    
    // Create assignment with assigned students
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
    
    assignment.submissions = assignment.submissions || [];
    assignment.submissions.push(submission);
    await course.save();
    
    return res.status(201).json({ message: 'Submission created', course });
  } catch (err) {
    console.error('POST submission error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/:courseId/submissions/:submissionId/grade
router.post('/:courseId/submissions/:submissionId/grade', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { marks, feedback } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
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

    foundSubmission.grade = { marks, feedback, gradedBy: req.user._id, gradedAt: new Date() };
    await course.save();
    return res.json({ message: 'Graded successfully', submission: foundSubmission });
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