import { create } from 'zustand';
import moduleService from '../services/moduleService';

/**
 * Normalise a single module object from the backend.
 * Adds `_id` alias for `id` so UI components work consistently.
 * Also reads description from local storage (or defaults to empty string)
 * since the backend schema does not store module descriptions.
 */
const normalizeModule = (module) => {
  if (!module) return module;
  const localDesc = localStorage.getItem(`module_desc_${module.id}`) || '';
  return {
    ...module,
    _id: module.id,
    order: module.sortOrder,
    description: module.description || localDesc,
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

const useModuleStore = create((set) => ({
  // ── Initial State ────────────────────────────────────────────────────────────
  modules: [],
  loading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * fetchModules
   * Fetches all modules for a course from the backend and stores them in state.
   */
  fetchModules: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const data = await moduleService.getModulesByCourse(courseId);
      set({ modules: (data || []).map(normalizeModule) });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to fetch modules.') });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * createModule
   * Sends a new module payload to the backend and refreshes/updates
   * the local modules list.
   * @param {Object} moduleData - Module fields (courseId, title, order, description).
   */
  createModule: async (moduleData) => {
    set({ loading: true, error: null });
    try {
      const newModuleRaw = await moduleService.createModule(moduleData);
      
      // Save description to localStorage
      if (moduleData.description !== undefined) {
        localStorage.setItem(`module_desc_${newModuleRaw.id}`, moduleData.description);
      }
      
      const newModule = normalizeModule(newModuleRaw);
      
      // Update state by appending and sorting by order
      set((state) => ({
        modules: [...state.modules, newModule].sort((a, b) => a.order - b.order),
      }));
      return newModule;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to create module.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * updateModule
   * Updates an existing module on the backend then synchronises the local modules list.
   * @param {string} id         - The ID of the module to update.
   * @param {Object} moduleData - Updated module fields (title, order, description).
   */
  updateModule: async (id, moduleData) => {
    set({ loading: true, error: null });
    try {
      const updatedModuleRaw = await moduleService.updateModule(id, moduleData);
      
      // Save/update description in localStorage
      if (moduleData.description !== undefined) {
        localStorage.setItem(`module_desc_${id}`, moduleData.description);
      }
      
      const updatedModule = normalizeModule(updatedModuleRaw);
      
      set((state) => ({
        modules: state.modules
          .map((m) => (m._id === id ? updatedModule : m))
          .sort((a, b) => a.order - b.order),
      }));
      return updatedModule;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to update module.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * deleteModule
   * Deletes a module on the backend then removes it from the local modules list.
   * @param {string} id - The ID of the module to delete.
   */
  deleteModule: async (id) => {
    set({ loading: true, error: null });
    try {
      await moduleService.deleteModule(id);
      
      // Clean up description from localStorage
      localStorage.removeItem(`module_desc_${id}`);
      
      set((state) => ({
        modules: state.modules.filter((m) => m._id !== id),
      }));
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to delete module.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * clearModules
   * Clears the current modules array and resets error state.
   */
  clearModules: () => {
    set({ modules: [], error: null, loading: false });
  },
}));

export default useModuleStore;
