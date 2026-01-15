import api from './api';

// إحصائيات لوحة التحكم
export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

// بيانات رسم بياني للحضور
export const getAttendanceChart = async () => {
    const response = await api.get('/dashboard/charts/attendance');
    return response.data;
};

// بيانات رسم بياني للحفظ
export const getMemorizationChart = async () => {
    const response = await api.get('/dashboard/charts/memorization');
    return response.data;
};

export default {
    getDashboardStats,
    getAttendanceChart,
    getMemorizationChart
};
