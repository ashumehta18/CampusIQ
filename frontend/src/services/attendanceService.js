import api from './api';

const attendanceService = {
  markBulk: (data) => api.post('/attendance/bulk', data),
  getAttendance: (params) => api.get('/attendance', { params }),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  getSummary: () => api.get('/attendance/summary'),
  getSubjectSummary: (subjectId) => api.get(`/attendance/subject-summary/${subjectId}`),
  getDates: (subjectId) => api.get(`/attendance/dates/${subjectId}`),
  update: (id, data) => api.put(`/attendance/${id}`, data),
};

export default attendanceService;
