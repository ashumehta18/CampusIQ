import api from './api';

const subjectService = {
  getAll: (params) => api.get('/subjects', { params }),
  getMySubjects: () => api.get('/subjects/my'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
};

export default subjectService;
