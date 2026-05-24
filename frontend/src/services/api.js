import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getHealthStatus() {
  const response = await api.get('/health');
  return response.data;
}

export async function calculateSemesterGpa(courses) {
  const response = await api.post('/gpa/semester', { courses });
  return response.data;
}

export async function getAiAcademicAnalysis(payload) {
  const response = await api.post('/ai/analysis', payload);
  return response.data;
}
