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
      const courses = await Course.find({ createdBy: req.user._id }).populate('createdBy', 'name email');
      return res.json(courses);
    }
    const courses = await Course.find({ status: 'published' }).populate('createdBy', 'name email');
    return res.json(courses);
  } catch (err) {
    console.error('GET /api/courses error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id - Get single course
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('students', 'name email')
      .populate('assignments')
      .populate('submissions.student', 'name email');

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

    const { title, description, dueDate } = req.body;
    course.assignments = course.assignments || [];
    course.assignments.push({ title, description, dueDate: dueDate ? new Date(dueDate) : null, createdAt: new Date() });
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

    const { assignment, content } = req.body;
    course.submissions = course.submissions || [];
    course.submissions.push({ 
      student: req.user._id, 
      assignment, 
      content, 
      submittedAt: new Date() 
    });
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
    const submission = course.submissions && course.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.grade = { marks, feedback, gradedBy: req.user._id, gradedAt: new Date() };
    await course.save();
    return res.json({ message: 'Graded', submission });
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