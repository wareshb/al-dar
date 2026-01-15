import api from './api';

// الحصول على جميع المعلمين
export const getAllTeachers = async () => {
    const response = await api.get('/teachers');
    return response.data;
};

// الحصول على معلم واحد
export const getTeacher = async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
};

// إضافة معلم
export const createTeacher = async (data) => {
    const response = await api.post('/teachers', data);
    return response.data;
};

// تحديث معلم
export const updateTeacher = async (id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
};

// حذف معلم
export const deleteTeacher = async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
};

// الحصول على حلقات المعلم
export const getTeacherHalaqat = async (id) => {
    const response = await api.get(`/teachers/${id}/halaqat`);
    return response.data;
};

export default {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherHalaqat
};
