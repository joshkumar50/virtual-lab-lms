import React, { createContext, useContext, useReducer, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import toast from 'react-hot-toast';

const LabContext = createContext();

// Initial state - unchanged
const initialState = {
  courses: [],
  currentCourse: null,
  labs: [],
  currentLab: null,
  submissions: [],
  loading: false,
  error: null
};

// Action types - unchanged
const LAB_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_COURSES: 'SET_COURSES',
  SET_CURRENT_COURSE: 'SET_CURRENT_COURSE',
  SET_LABS: 'SET_LABS',
  SET_CURRENT_LAB: 'SET_CURRENT_LAB',
  SET_SUBMISSIONS: 'SET_SUBMISSIONS',
  ADD_SUBMISSION: 'ADD_SUBMISSION',
  UPDATE_SUBMISSION: 'UPDATE_SUBMISSION'
};

// Reducer - unchanged
const labReducer = (state, action) => {
  switch (action.type) {
    case LAB_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case LAB_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case LAB_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case LAB_ACTIONS.SET_COURSES:
      return { ...state, courses: action.payload, loading: false };
    case LAB_ACTIONS.SET_CURRENT_COURSE:
      return { ...state, currentCourse: action.payload };
    case LAB_ACTIONS.SET_LABS:
      return { ...state, labs: action.payload, loading: false };
    case LAB_ACTIONS.SET_CURRENT_LAB:
      return { ...state, currentLab: action.payload };
    case LAB_ACTIONS.SET_SUBMISSIONS:
      return { ...state, submissions: action.payload };
    case LAB_ACTIONS.ADD_SUBMISSION:
      return { ...state, submissions: [...state.submissions, action.payload] };
    case LAB_ACTIONS.UPDATE_SUBMISSION:
      return { ...state, submissions: state.submissions.map(s => s.id === action.payload.id ? action.payload : s) };
    default:
      return state;
  }
};

// LabProvider component - WITH useCallback FIXES
export const LabProvider = ({ children }) => {
  const [state, dispatch] = useReducer(labReducer, initialState);

  // --- STABLE HELPER FUNCTIONS ---
  // These functions are now wrapped in useCallback. The `dispatch` function from
  // useReducer is guaranteed to be stable, so the dependency array is empty.
  const setLoading = useCallback((loading) => {
    dispatch({ type: LAB_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: LAB_ACTIONS.SET_ERROR, payload: error });
    toast.error(error);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: LAB_ACTIONS.CLEAR_ERROR });
  }, []);

  // --- STABLE API FUNCTIONS ---
  // All async functions are also wrapped in useCallback to prevent them
  // from being recreated on every render.
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      dispatch({ type: LAB_ACTIONS.SET_COURSES, payload: response.data || [] });
    } catch (error) {
      // If backend is not available, show demo courses for hackathon
      console.log('Backend not available, using demo data');
      const demoCourses = [
        {
          _id: 'demo-1',
          title: 'Physics Virtual Labs',
          description: 'Interactive physics simulations including pendulum, wave interference, and more',
          duration: 8,
          level: 'Intermediate',
          category: 'Physics',
          instructor: { name: 'Dr. Physics' },
          labs: ['pendulum', 'double-slit'],
          enrolledStudents: [],
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format&q=80'
        },
        {
          _id: 'demo-2',
          title: 'Chemistry Lab Simulations',
          description: 'Explore chemical reactions, pH changes, and molecular interactions',
          duration: 6,
          level: 'Beginner',
          category: 'Chemistry',
          instructor: { name: 'Prof. Chemistry' },
          labs: ['ph-lab'],
          enrolledStudents: [],
          image: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=300&fit=crop&auto=format&q=80'
        },
        {
          _id: 'demo-3',
          title: 'Electronics & Circuits',
          description: 'Build and analyze electronic circuits with logic gates and components',
          duration: 10,
          level: 'Advanced',
          category: 'Electronics',
          instructor: { name: 'Eng. Electronics' },
          labs: ['logic-gates', 'circuit-analysis'],
          enrolledStudents: [],
          image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop&auto=format&q=80'
        }
      ];
      dispatch({ type: LAB_ACTIONS.SET_COURSES, payload: demoCourses });
      setLoading(false);
    }
  }, [setLoading, setError]);

  const fetchCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      dispatch({ type: LAB_ACTIONS.SET_CURRENT_COURSE, payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch course');
      return null;
    }
  }, [setLoading, setError]);
  
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      await axios.post(`/api/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled in course!');
      return { success: true };
    } catch (error) {
      // Demo enrollment - simulate success for hackathon
      console.log('Backend not available, simulating enrollment');
      setLoading(false);
      toast.success('Successfully enrolled in course! (Demo mode)');
      return { success: true };
    }
  }, [setLoading, setError]);

  const fetchLabs = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/labs`, {
        params: courseId ? { course: courseId } : undefined
      });
      const labs = response.data?.labs || [];
      dispatch({ type: LAB_ACTIONS.SET_LABS, payload: labs });
      return labs;
    } catch (error) {
      // Demo labs for teacher dashboard
      console.log('Backend not available, using demo labs');
      const demoLabs = [
        {
          _id: 'lab1',
          title: 'Pendulum Physics Lab',
          description: 'Study harmonic motion with virtual pendulum',
          courseId: courseId,
          type: 'physics',
          difficulty: 'intermediate'
        },
        {
          _id: 'lab2',
          title: 'Ohms Law Circuit Lab',
          description: 'Investigate voltage, current, and resistance relationships',
          courseId: courseId,
          type: 'electronics',
          difficulty: 'beginner'
        },
        {
          _id: 'lab3',
          title: 'Chemical Reactions Lab',
          description: 'Observe pH changes in acid-base reactions',
          courseId: courseId,
          type: 'chemistry',
          difficulty: 'beginner'
        }
      ];
      dispatch({ type: LAB_ACTIONS.SET_LABS, payload: demoLabs });
      setLoading(false);
      return demoLabs;
    }
  }, [setLoading, setError]);

  const fetchLab = useCallback(async (courseId, labId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/labs/${labId}`);
      dispatch({ type: LAB_ACTIONS.SET_CURRENT_LAB, payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch lab');
      return null;
    }
  }, [setLoading, setError]);

  const submitLabResults = useCallback(async (labId, results) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/labs/${labId}/submit`, results);
      dispatch({ type: LAB_ACTIONS.ADD_SUBMISSION, payload: response.data });
      toast.success('Lab results submitted successfully!');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit lab results');
      return { success: false };
    }
  }, [setLoading, setError]);

  const fetchSubmissions = useCallback(async (labId) => {
    try {
      const response = await axios.get(`/api/labs/${labId}/submissions`);
      dispatch({ type: LAB_ACTIONS.SET_SUBMISSIONS, payload: response.data || [] });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }, [setError]);

  // --- Teacher & Student additional APIs ---
  const fetchInstructorCourses = useCallback(async (page = 1, limit = 50) => {
    try {
      const response = await axios.get('/api/courses/instructor/my-courses', {
        params: { page, limit }
      });
      return response.data?.courses || [];
    } catch (error) {
      // Demo teacher courses with localStorage persistence
      console.log('Backend not available, using demo teacher courses with localStorage');
      
      // Check if we have saved courses in localStorage
      let savedCourses = JSON.parse(localStorage.getItem('demoCourses') || 'null');
      
      if (!savedCourses) {
        // Initialize default demo courses
        savedCourses = [
          {
            _id: 'teacher-course-1',
            title: 'Advanced Physics Laboratory',
            description: 'Comprehensive physics labs for engineering students',
            students: [
              { _id: 'student1', name: 'Alice Johnson', email: 'alice@student.com' },
              { _id: 'student2', name: 'Bob Smith', email: 'bob@student.com' },
              { _id: 'student3', name: 'Carol Williams', email: 'carol@student.com' }
            ],
            assignments: [
              {
                _id: 'assign1',
                title: 'Ohms Law Investigation',
                description: 'Complete the virtual Ohms Law lab and submit your findings',
                labTitle: 'Ohms Law Circuit Lab',
                labType: 'electronics',
                labId: 'lab2',
                dueDate: '2025-10-25T23:59:59Z',
                maxScore: 100,
                status: 'active',
                submissions: [
                  {
                    _id: 'sub1',
                    studentId: 'student1',
                    studentName: 'Alice Johnson',
                    submittedAt: '2025-10-13T14:30:00Z',
                    content: 'Completed Ohms Law lab. Found V=IR relationship holds true. Measured voltage: 12V, Current: 3A, Resistance: 4Ω',
                    labResults: { voltage: 12, current: 3, resistance: 4, accuracy: 95 },
                    status: 'graded',
                    score: 92,
                    feedback: 'Excellent work! Your measurements are very accurate.'
                  }
                ]
              }
            ]
          },
          {
            _id: 'teacher-course-2',
            title: 'Chemistry Fundamentals',
            description: 'Basic chemistry concepts through virtual experiments',
            students: [
              { _id: 'student4', name: 'David Brown', email: 'david@student.com' },
              { _id: 'student5', name: 'Eve Davis', email: 'eve@student.com' }
            ],
            assignments: []
          }
        ];
        localStorage.setItem('demoCourses', JSON.stringify(savedCourses));
      }
      
      return savedCourses;
    }
  }, [setError]);

  const fetchLabSubmissions = useCallback(async (labId, { status, page = 1, limit = 50 } = {}) => {
    try {
      const response = await axios.get(`/api/labs/${labId}/submissions`, {
        params: { status, page, limit }
      });
      return response.data?.submissions || [];
    } catch (error) {
      // Demo lab submissions
      console.log('Backend not available, using demo submissions');
      const demoSubmissions = [
        {
          _id: 'sub1',
          student: { _id: 'student1', name: 'Alice Johnson' },
          labId: labId,
          status: 'submitted',
          submittedAt: '2025-10-13T10:30:00Z',
          content: 'My pendulum experiment results show T = 2π√(L/g)',
          score: null,
          feedback: null
        },
        {
          _id: 'sub2',
          student: { _id: 'student2', name: 'Bob Smith' },
          labId: labId,
          status: 'graded',
          submittedAt: '2025-10-12T15:45:00Z',
          content: 'Circuit analysis complete - voltage drops calculated',
          score: 85,
          feedback: 'Good work! Consider adding more measurements.'
        }
      ];
      return demoSubmissions;
    }
  }, [setError]);

  const gradeLabSubmission = useCallback(async (assignmentId, submissionId, { score, feedback }) => {
    try {
      const response = await axios.put(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        score,
        feedback
      });
      return response.data;
    } catch (error) {
      // Demo grading with localStorage persistence
      console.log('Backend not available, using demo grading with localStorage');
      
      const savedCourses = JSON.parse(localStorage.getItem('demoCourses') || '[]');
      let updated = false;
      
      // Find and update the submission
      for (let course of savedCourses) {
        if (course.assignments) {
          for (let assignment of course.assignments) {
            if (assignment._id === assignmentId && assignment.submissions) {
              const submissionIndex = assignment.submissions.findIndex(sub => sub._id === submissionId);
              if (submissionIndex !== -1) {
                assignment.submissions[submissionIndex].score = score;
                assignment.submissions[submissionIndex].feedback = feedback;
                assignment.submissions[submissionIndex].status = 'graded';
                assignment.submissions[submissionIndex].gradedAt = new Date().toISOString();
                updated = true;
                break;
              }
            }
          }
        }
        if (updated) break;
      }
      
      if (updated) {
        localStorage.setItem('demoCourses', JSON.stringify(savedCourses));
        toast.success('Grade saved successfully!');
        return { success: true, score, feedback };
      } else {
        toast.error('Submission not found');
        return { success: false };
    }
  }, [setError]);

  // Assignment submission functionality
  const submitAssignment = useCallback(async (assignmentId, submissionData) => {
    try {
      const response = await axios.post(`/api/assignments/${assignmentId}/submit`, submissionData);
      return response.data;
    } catch (error) {
      // Demo submission with localStorage persistence
      console.log('Backend not available, using demo submission with localStorage');
      
      const savedCourses = JSON.parse(localStorage.getItem('demoCourses') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('demoUser') || 'null');
      
      if (!currentUser) {
        toast.error('Please log in to submit assignment');
        return { success: false };
      }
      
      let updated = false;
      const newSubmission = {
        _id: 'sub_' + Date.now(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        submittedAt: new Date().toISOString(),
        content: submissionData.content,
        labResults: submissionData.labResults || {},
        status: 'submitted',
        score: null,
        feedback: null
      };
      
      // Find and add submission to assignment
      for (let course of savedCourses) {
        if (course.assignments) {
          const assignmentIndex = course.assignments.findIndex(assign => assign._id === assignmentId);
          if (assignmentIndex !== -1) {
            if (!course.assignments[assignmentIndex].submissions) {
              course.assignments[assignmentIndex].submissions = [];
            }
            // Check if student already submitted
            const existingIndex = course.assignments[assignmentIndex].submissions.findIndex(
              sub => sub.studentId === currentUser.id
            );
            if (existingIndex !== -1) {
              // Update existing submission
              course.assignments[assignmentIndex].submissions[existingIndex] = newSubmission;
            } else {
              // Add new submission
              course.assignments[assignmentIndex].submissions.push(newSubmission);
            }
            updated = true;
            break;
          }
        }
      }
      
      if (updated) {
        localStorage.setItem('demoCourses', JSON.stringify(savedCourses));
        toast.success('Assignment submitted successfully!');
        return { success: true, submission: newSubmission };
      } else {
        toast.error('Assignment not found');
        return { success: false };
      }
    }
  }, [setError]);
  const fetchStudentLabProgress = useCallback(async (labId) => {
    try {
      const response = await axios.get(`/api/labs/${labId}/progress`);
      return response.data?.progress || null;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch lab progress');
      return null;
    }
  }, [setError]);

  const updateSubmissionStatus = useCallback(async (submissionId, status) => {
    try {
      const response = await axios.patch(`/api/submissions/${submissionId}`, { status });
      dispatch({ type: LAB_ACTIONS.UPDATE_SUBMISSION, payload: response.data.submission });
      toast.success('Submission status updated!');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update submission');
      return { success: false };
    }
  }, [setError]);

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    fetchCourses,
    fetchCourse,
    enrollInCourse,
    fetchLabs,
    fetchLab,
    submitLabResults,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchInstructorCourses,
    fetchLabSubmissions,
    gradeLabSubmission,
    fetchStudentLabProgress,
    submitAssignment
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
};

// Custom hook - unchanged
export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};

export default LabContext;
