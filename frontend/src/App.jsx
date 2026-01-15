import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Teachers from './pages/Teachers/Teachers';
import Students from './pages/Students/Students';
import Halaqat from './pages/Halaqat/Halaqat';
import Attendance from './pages/Attendance/Attendance';
import StaffAttendance from './pages/StaffAttendance/StaffAttendance';
import Memorization from './pages/Memorization/Memorization';
import Violations from './pages/Violations/Violations';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';

// مكون لمنع الوصول لصفحة تسجيل الدخول إذا كان المستخدم مسجلاً بالفعل
const LoginWrapper = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
};

function App() {
  return (
    <ConfigProvider
      locale={arEG}
      direction="rtl"
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* مسار تسجيل الدخول */}
            <Route path="/login" element={<LoginWrapper />} />

            {/* المسارات المحمية */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Teachers />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Students />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/halaqat"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Halaqat />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Attendance />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/staff-attendance"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <StaffAttendance />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/memorization"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Memorization />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/violations"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Violations />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute roles={['admin']}>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* إعادة توجيه لأي مسار غير موجود */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
