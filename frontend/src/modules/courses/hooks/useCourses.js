import useCourseStore from '../store/courseStore';

export default function useCourses() {
  const {
    courses,
    selectedCourse,
    loading,
    error,
  } = useCourseStore();

  // Placeholder actions for future backend integration
  const fetchCourses = async () => {};
  const fetchCourseById = async () => {};
  const createCourse = async () => {};
  const updateCourse = async () => {};
  const deleteCourse = async () => {};

  return {
    courses,
    selectedCourse,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse
  };
}
