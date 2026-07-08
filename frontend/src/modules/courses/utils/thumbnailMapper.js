/**
 * Map course titles and categories to local static thumbnail image paths.
 * 
 * @param {Object} course The course data object
 * @returns {string|null} Path to the thumbnail image, or null if no mapping fits.
 */
export const getCourseThumbnail = (course) => {
  if (!course) return null;

  // Use existing thumbnail if provided by backend (safety check)
  if (course.thumbnail) {
    return course.thumbnail;
  }

  const title = (course.title || '').toLowerCase();
  const category = (course.category || '').toLowerCase();

  // Mapping rules based on keywords in title or category
  if (title.includes('react')) {
    return '/course-thumbnails/react.jpg';
  }
  if (title.includes('database') || title.includes('sql') || title.includes('nosql') || category.includes('database')) {
    return '/course-thumbnails/database.jpg';
  }
  if (title.includes('web') || title.includes('frontend') || title.includes('html') || title.includes('css') || category.includes('web')) {
    return '/course-thumbnails/web-development.jpg';
  }
  if (title.includes('cybersecurity') || title.includes('security') || title.includes('network') || category.includes('security')) {
    return '/course-thumbnails/cybersecurity.jpg';
  }
  if (title.includes('data science') || title.includes('data') || title.includes('python') || title.includes('machine learning') || category.includes('data')) {
    return '/course-thumbnails/data-science.jpg';
  }
  if (title.includes('ui') || title.includes('ux') || title.includes('design') || category.includes('design')) {
    return '/course-thumbnails/ui-ux.jpg';
  }
  if (title.includes('programming') || title.includes('software') || title.includes('architecture') || title.includes('code') || category.includes('programming')) {
    return '/course-thumbnails/programming.jpg';
  }

  return null;
};
