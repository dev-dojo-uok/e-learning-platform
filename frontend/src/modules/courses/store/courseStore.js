import { create } from 'zustand';
import courseService from '../services/courseService';
import { getCourseThumbnail } from '../utils/thumbnailMapper';

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
 *
 * Note: The backend (Prisma/PostgreSQL) returns `id` not `_id`.
 * We normalize every course object to always expose `_id` so UI
 * components work consistently regardless of backend type.
 */

/**
 * Normalise a single course object from the backend.
 * Adds `_id` alias for `id` so UI components (CourseCard, CourseTable)
 * that reference `course._id` work correctly.
 */
const normalizeCourse = (course) => {
  if (!course) return course;

  let thumbnail = course.thumbnail;
  let description = course.description || '';

  // Parse and extract the thumbnail from the comment tag in the description
  const match = description.match(/<!--thumbnail: (.*?)-->/);
  if (match) {
    const val = match[1];
    thumbnail = val.startsWith('data:image') ? val : `/course-thumbnails/${val}.jpg`;
    description = description.replace(/<!--thumbnail: (.*?)-->/, '').trim();
  }

  return {
    ...course,
    _id: course.id,
    description: description,
    thumbnail: thumbnail || getCourseThumbnail({ ...course, description }),
  };
};

/**
 * Extract a human-readable error message from an axios error.
 * Handles both { message } and express-validator { errors: [] } shapes.
 */
const extractErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  // express-validator validation error array
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }
  return data.message || data.error || error.message || fallback;
};

const useCourseStore = create((set) => ({
  // -------------Initial State ------------------------------------------------------------
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,

  // ----------------- Actions ----------------------------------------------------------------

  /**
   * fetchCourses
   * Fetches all courses from the backend and stores them in state.
   */
  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await courseService.getCourses();
      set({ courses: (data || []).map(normalizeCourse) });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to fetch courses.') });
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
      set({ selectedCourse: normalizeCourse(data) });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to fetch course.') });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * createCourse
   * Sends a new course payload to the backend and appends the returned
   * course object to the local courses list.
   * @param {Object} courseData - Course fields (title, description, teacherId).
   */
  createCourse: async (courseData) => {
    set({ loading: true, error: null });
    try {
      const newCourse = normalizeCourse(await courseService.createCourse(courseData));
      set((state) => ({ courses: [...state.courses, newCourse] }));
      return newCourse;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to create course.');
      set({ error: message });
      throw new Error(message);
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
      const updatedCourse = normalizeCourse(await courseService.updateCourse(id, courseData));
      set((state) => ({
        courses: state.courses.map((course) =>
          course._id === id ? updatedCourse : course
        ),
        // Keep selectedCourse in sync if it is the course being updated
        selectedCourse:
          state.selectedCourse?._id === id ? updatedCourse : state.selectedCourse,
      }));
      return updatedCourse;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to update course.');
      set({ error: message });
      throw new Error(message);
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
      const message = extractErrorMessage(error, 'Failed to delete course.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCourseStore;
