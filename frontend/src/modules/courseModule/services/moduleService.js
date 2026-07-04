import api from '../../../lib/axios';

/**
 * Retrieves all modules belonging to a specific course.
 * @param {string} courseId - The unique identifier of the course.
 * @returns {Promise<Array>} The list of modules.
 */
export async function getModulesByCourse(courseId) {
  try {
    const response = await api.get(`/modules/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Module API Error:', error);
    throw error;
  }
}

/**
 * Creates a new module.
 * @param {Object} moduleData - The module data payload.
 * @returns {Promise<Object>} The created module response data.
 */
export async function createModule(moduleData) {
  try {
    // Map order to sortOrder
    const payload = {
      courseId: moduleData.courseId,
      title: moduleData.title,
      sortOrder: Number(moduleData.order),
    };
    const response = await api.post('/modules', payload);
    return response.data;
  } catch (error) {
    console.error('Module API Error:', error);
    throw error;
  }
}

/**
 * Updates an existing module.
 * @param {string} id - The unique identifier of the module to update.
 * @param {Object} moduleData - The updated module fields.
 * @returns {Promise<Object>} The updated module response data.
 */
export async function updateModule(id, moduleData) {
  try {
    // Map order to sortOrder
    const payload = {};
    if (moduleData.title !== undefined) payload.title = moduleData.title;
    if (moduleData.order !== undefined) payload.sortOrder = Number(moduleData.order);
    
    const response = await api.put(`/modules/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Module API Error:', error);
    throw error;
  }
}

/**
 * Deletes a module by its ID.
 * @param {string} id - The unique identifier of the module to delete.
 * @returns {Promise<Object>} The delete confirmation response.
 */
export async function deleteModule(id) {
  try {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
  } catch (error) {
    console.error('Module API Error:', error);
    throw error;
  }
}

const moduleService = {
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule,
};

export default moduleService;
