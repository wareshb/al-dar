import api from './api';

// الحصول على جميع الحلقات
export const getAllHalaqat = async () => {
    const response = await api.get('/halaqat');
    return response.data;
};

// الحصول على حلقة واحدة
export const getHalaqa = async (id) => {
    const response = await api.get(`/halaqat/${id}`);
    return response.data;
};

// إنشاء حلقة
export const createHalaqa = async (data) => {
    const response = await api.post('/halaqat', data);
    return response.data;
};

// تحديث حلقة
export const updateHalaqa = async (id, data) => {
    const response = await api.put(`/halaqat/${id}`, data);
    return response.data;
};

// حذف حلقة
export const deleteHalaqa = async (id) => {
    const response = await api.delete(`/halaqat/${id}`);
    return response.data;
};

// إضافة طلاب إلى الحلقة
export const enrollStudents = async (halaqaId, studentIds) => {
    const response = await api.post(`/halaqat/${halaqaId}/enroll`, {
        student_ids: studentIds
    });
    return response.data;
};

// إزالة طالب من الحلقة
export const removeStudent = async (halaqaId, studentId) => {
    const response = await api.delete(`/halaqat/${halaqaId}/students/${studentId}`);
    return response.data;
};

// تحديث جدول الحلقة
export const updateSchedules = async (halaqaId, schedules) => {
    const response = await api.put(`/halaqat/${halaqaId}/schedules`, { schedules });
    return response.data;
};

export default {
    getAllHalaqat,
    getHalaqa,
    createHalaqa,
    updateHalaqa,
    deleteHalaqa,
    enrollStudents,
    removeStudent,
    updateSchedules
};
