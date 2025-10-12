import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LabContext = createContext();

// Initial state
const initialState = {
  courses: [],
  currentCourse: null,
  labs: [],
  currentLab: null,
  submissions: [],
  loading: false,
  error: null
};

// Action types
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

// Reducer
const labReducer = (state, action) => {
  switch (action.type) {
    case LAB_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case LAB_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case LAB_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case LAB_ACTIONS.SET_COURSES:
      return {
        ...state,
        courses: action.payload,
        loading: false
      };
    
    case LAB_ACTIONS.SET_CURRENT_COURSE:
      return {
        ...state,
        currentCourse: action.payload
      };
    
    case LAB_ACTIONS.SET_LABS:
      return {
        ...state,
        labs: action.payload,
        loading: false
      };
    
    case LAB_ACTIONS.SET_CURRENT_LAB:
      return {
        ...state,
        currentLab: action.payload
      };
    
    case LAB_ACTIONS.SET_SUBMISSIONS:
      return {
        ...state,
        submissions: action.payload
      };
    
    case LAB_ACTIONS.ADD_SUBMISSION:
      return {
        ...state,
        submissions: [...state.submissions, action.payload]
      };
    
    case LAB_ACTIONS.UPDATE_SUBMISSION:
      return {
        ...state,
        submissions: state.submissions.map(submission =>
          submission.id === action.payload.id ? action.payload : submission
        )
      };
    
    default:
      return state;
  }
};

// LabProvider component
export const LabProvider = ({ children }) => {
  const [state, dispatch] = useReducer(labReducer, initialState);

  // Set loading state
  const setLoading = (loading) => {
    dispatch({ type: LAB_ACTIONS.SET_LOADING, payload: loading });
  };

  // Set error state
  const setError = (error) => {
    dispatch({ type: LAB_ACTIONS.SET_ERROR, payload: error });
    toast.error(error);
  };

  // Clear error state
  const clearError = () => {
    dispatch({ type: LAB_ACTIONS.CLEAR_ERROR });
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      dispatch({ type: LAB_ACTIONS.SET_COURSES, payload: response.data.courses });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch courses');
    }
  };

  // Fetch course by ID
  const fetchCourse = async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      dispatch({ type: LAB_ACTIONS.SET_CURRENT_COURSE, payload: response.data.course });
      return response.data.course;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch course');
      return null;
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    try {
      setLoading(true);
      await axios.post(`/api/courses/${courseId}/enroll`);
      toast.success('Successfully enrolled in course!');
      
      // Refresh courses to update enrollment status
      await fetchCourses();
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll in course');
      return { success: false };
    }
  };

  // Fetch labs for a course
  const fetchLabs = async (courseId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}/labs`);
      dispatch({ type: LAB_ACTIONS.SET_LABS, payload: response.data.labs });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch labs');
    }
  };

  // Fetch lab by ID
  const fetchLab = async (courseId, labId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/labs/${labId}`);
      dispatch({ type: LAB_ACTIONS.SET_CURRENT_LAB, payload: response.data.lab });
      return response.data.lab;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch lab');
      return null;
    }
  };

  // Submit lab results
  const submitLabResults = async (labId, results) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/labs/${labId}/submit`, results);
      
      dispatch({ type: LAB_ACTIONS.ADD_SUBMISSION, payload: response.data.submission });
      toast.success('Lab results submitted successfully!');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit lab results');
      return { success: false };
    }
  };

  // Fetch submissions
  const fetchSubmissions = async (labId) => {
    try {
      const response = await axios.get(`/api/labs/${labId}/submissions`);
      dispatch({ type: LAB_ACTIONS.SET_SUBMISSIONS, payload: response.data.submissions });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch submissions');
    }
  };

  // Update submission status (for teachers)
  const updateSubmissionStatus = async (submissionId, status) => {
    try {
      const response = await axios.patch(`/api/submissions/${submissionId}`, { status });
      dispatch({ type: LAB_ACTIONS.UPDATE_SUBMISSION, payload: response.data.submission });
      toast.success('Submission status updated!');
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update submission');
      return { success: false };
    }
  };

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
    updateSubmissionStatus
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
};

// Custom hook to use lab context
export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};

export default LabContext;
