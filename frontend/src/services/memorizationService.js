import api from './api';

export const getMemorization = async (params) => {
    const response = await api.get('/memorization', { params });
    return response.data;
};

export const recordMemorization = async (data) => {
    const response = await api.post('/memorization', data);
    return response.data;
};

export const getStudentProgress = async (studentId) => {
    const response = await api.get(`/memorization/student/${studentId}`);
    return response.data;
};

export default {
    getMemorization,
    recordMemorization,
    getStudentProgress
};
