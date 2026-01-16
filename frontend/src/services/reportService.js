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

export const getAttendanceReport = async (params) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
};

export const getStaffAttendanceReport = async (params) => {
    const response = await api.get('/reports/staff-attendance', { params });
    return response.data;
};

export const getViolationsReport = async (params) => {
    const response = await api.get('/reports/violations', { params });
    return response.data;
};

export default {
    getGeneralReport,
    getTeacherReport,
    getStudentReport,
    getAttendanceReport,
    getStaffAttendanceReport,
    getViolationsReport
};
