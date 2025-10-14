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
      // Backend supports filtering labs by course via query param
      const response = await axios.get(`/api/labs`, {
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
      setError(error.response?.data?.message || 'Failed to fetch instructor courses');
      return [];
    }
  }, [setError]);

  const fetchLabSubmissions = useCallback(async (labId, { status, page = 1, limit = 50 } = {}) => {
    try {
      const response = await axios.get(`/api/labs/${labId}/submissions`, {
        params: { status, page, limit }
      });
      return response.data?.submissions || [];
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch submissions');
      return [];
    }
  }, [setError]);

  const gradeLabSubmission = useCallback(async (labId, studentId, { score, feedback }) => {
    try {
      const response = await axios.put(`/api/labs/${labId}/grade`, {
        studentId,
        score,
        feedback
      });
      toast.success('Submission graded successfully');
      return { success: true, progress: response.data?.progress };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to grade submission');
      return { success: false };
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
    fetchStudentLabProgress
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
