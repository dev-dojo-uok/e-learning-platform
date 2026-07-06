import api from '../../../lib/axios';

const completionService = {
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/completion/course/${courseId}/progress`);
    return response.data;
  },
};

export default completionService;
