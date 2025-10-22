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
