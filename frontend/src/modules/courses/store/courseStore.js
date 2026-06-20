import { create } from 'zustand';
import courseService from '../services/courseService';

/**
 * Zustand store for the Course module.
 *
 * Handles all course-related business logic and communicates
 * exclusively with the courseService layer. UI components must
 * never call the service or the API directly.
 *
 * State shape:
 *  - courses        {Array}        List of all courses fetched from the backend.
 *  - selectedCourse {Object|null}  The currently viewed / selected course.
 *  - loading        {boolean}      True while any async operation is in flight.
 *  - error          {string|null}  Last error message; null when no error.
 */
const useCourseStore = create((set) => ({
  // ── Initial State ────────────────────────────────────────────────────────────
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * fetchCourses
   * Fetches all courses from the backend and stores them in state.
   */
  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await courseService.getCourses();
      set({ courses: data });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch courses.';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * fetchCourseById
   * Fetches a single course by ID and stores it as selectedCourse.
   * @param {string} id - The course's unique identifier.
   */
  fetchCourseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await courseService.getCourseById(id);
      set({ selectedCourse: data });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch course.';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * createCourse
   * Sends a new course payload to the backend and appends the returned
   * course object to the local courses list.
   * @param {Object} courseData - Course fields (title, description, teacherId, …).
   */
  createCourse: async (courseData) => {
    set({ loading: true, error: null });
    try {
      const newCourse = await courseService.createCourse(courseData);
      set((state) => ({ courses: [...state.courses, newCourse] }));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to create course.';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * updateCourse
   * Updates an existing course on the backend then synchronises the
   * local courses list and selectedCourse (if it is the updated course).
   * @param {string} id         - The ID of the course to update.
   * @param {Object} courseData - Updated course fields.
   */
  updateCourse: async (id, courseData) => {
    set({ loading: true, error: null });
    try {
      const updatedCourse = await courseService.updateCourse(id, courseData);
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === id ? updatedCourse : course
        ),
        // Keep selectedCourse in sync if it is the course being updated
        selectedCourse:
          state.selectedCourse?._id === id
            ? updatedCourse
            : state.selectedCourse,
      }));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update course.';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * deleteCourse
   * Deletes a course on the backend then removes it from the local
   * courses list. Clears selectedCourse if it was the deleted course.
   * @param {string} id - The ID of the course to delete.
   */
  deleteCourse: async (id) => {
    set({ loading: true, error: null });
    try {
      await courseService.deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter((course) => course._id !== id),
        // Clear selection if the deleted course was selected
        selectedCourse:
          state.selectedCourse?._id === id ? null : state.selectedCourse,
      }));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to delete course.';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCourseStore;
