import api from './api';

export const getAttendance = async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
};

export const recordAttendance = async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
};

export const getHalaqaAttendance = async (halaqaId, date) => {
    const response = await api.get(`/attendance/halaqa/${halaqaId}`, { params: { date } });
    return response.data;
};

export const getAttendanceByDate = async (date) => {
    const response = await api.get(`/attendance/date/${date}`);
    return response.data;
};

export const getStudentAttendance = async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
};

export const updateAttendance = async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
};

export default {
    getAttendance,
    recordAttendance,
    getHalaqaAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    updateAttendance
};
