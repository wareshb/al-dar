import axios from 'axios';

// إنشاء نسخة Axios مخصصة
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// إضافة Token إلى كل طلب
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// معالجة الأخطاء
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // إذا كان الخطأ 401 (غير مصرح) ولم يكن المسار هو تسجيل الدخول
        if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
            console.log('Session expired or unauthorized, redirecting to login...');
            // انتهت صلاحية الجلسة
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
