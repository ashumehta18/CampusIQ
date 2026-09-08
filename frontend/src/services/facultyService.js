import api from './api';

const facultyService = {
  getMyProfile: () => api.get('/faculty/profile'),
  updateMyProfile: (data) => api.put('/faculty/profile', data),
  getAllFaculty: (params) => api.get('/faculty', { params }),
  getFacultyById: (id) => api.get(`/faculty/${id}`),
  createFacultyProfile: (data) => api.post('/faculty', data),
  updateFacultyById: (id, data) => api.put(`/faculty/${id}`, data),
};

export default facultyService;
