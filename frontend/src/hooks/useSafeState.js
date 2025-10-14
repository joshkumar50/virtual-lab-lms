import { useState, useCallback } from 'react';

/**
 * Safe useState hook that prevents errors from invalid state updates
 * @param {*} initialState - Initial state value
 * @returns {[*, Function]} - State and setter function
 */
export const useSafeState = (initialState) => {
  const [state, setState] = useState(initialState);

  const safeSetState = useCallback((newState) => {
    try {
      // If newState is a function, call it with current state
      if (typeof newState === 'function') {
        setState(prevState => {
          try {
            return newState(prevState);
          } catch (error) {
            console.warn('Error in state update function:', error);
            return prevState; // Return previous state on error
          }
        });
      } else {
        setState(newState);
      }
    } catch (error) {
      console.warn('Error setting state:', error);
    }
  }, []);

  return [state, safeSetState];
};

/**
 * Safe useState for arrays with built-in array operations
 * @param {Array} initialState - Initial array state
 * @returns {[Array, Object]} - State and safe array operations
 */
export const useSafeArrayState = (initialState = []) => {
  const [array, setArray] = useState(Array.isArray(initialState) ? initialState : []);

  const safeSetArray = useCallback((newArray) => {
    try {
      if (typeof newArray === 'function') {
        setArray(prevArray => {
          try {
            const result = newArray(prevArray);
            return Array.isArray(result) ? result : prevArray;
          } catch (error) {
            console.warn('Error in array update function:', error);
            return prevArray;
          }
        });
      } else {
        setArray(Array.isArray(newArray) ? newArray : []);
      }
    } catch (error) {
      console.warn('Error setting array state:', error);
    }
  }, []);

  const safePush = useCallback((item) => {
    safeSetArray(prev => [...prev, item]);
  }, [safeSetArray]);

  const safeRemove = useCallback((index) => {
    safeSetArray(prev => prev.filter((_, i) => i !== index));
  }, [safeSetArray]);

  const safeUpdate = useCallback((index, item) => {
    safeSetArray(prev => prev.map((el, i) => i === index ? item : el));
  }, [safeSetArray]);

  const safeClear = useCallback(() => {
    safeSetArray([]);
  }, [safeSetArray]);

  return [
    array,
    {
      setArray: safeSetArray,
      push: safePush,
      remove: safeRemove,
      update: safeUpdate,
      clear: safeClear
    }
  ];
};

/**
 * Safe useState for objects with built-in object operations
 * @param {Object} initialState - Initial object state
 * @returns {[Object, Object]} - State and safe object operations
 */
export const useSafeObjectState = (initialState = {}) => {
  const [object, setObject] = useState(typeof initialState === 'object' && initialState !== null ? initialState : {});

  const safeSetObject = useCallback((newObject) => {
    try {
      if (typeof newObject === 'function') {
        setObject(prevObject => {
          try {
            const result = newObject(prevObject);
            return typeof result === 'object' && result !== null ? result : prevObject;
          } catch (error) {
            console.warn('Error in object update function:', error);
            return prevObject;
          }
        });
      } else {
        setObject(typeof newObject === 'object' && newObject !== null ? newObject : {});
      }
    } catch (error) {
      console.warn('Error setting object state:', error);
    }
  }, []);

  const safeUpdate = useCallback((key, value) => {
    safeSetObject(prev => ({ ...prev, [key]: value }));
  }, [safeSetObject]);

  const safeRemove = useCallback((key) => {
    safeSetObject(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  }, [safeSetObject]);

  const safeClear = useCallback(() => {
    safeSetObject({});
  }, [safeSetObject]);

  return [
    object,
    {
      setObject: safeSetObject,
      update: safeUpdate,
      remove: safeRemove,
      clear: safeClear
    }
  ];
};
