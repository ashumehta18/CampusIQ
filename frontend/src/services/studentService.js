import api from './api';

const studentService = {
  getMyProfile: () => api.get('/students/profile'),
  updateMyProfile: (data) => api.put('/students/profile', data),
  getAllStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  createStudentProfile: (data) => api.post('/students', data),
  updateStudentById: (id, data) => api.put(`/students/${id}`, data),
};

export default studentService;
