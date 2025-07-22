import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Changez l’URL selon backend
  timeout: 5000,
});

export const fetchQuizzes = () => api.get('/quizzes/');
export const fetchQuizById = (id) => api.get(`/quizzes/${id}/`);
export const uploadDocument = (formData) => api.post('/document/upload/', formData);
export const patchReponse = (id, data) => api.patch(`/reponses/${id}/`, data);

export default api;
