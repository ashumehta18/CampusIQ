import api from './api';

const submissionService = {
  submit: (data) => api.post('/submissions', data),
  getMySubmissions: () => api.get('/submissions/my'),
  getByAssignment: (assignmentId) => api.get('/submissions', { params: { assignmentId } }),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  update: (id, data) => api.put(`/submissions/${id}`, data),
};

export default submissionService;
