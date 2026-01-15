import api from './api';

export const recordStaffAttendance = async (data) => {
    const response = await api.post('/staff-attendance', data);
    return response.data;
};

export const getStaffAttendanceByDate = async (date) => {
    const response = await api.get(`/staff-attendance/date/${date}`);
    return response.data;
};

export const getTeacherAttendance = async (teacherId, params) => {
    const response = await api.get(`/staff-attendance/teacher/${teacherId}`, { params });
    return response.data;
};

export const getStaffAbsentReport = async (params) => {
    const response = await api.get('/staff-attendance/report/absent', { params });
    return response.data;
};

export const updateStaffAttendance = async (id, data) => {
    const response = await api.put(`/staff-attendance/${id}`, data);
    return response.data;
};

export default {
    recordStaffAttendance,
    getStaffAttendanceByDate,
    getTeacherAttendance,
    getStaffAbsentReport,
    updateStaffAttendance
};
