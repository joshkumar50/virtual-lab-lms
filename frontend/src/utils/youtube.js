/**
 * Utility functions for YouTube video handling
 */

/**
 * Converts various YouTube URL formats to embeddable format
 * @param {string} url - YouTube URL in any format
 * @returns {string|null} - Embeddable YouTube URL or null if invalid
 */
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  // Extract video ID from various YouTube URL formats
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  let videoId = null;
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Extracts video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  return getYouTubeVideoId(url) !== null;
};

/**
 * Gets YouTube thumbnail URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Thumbnail URL or null if invalid
 */
export const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Validates if a URL is a direct image URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if it's a direct image URL
 */
export const isDirectImageUrl = (url) => {
  if (!url) return false;
  
  // Check if URL ends with common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|ico|heic|heif)(\?.*)?$/i;
  return imageExtensions.test(url);
};

/**
 * Checks if URL is a Google Images share link
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Google Images share link
 */
export const isGoogleImagesShareLink = (url) => {
  if (!url) return false;
  return url.includes('share.google') && url.includes('/images/');
};

/**
 * Validates if a URL can be used as an image source
 * @param {string} url - URL to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validateImageUrl = (url) => {
  if (!url) {
    return { isValid: false, message: 'Please enter an image URL' };
  }
  
  if (isGoogleImagesShareLink(url)) {
    return { 
      isValid: false, 
      message: 'Google Images share links are not supported. Please use a direct image URL instead.' 
    };
  }
  
  if (!isDirectImageUrl(url)) {
    return { 
      isValid: false, 
      message: 'Please use a direct image URL ending with .jpg, .png, .gif, etc.' 
    };
  }
  
  return { isValid: true, message: '' };
};
