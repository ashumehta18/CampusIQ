import api from './api';

const marksService = {
  enterBulk: (data) => api.post('/marks/bulk', data),
  getByAssessment: (assessmentId) => api.get('/marks', { params: { assessmentId } }),
  getMyMarks: (params) => api.get('/marks/my', { params }),
  getSummary: () => api.get('/marks/summary'),
  getSubjectSummary: (subjectId) => api.get(`/marks/subject-summary/${subjectId}`),
  update: (id, data) => api.put(`/marks/${id}`, data),
};

export default marksService;
