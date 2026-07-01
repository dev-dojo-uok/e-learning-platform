import api from '@/lib/axios';
import useAuthStore from '@/store/useAuthStore';

/**
 * Enrolls the currently authenticated student in a course.
 * @param {string} courseId - The unique identifier of the course to enroll in.
 * @returns {Promise<Object>} The created enrollment response data.
 */
export async function enrollStudent(courseId) {
  try {
    const user = useAuthStore.getState().user;
    if (!user || !user.id) {
      throw new Error('User must be logged in to enroll.');
    }
    const response = await api.post('/enrollments', {
      studentId: user.id,
      courseId,
    });
    return response.data;
  } catch (error) {
    console.error('Enrollment API Error:', error);
    throw error;
  }
}

/**
 * Retrieves all courses enrolled by the currently authenticated student.
 * @returns {Promise<Array>} The list of student enrollments.
 */
export async function getMyEnrollments() {
  try {
    const user = useAuthStore.getState().user;
    if (!user || !user.id) {
      throw new Error('User must be logged in to get enrollments.');
    }
    const response = await api.get(`/students/${user.id}/courses`);
    return response.data;
  } catch (error) {
    console.error('Enrollment API Error:', error);
    throw error;
  }
}

/**
 * Retrieves all students enrolled in a specific course.
 * @param {string} courseId - The unique identifier of the course.
 * @returns {Promise<Array>} The list of students enrolled in the course.
 */
export async function getCourseStudents(courseId) {
  try {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
  } catch (error) {
    console.error('Enrollment API Error:', error);
    throw error;
  }
}

/**
 * Removes an existing enrollment.
 * @param {string} enrollmentId - The unique identifier of the enrollment to delete.
 * @returns {Promise<Object>} The deletion confirmation response.
 */
export async function removeEnrollment(enrollmentId) {
  try {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  } catch (error) {
    console.error('Enrollment API Error:', error);
    throw error;
  }
}

const enrollmentService = {
  enrollStudent,
  getMyEnrollments,
  getCourseStudents,
  removeEnrollment,
};

export default enrollmentService;
