import { create } from 'zustand';
import materialService from '../services/materialService';

/**
 * Normalise a single material object from the backend.
 * Adds `_id` alias for `id` so UI components work consistently.
 */
const normalizeMaterial = (material) => {
  if (!material) return material;
  return { ...material, _id: material.id };
};

/**
 * Extract a human-readable error message from an axios error.
 * Handles both { message } and express-validator { errors: [] } shapes.
 */
const extractErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }
  return data.message || data.error || error.message || fallback;
};

const useMaterialStore = create((set) => ({
  // ── Initial State ────────────────────────────────────────────────────────────
  materials: [],
  loading: false,
  error: null,
  uploading: false,
  uploadProgress: 0,

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * fetchMaterials
   * Fetches all materials for a module from the backend and stores them in state.
   */
  fetchMaterials: async (moduleId) => {
    set({ loading: true, error: null });
    try {
      set({ materials: [] })
      const data = await materialService.getMaterialsByModule(moduleId);
      set({ materials: (data || []).map(normalizeMaterial) });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Failed to fetch materials.') });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * uploadMaterial
   * Sends a new material payload/file to the backend, updates progress,
   * and refreshes the local materials list.
   * @param {string} moduleId - The module ID.
   * @param {Object} materialData - Text fields: title, description, type, contentUrl, embedCode.
   * @param {File|null} file - The file to upload (optional).
   */
  uploadMaterial: async (moduleId, materialData, file = null) => {
    set({ uploading: true, uploadProgress: 0, error: null });
    try {
      const formData = new FormData();
      formData.append('sectionId', moduleId); // backend validator expects sectionId
      formData.append('title', materialData.title);
      formData.append('type', materialData.type);

      if (materialData.description) {
        formData.append('description', materialData.description);
      }

      if (file) {
        formData.append('file', file);
      } else {
        if (materialData.contentUrl) {
          formData.append('contentUrl', materialData.contentUrl);
        }
        if (materialData.embedCode) {
          formData.append('embedCode', materialData.embedCode);
        }
      }

      const rawMaterial = await materialService.uploadMaterial(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          set({ uploadProgress: percent });
        }
      });

      const newMaterial = normalizeMaterial(rawMaterial);

      // Append new material to the list
      set((state) => ({
        materials: [...state.materials, newMaterial],
      }));
      return newMaterial;
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to upload material.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ uploading: false });
    }
  },

  /**
   * removeMaterial
   * Deletes a material from the backend and filters it out of local state.
   */
  removeMaterial: async (id) => {
    set({ loading: true, error: null });
    try {
      await materialService.deleteMaterial(id);
      set((state) => ({
        materials: state.materials.filter((m) => m._id !== id),
      }));
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to delete material.');
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * clearError
   * Resets error state.
   */
  clearError: () => set({ error: null }),
}));

export default useMaterialStore;
