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

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(req.user._id);
    await course.save();

    res.json({ message: 'Successfully enrolled in course' });
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

    const assignments = [];
    courses.forEach(course => {
      (course.assignments || []).forEach(assignment => {
        const assigned = Array.isArray(assignment.assignedStudents) && assignment.assignedStudents.length > 0
          ? assignment.assignedStudents.some(s => s.equals ? s.equals(req.user._id) : String(s) === String(req.user._id))
          : true; // empty list => for all students

        if (assigned) {
          assignments.push({
            ...assignment.toObject(),
            courseTitle: course.title,
            courseId: course._id,
            instructor: course.createdBy
          });
        }
      });
    });

    res.json(assignments);
  } catch (err) {
    console.error('GET student assignments error', err);
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
      .populate('assignments')
      .populate('submissions.student', 'name email')
      .populate('labs');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
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
      // if payload didn't specify, assign to all current course students
      assignedStudents: Array.isArray(assignedStudents) && assignedStudents.length > 0
        ? assignedStudents
        : (course.students || []),
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
    
    // Check if student is assigned to this assignment
    if (!assignment.assignedStudents.includes(req.user._id)) {
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

    const assignments = [];
    courses.forEach(course => {
      (course.assignments || []).forEach(assignment => {
        const assigned = Array.isArray(assignment.assignedStudents) && assignment.assignedStudents.length > 0
          ? assignment.assignedStudents.some(s => s.equals ? s.equals(req.user._id) : String(s) === String(req.user._id))
          : true; // empty list => for all students

        if (assigned) {
          assignments.push({
            ...assignment.toObject(),
            courseTitle: course.title,
            courseId: course._id,
            instructor: course.createdBy
          });
        }
      });
    });

    res.json(assignments);
  } catch (err) {
    console.error('GET student assignments error', err);
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

// POST /api/courses - Create new course (teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toString().toLowerCase() !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }
    
    const { title, description, category, level, duration } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Course title is required' });
    }
    
    const course = await Course.create({
      title,
      description: description || 'No description provided',
      instructor: req.user._id,
      createdBy: req.user._id,
      category: category || 'Engineering',
      level: level || 'Beginner',
      duration: duration || 4,
      status: 'published',
      isPublished: true,
      students: [],
      enrolledStudents: [],
      assignments: [],
      labs: []
    });
    
    await course.populate('createdBy', 'name email');
    
    return res.status(201).json(course);
  } catch (err) {
    console.error('POST /api/courses error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;