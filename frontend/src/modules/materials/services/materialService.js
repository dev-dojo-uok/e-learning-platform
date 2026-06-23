import api from '../../../lib/axios';

/**
 * Retrieves all materials belonging to a specific module (section).
 * @param {string} moduleId - The unique identifier of the module.
 * @returns {Promise<Array>} The list of materials.
 */
export async function getMaterialsByModule(moduleId) {
  try {
    const response = await api.get(`/materials/module/${moduleId}`);
    return response.data;
  } catch (error) {
    console.error('Material API Error:', error);
    throw error;
  }
}

/**
 * Uploads a material (handles both multipart/form-data files and JSON metadata).
 * @param {FormData} formData - The FormData containing file and metadata.
 * @param {Function} onUploadProgress - Callback for tracking file upload progress.
 * @returns {Promise<Object>} The created material.
 */
export async function uploadMaterial(formData, onUploadProgress) {
  try {
    const response = await api.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error('Material API Error:', error);
    throw error;
  }
}

/**
 * Deletes a material by its ID.
 * @param {string} id - The unique identifier of the material to delete.
 * @returns {Promise<Object>} Delete confirmation response.
 */
export async function deleteMaterial(id) {
  try {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  } catch (error) {
    console.error('Material API Error:', error);
    throw error;
  }
}

const materialService = {
  getMaterialsByModule,
  uploadMaterial,
  deleteMaterial,
};

export default materialService;
