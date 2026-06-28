import { create } from 'zustand';
import completionService from '../services/completionService';

const extractErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }
  return data.message || data.error || error.message || fallback;
};

const useCompletionStore = create((set) => ({
  progressData: null,
  isLoading: false,
  error: null,

  fetchCourseProgress: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await completionService.getCourseProgress(courseId);
      set({ progressData: data });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to fetch course progress.') });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useCompletionStore;
