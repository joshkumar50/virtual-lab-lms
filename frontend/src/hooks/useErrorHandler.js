import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for comprehensive error handling
 * @param {Object} options - Error handling options
 * @returns {Object} - Error state and handlers
 */
export const useErrorHandler = (options = {}) => {
  const {
    onError = null,
    logErrors = true,
    showToast = true,
    fallbackMessage = 'An unexpected error occurred'
  } = options;

  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback((error, context = '') => {
    const errorMessage = error?.message || error?.toString() || fallbackMessage;
    const fullContext = context ? `${context}: ${errorMessage}` : errorMessage;

    if (logErrors) {
      console.error('Error caught by useErrorHandler:', {
        error,
        context,
        message: errorMessage,
        stack: error?.stack
      });
    }

    setError({
      message: errorMessage,
      context,
      originalError: error,
      timestamp: new Date().toISOString()
    });
    setIsError(true);

    if (onError) {
      onError(error, context);
    }

    if (showToast && window.toast) {
      window.toast.error(fullContext);
    }
  }, [onError, logErrors, showToast, fallbackMessage]);

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  const handleAsync = useCallback(async (asyncFunction, context = '') => {
    try {
      clearError();
      return await asyncFunction();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError, clearError]);

  const handlePromise = useCallback((promise, context = '') => {
    return promise
      .catch(error => {
        handleError(error, context);
        throw error;
      });
  }, [handleError]);

  // Auto-clear error after timeout
  useEffect(() => {
    if (error && options.autoClearTimeout) {
      const timer = setTimeout(() => {
        clearError();
      }, options.autoClearTimeout);

      return () => clearTimeout(timer);
    }
  }, [error, options.autoClearTimeout, clearError]);

  return {
    error,
    isError,
    handleError,
    clearError,
    handleAsync,
    handlePromise
  };
};

/**
 * Hook for handling API errors specifically
 * @param {Object} options - API error handling options
 * @returns {Object} - API error state and handlers
 */
export const useApiErrorHandler = (options = {}) => {
  const errorHandler = useErrorHandler({
    ...options,
    fallbackMessage: 'API request failed'
  });

  const handleApiError = useCallback((error, endpoint = '') => {
    const context = endpoint ? `API ${endpoint}` : 'API request';
    errorHandler.handleError(error, context);
  }, [errorHandler]);

  const handleApiResponse = useCallback((response, endpoint = '') => {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.endpoint = endpoint;
      handleApiError(error, endpoint);
      throw error;
    }
    return response;
  }, [handleApiError]);

  return {
    ...errorHandler,
    handleApiError,
    handleApiResponse
  };
};

/**
 * Hook for handling form errors
 * @param {Object} initialErrors - Initial form errors
 * @returns {Object} - Form error state and handlers
 */
export const useFormErrorHandler = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);
  const [hasErrors, setHasErrors] = useState(false);

  const setError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
    setHasErrors(true);
  }, []);

  const clearError = useCallback((field) => {
    if (field) {
      setErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setErrors({});
    }
    setHasErrors(false);
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setHasErrors(false);
  }, []);

  const getError = useCallback((field) => {
    return errors[field] || null;
  }, [errors]);

  const hasFieldError = useCallback((field) => {
    return Boolean(errors[field]);
  }, [errors]);

  return {
    errors,
    hasErrors,
    setError,
    clearError,
    clearAllErrors,
    getError,
    hasFieldError
  };
};
