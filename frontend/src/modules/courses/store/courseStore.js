import { create } from 'zustand';

const useCourseStore = create((set) => ({
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,

  // Setter helpers (no API actions implemented yet)
  setCourses: (courses) => set({ courses }),
  setSelectedCourse: (selectedCourse) => set({ selectedCourse }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearStore: () => set({ courses: [], selectedCourse: null, loading: false, error: null }),
}));

export default useCourseStore;
