import api from './api';

// الحصول على جميع الطلاب
export const getAllStudents = async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
};

// الحصول على طالب واحد
export const getStudent = async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
};

// إضافة طالب
export const createStudent = async (data) => {
    const response = await api.post('/students', data);
    return response.data;
};

// تحديث طالب
export const updateStudent = async (id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
};

// حذف طالب
export const deleteStudent = async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};

export default {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
};
