import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Initial state - Unchanged
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types - Unchanged
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer - Unchanged
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return { ...state, loading: true, error: null };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false, error: null };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return { ...state, user: action.payload.user, isAuthenticated: true, loading: false, error: null };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: action.payload || null };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Helper to set Axios authorization header - Unchanged
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// AuthProvider component - UPDATED
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ***** CRITICAL FIX: This effect synchronizes the token state with Axios headers *****
  // It runs whenever the token changes, ensuring all API requests are authenticated.
  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    } else {
      setAuthToken(null);
    }
  }, [state.token]);


  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
        try {
            const response = await axios.get('/api/auth/me'); 
            dispatch({
                type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                payload: { user: response.data.user }
            });
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
        }
    } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login function wrapped in useCallback
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.data });
      toast.success(`Welcome back, ${response.data.user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Register function wrapped in useCallback
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await axios.post('/api/auth/register', userData);
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: response.data });
      toast.success(`Welcome to Virtual Lab LMS, ${response.data.user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Logout function wrapped in useCallback
  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  // Clear error function wrapped in useCallback
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);


  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {/* This prevents rendering children until the initial user load attempt is complete */}
      {!state.loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context - Unchanged
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
