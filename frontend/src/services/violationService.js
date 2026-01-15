import api from './api';

export const getViolations = async (params) => {
    const response = await api.get('/violations', { params });
    return response.data;
};

export const recordViolation = async (data) => {
    const response = await api.post('/violations', data);
    return response.data;
};

export const deleteViolation = async (id) => {
    const response = await api.delete(`/violations/${id}`);
    return response.data;
};

export default {
    getViolations,
    recordViolation,
    deleteViolation
};
