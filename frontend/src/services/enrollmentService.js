import api from './api';

const enrollmentService = {
  getAll: (params) => api.get('/enrollments', { params }),
  getStudentsBySubject: (subjectId) => api.get(`/enrollments/subject/${subjectId}`),
  create: (data) => api.post('/enrollments', data),
  deactivate: (id) => api.delete(`/enrollments/${id}`),
};

export default enrollmentService;
