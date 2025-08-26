import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  timeout: 5000,
});

// Interceptor pour ajouter le token dans le header Authorization
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // récupère le token stocké
  if (token) {
    config.headers.Authorization = `Token ${token}`; // ajoute le header Authorization
  }
  return config;
}, error => Promise.reject(error));

// Export des fonctions API
export const fetchQuizzes = () => api.get('/quizzes/');
export const fetchQuizById = (id) => api.get(`/quizzes/${id}/`);
export const uploadDocument = (formData) => api.post('/document/upload/', formData);
export const patchReponse = (id, data) => api.patch(`/reponses/${id}/`, data);

export default api;
