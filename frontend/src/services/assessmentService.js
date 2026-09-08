import api from './api';

const assessmentService = {
  getBySubject: (subjectId, params) => api.get('/assessments', { params: { subjectId, ...params } }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
};

export default assessmentService;
