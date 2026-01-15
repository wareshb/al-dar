import api from './api';

// تقرير شامل عن الطلاب
export const getStudentsReport = async () => {
    const response = await api.get('/reports/students');
    return response.data;
};

// تقرير الحضور
export const getAttendanceReport = async (params) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
};

// تقرير الحفظ
export const getMemorizationReport = async (params) => {
    const response = await api.get('/reports/memorization', { params });
    return response.data;
};

// تقرير الحلقات
export const getHalaqatReport = async () => {
    const response = await api.get('/reports/halaqat');
    return response.data;
};

export default {
    getStudentsReport,
    getAttendanceReport,
    getMemorizationReport,
    getHalaqatReport
};
