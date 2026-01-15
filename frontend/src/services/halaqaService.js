import api from './api';

export const getHalaqat = async (params) => {
    const response = await api.get('/halaqat', { params });
    return response.data;
};

export const getHalaqaById = async (id) => {
    const response = await api.get(`/halaqat/${id}`);
    return response.data;
};

export const createHalaqa = async (data) => {
    const response = await api.post('/halaqat', data);
    return response.data;
};

export const updateHalaqa = async (id, data) => {
    const response = await api.put(`/halaqat/${id}`, data);
    return response.data;
};

export const deleteHalaqa = async (id) => {
    const response = await api.delete(`/halaqat/${id}`);
    return response.data;
};

// تسجيل الطلاب في الحلقة
export const enrollStudent = async (halaqaId, studentId) => {
    const response = await api.post(`/halaqat/${halaqaId}/enroll`, {
        student_ids: [studentId]
    });
    return response.data;
};

// إزالة طالب من الحلقة
export const removeStudent = async (halaqaId, studentId) => {
    const response = await api.delete(`/halaqat/${halaqaId}/students/${studentId}`);
    return response.data;
};

export default {
    getHalaqat,
    getHalaqaById,
    createHalaqa,
    updateHalaqa,
    deleteHalaqa,
    enrollStudent,
    removeStudent
};
