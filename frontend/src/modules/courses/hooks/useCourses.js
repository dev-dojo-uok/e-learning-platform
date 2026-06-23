import useCourseStore from '../store/courseStore';

/**
 * useCourses – Custom hook for the Course module.
 *
 * Acts as the single integration point between UI components and the
 * Zustand course store. Components must import this hook instead of
 * accessing the store directly, keeping the store implementation
 * decoupled from the view layer.
 *
 * Exposed state:
 *  - courses        {Array}        Full list of courses.
 *  - selectedCourse {Object|null}  Currently selected / viewed course.
 *  - loading        {boolean}      True while an async action is in flight.
 *  - error          {string|null}  Last error message; null when none.
 *
 * Exposed actions:
 *  - fetchCourses()              Loads all courses into the store.
 *  - fetchCourseById(id)         Loads a single course into selectedCourse.
 *  - createCourse(courseData)    Creates a course and appends it to the list.
 *  - updateCourse(id,courseData) Updates a course in-place.
 *  - deleteCourse(id)            Deletes a course and removes it from state.
 *
 * Usage:
 *   const { courses, loading, error, fetchCourses, createCourse } = useCourses();
 */
const useCourses = () => {
  const {
    courses,
    selectedCourse,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourseStore();

  return {
    // State
    courses,
    selectedCourse,
    loading,
    error,
    // Actions
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};

export default useCourses;
