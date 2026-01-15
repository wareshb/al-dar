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

export default {
    getAttendance,
    recordAttendance,
    getHalaqaAttendance
};
