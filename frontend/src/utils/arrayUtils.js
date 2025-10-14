// Safe array operations utility to prevent future errors

/**
 * Safely maps over an array, returns empty array if input is not an array
 * @param {Array} array - The array to map over
 * @param {Function} callback - The mapping function
 * @returns {Array} - Mapped array or empty array
 */
export const safeMap = (array, callback) => {
  if (!Array.isArray(array)) return [];
  try {
    return array.map(callback);
  } catch (error) {
    console.warn('Error in safeMap:', error);
    return [];
  }
};

/**
 * Safely filters an array, returns empty array if input is not an array
 * @param {Array} array - The array to filter
 * @param {Function} callback - The filter function
 * @returns {Array} - Filtered array or empty array
 */
export const safeFilter = (array, callback) => {
  if (!Array.isArray(array)) return [];
  try {
    return array.filter(callback);
  } catch (error) {
    console.warn('Error in safeFilter:', error);
    return [];
  }
};

/**
 * Safely finds an item in an array, returns null if not found or input is not an array
 * @param {Array} array - The array to search
 * @param {Function} callback - The find function
 * @returns {*} - Found item or null
 */
export const safeFind = (array, callback) => {
  if (!Array.isArray(array)) return null;
  try {
    return array.find(callback) || null;
  } catch (error) {
    console.warn('Error in safeFind:', error);
    return null;
  }
};

/**
 * Safely reduces an array, returns initial value if input is not an array
 * @param {Array} array - The array to reduce
 * @param {Function} callback - The reduce function
 * @param {*} initialValue - Initial value for reduce
 * @returns {*} - Reduced value or initial value
 */
export const safeReduce = (array, callback, initialValue = 0) => {
  if (!Array.isArray(array)) return initialValue;
  try {
    return array.reduce(callback, initialValue);
  } catch (error) {
    console.warn('Error in safeReduce:', error);
    return initialValue;
  }
};

/**
 * Safely gets array length, returns 0 if not an array
 * @param {Array} array - The array to get length of
 * @returns {number} - Array length or 0
 */
export const safeLength = (array) => {
  return Array.isArray(array) ? array.length : 0;
};

/**
 * Safely slices an array, returns empty array if input is not an array
 * @param {Array} array - The array to slice
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {Array} - Sliced array or empty array
 */
export const safeSlice = (array, start = 0, end) => {
  if (!Array.isArray(array)) return [];
  try {
    return array.slice(start, end);
  } catch (error) {
    console.warn('Error in safeSlice:', error);
    return [];
  }
};

/**
 * Safely checks if array has items
 * @param {Array} array - The array to check
 * @returns {boolean} - True if array has items, false otherwise
 */
export const hasItems = (array) => {
  return Array.isArray(array) && array.length > 0;
};

/**
 * Safely gets first item from array
 * @param {Array} array - The array to get first item from
 * @returns {*} - First item or null
 */
export const safeFirst = (array) => {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[0];
};

/**
 * Safely gets last item from array
 * @param {Array} array - The array to get last item from
 * @returns {*} - Last item or null
 */
export const safeLast = (array) => {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[array.length - 1];
};

/**
 * Safely flattens an array
 * @param {Array} array - The array to flatten
 * @param {number} depth - Flatten depth (default: 1)
 * @returns {Array} - Flattened array or empty array
 */
export const safeFlatMap = (array, callback) => {
  if (!Array.isArray(array)) return [];
  try {
    return array.flatMap(callback);
  } catch (error) {
    console.warn('Error in safeFlatMap:', error);
    return [];
  }
};

/**
 * Safely creates a Set from array values
 * @param {Array} array - The array to create Set from
 * @returns {Set} - Set of unique values or empty Set
 */
export const safeSet = (array) => {
  if (!Array.isArray(array)) return new Set();
  try {
    return new Set(array);
  } catch (error) {
    console.warn('Error in safeSet:', error);
    return new Set();
  }
};

/**
 * Safely creates array from Set
 * @param {Set} set - The Set to convert to array
 * @returns {Array} - Array from Set or empty array
 */
export const setToArray = (set) => {
  if (!(set instanceof Set)) return [];
  try {
    return Array.from(set);
  } catch (error) {
    console.warn('Error in setToArray:', error);
    return [];
  }
};
