import useCourseStore from '../store/courseStore';

export default function useCourses() {
  const { 
    courses, 
    selectedCourse, 
    loading, 
    error,
    setCourses,
    setSelectedCourse,
    setLoading,
    setError
  } = useCourseStore();

  // Placeholder actions for future backend integration
  const fetchCourses = async () => {};
  const fetchCourseById = async (id) => {};
  const createCourse = async (courseData) => {};
  const updateCourse = async (id, courseData) => {};
  const deleteCourse = async (id) => {};

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
