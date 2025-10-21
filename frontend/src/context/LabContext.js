import React, { createContext, useContext, useReducer, useCallback } from 'react'; // Import useCallback
import API from '../api/index'; // Use configured API instance instead of raw axios
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
      console.log('🔍 LabContext: Attempting to fetch courses...');
      const response = await API.get('/api/courses');
      console.log('✅ LabContext: Courses fetched successfully:', response.data);
      if (response.data && response.data.length > 0) {
        dispatch({ type: LAB_ACTIONS.SET_COURSES, payload: response.data });
        console.log('✅ LabContext: Real courses loaded');
        return;
      }
    } catch (error) {
      console.error('❌ LabContext: Failed to fetch courses from backend:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      console.log('⚠️ LabContext: Falling back to demo courses');
    }
    
    // Fallback to demo courses when backend is unavailable
    const demoCourses = [
      {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        title: 'Electronics Fundamentals',
        description: 'Learn the basics of electronics through interactive virtual lab experiments including Ohm\'s Law, circuit analysis, and component behavior.',
        category: 'Engineering',
        level: 'Beginner',
        duration: 8,
        instructor: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu'
        },
        labs: ['507f1f77bcf86cd799439021', '507f1f77bcf86cd799439022'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: '507f1f77bcf86cd799439012',
        id: '507f1f77bcf86cd799439012',
        title: 'Digital Logic Design',
        description: 'Explore digital logic gates, Boolean algebra, and combinational circuits through hands-on virtual simulations.',
        category: 'Computer Science',
        level: 'Intermediate',
        duration: 10,
        instructor: {
          name: 'Prof. Michael Chen',
          email: 'michael.chen@university.edu'
        },
        labs: ['507f1f77bcf86cd799439023'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: '507f1f77bcf86cd799439013',
        id: '507f1f77bcf86cd799439013',
        title: 'Virtual Chemistry Laboratory',
        description: 'Conduct chemistry experiments safely in a virtual environment. Learn about chemical reactions, molecular interactions, and laboratory techniques.',
        category: 'Chemistry',
        level: 'Beginner',
        duration: 12,
        instructor: {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@university.edu'
        },
        labs: ['507f1f77bcf86cd799439024'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: '507f1f77bcf86cd799439014',
        id: '507f1f77bcf86cd799439014',
        title: 'Physics Simulation Lab',
        description: 'Interactive physics experiments covering mechanics, thermodynamics, and electromagnetism through advanced simulations.',
        category: 'Physics',
        level: 'Advanced',
        duration: 14,
        instructor: {
          name: 'Dr. Robert Thompson',
          email: 'robert.thompson@university.edu'
        },
        labs: ['507f1f77bcf86cd799439025'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ];
    
    dispatch({ type: LAB_ACTIONS.SET_COURSES, payload: demoCourses });
    setLoading(false);
  }, [setLoading, setError]);

  const fetchCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/courses/${courseId}`);
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
      await API.post(`/api/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled in course!');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll in course');
      return { success: false };
    }
  }, [setLoading, setError]);

  const fetchLabs = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/labs`, {
        params: courseId ? { course: courseId } : undefined
      });
      const labs = response.data?.labs || [];
      dispatch({ type: LAB_ACTIONS.SET_LABS, payload: labs });
      return labs;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch labs');
      return [];
    }
  }, [setLoading, setError]);

  const fetchLab = useCallback(async (courseId, labId) => {
    try {
      setLoading(true);
      const response = await API.get(`/api/labs/${labId}`);
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
      const response = await API.post(`/api/labs/${labId}/submit`, results);
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
      const response = await API.get(`/api/labs/${labId}/submissions`);
      dispatch({ type: LAB_ACTIONS.SET_SUBMISSIONS, payload: response.data || [] });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }, [setError]);

  // --- Teacher & Student additional APIs ---
  const fetchInstructorCourses = useCallback(async (page = 1, limit = 50) => {
    try {
      // Use existing backend route which returns teacher-owned courses when role=teacher
      const response = await API.get('/api/courses', {
        params: { page, limit }
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch instructor courses from backend:', error);
    }
    
    // Fallback to demo instructor courses when backend is unavailable
    const demoInstructorCourses = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Electronics Fundamentals',
        description: 'Learn the basics of electronics through interactive virtual lab experiments including Ohm\'s Law, circuit analysis, and component behavior.',
        category: 'Engineering',
        level: 'Beginner',
        duration: 8,
        instructor: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu'
        },
        students: [
          {
            _id: '507f1f77bcf86cd799439101',
            name: 'Alice Johnson',
            email: 'alice.johnson@student.edu',
            lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
          },
          {
            _id: '507f1f77bcf86cd799439102',
            name: 'Bob Smith',
            email: 'bob.smith@student.edu',
            lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
          },
          {
            _id: '507f1f77bcf86cd799439103',
            name: 'Carol Davis',
            email: 'carol.davis@student.edu',
            lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
          }
        ],
        assignments: [],
        labs: ['507f1f77bcf86cd799439021', '507f1f77bcf86cd799439022'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: '507f1f77bcf86cd799439012',
        title: 'Digital Logic Design',
        description: 'Explore digital logic gates, Boolean algebra, and combinational circuits through hands-on virtual simulations.',
        category: 'Computer Science',
        level: 'Intermediate',
        duration: 10,
        instructor: {
          name: 'Prof. Michael Chen',
          email: 'michael.chen@university.edu'
        },
        students: [
          {
            _id: '507f1f77bcf86cd799439104',
            name: 'David Wilson',
            email: 'david.wilson@student.edu',
            lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
          },
          {
            _id: '507f1f77bcf86cd799439105',
            name: 'Eva Martinez',
            email: 'eva.martinez@student.edu',
            lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
          }
        ],
        assignments: [],
        labs: ['507f1f77bcf86cd799439023'],
        enrolledStudents: [],
        thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop&auto=format&q=80',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ];
    
    return demoInstructorCourses;
  }, [setError]);

  const fetchLabSubmissions = useCallback(async (labId, { status, page = 1, limit = 50 } = {}) => {
    try {
      const response = await API.get(`/api/labs/${labId}/submissions`, {
        params: { status, page, limit }
      });
      return response.data?.submissions || [];
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch submissions');
      return [];
    }
  }, [setError]);

  const gradeLabSubmission = useCallback(async (assignmentId, submissionId, { score, feedback }) => {
    try {
      const response = await API.put(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        score,
        feedback
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to grade submission');
      return { success: false };
    }
  }, [setError]);

  // Assignment submission functionality
  const submitAssignment = useCallback(async (assignmentId, submissionData) => {
    try {
      const response = await API.post(`/api/assignments/${assignmentId}/submit`, submissionData);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit assignment');
      return { success: false };
    }
  }, [setError]);
  const fetchStudentLabProgress = useCallback(async (labId) => {
    try {
      const response = await API.get(`/api/labs/${labId}/progress`);
      return response.data?.progress || null;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch lab progress');
      return null;
    }
  }, [setError]);

  const updateSubmissionStatus = useCallback(async (submissionId, status) => {
    try {
      const response = await API.patch(`/api/submissions/${submissionId}`, { status });
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
