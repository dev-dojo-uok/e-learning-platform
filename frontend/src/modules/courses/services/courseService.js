import api from '../../../lib/axios';

/**
 * Creates a new course.
 * @param {Object} courseData - The course data payload (title, description, teacherId).
 * @returns {Promise<Object>} The created course response data.
 */
export async function createCourse(courseData) {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    console.error('Course API Error:', error);
    throw error;
  }
}

/**
 * Retrieves all courses.
 * @returns {Promise<Array>} The list of courses.
 */
export async function getCourses() {
  try {
    const response = await api.get('/courses');
    return response.data;
  } catch (error) {
    console.error('Course API Error:', error);
    throw error;
  }
}

/**
 * Retrieves a single course by its ID.
 * @param {string} id - The unique identifier of the course.
 * @returns {Promise<Object>} The selected course data.
 */
export async function getCourseById(id) {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Course API Error:', error);
    throw error;
  }
}

/**
 * Updates an existing course.
 * @param {string} id - The unique identifier of the course to update.
 * @param {Object} data - The updated course fields (title, description).
 * @returns {Promise<Object>} The updated course response data.
 */
export async function updateCourse(id, data) {
  try {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Course API Error:', error);
    throw error;
  }
}

/**
 * Deletes a course by its ID.
 * @param {string} id - The unique identifier of the course to delete.
 * @returns {Promise<Object>} The delete confirmation response.
 */
export async function deleteCourse(id) {
  try {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Course API Error:', error);
    throw error;
  }
}

const courseService = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};

export default courseService;
