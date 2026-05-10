import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const patientAPI = {
  create: (data) => api.post('/patients/', data),
  getAll: () => api.get('/patients/'),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const assessmentAPI = {
  getQuestions: (type) => api.get(`/assessments/questions/${type}`),
  score: (data) => api.post('/assessments/score', data),
  getForPatient: (patientId) => api.get(`/assessments/${patientId}`),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
};

export default api;
