import api from './api';

// الحصول على جميع المخالفات
export const getAllViolations = async (params = {}) => {
    const response = await api.get('/violations', { params });
    return response.data;
};

// الحصول على مخالفة واحدة
export const getViolation = async (id) => {
    const response = await api.get(`/violations/${id}`);
    return response.data;
};

// إضافة مخالفة
export const createViolation = async (data) => {
    const response = await api.post('/violations', data);
    return response.data;
};

// تحديث مخالفة
export const updateViolation = async (id, data) => {
    const response = await api.put(`/violations/${id}`, data);
    return response.data;
};

// حذف مخالفة
export const deleteViolation = async (id) => {
    const response = await api.delete(`/violations/${id}`);
    return response.data;
};

// الحصول على مخالفات طالب
export const getStudentViolations = async (studentId) => {
    const response = await api.get(`/violations/student/${studentId}`);
    return response.data;
};

export default {
    getAllViolations,
    getViolation,
    createViolation,
    updateViolation,
    deleteViolation,
    getStudentViolations
};
