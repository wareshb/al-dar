import api from './api';

export const getGeneralReport = async (params) => {
    const response = await api.get('/reports/general', { params });
    return response.data;
};

export const getTeacherReport = async (teacherId, params) => {
    const response = await api.get(`/reports/teacher/${teacherId}`, { params });
    return response.data;
};

export const getStudentReport = async (studentId, params) => {
    const response = await api.get(`/reports/student/${studentId}`, { params });
    return response.data;
};

export default {
    getGeneralReport,
    getTeacherReport,
    getStudentReport
};
