import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    console.log('PrivateRoute - حالة المصادقة:', isAuthenticated ? 'موجود' : 'غير موجود');

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>جاري التحميل...</div>;
    }

    if (!isAuthenticated) {
        console.log('PrivateRoute - إعادة توجيه إلى Login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
