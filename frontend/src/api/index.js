import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = axios.create({ baseURL: BASE });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export const fetchCourses = async () => {
  const res = await API.get('/api/courses');
  return res.data;
};

export const fetchCourse = async (id) => {
  const res = await API.get(`/api/courses/${id}`);
  return res.data;
};

export const createCourse = async (courseData) => {
  const res = await API.post('/api/courses', courseData);
  return res.data;
};

export const updateCourse = async (id, courseData) => {
  const res = await API.put(`/api/courses/${id}`, courseData);
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await API.delete(`/api/courses/${id}`);
  return res.data;
};

export const addAssignment = async (courseId, assignmentData) => {
  const res = await API.post(`/api/courses/${courseId}/assignments`, assignmentData);
  return res.data;
};

export const submitAssignment = async (courseId, submissionData) => {
  const res = await API.post(`/api/courses/${courseId}/submissions`, submissionData);
  return res.data;
};

export const gradeSubmission = async (courseId, submissionId, gradeData) => {
  const res = await API.post(`/api/courses/${courseId}/submissions/${submissionId}/grade`, gradeData);
  return res.data;
};

export default API;

