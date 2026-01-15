import api from './api';

// تسجيل الدخول
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

// الحصول على بيانات المستخدم الحالي
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// تغيير كلمة المرور
export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
    });
    return response.data;
};

export default {
    login,
    getCurrentUser,
    changePassword
};
