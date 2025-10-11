import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import ForgotPassword from '../pages/ForgotPassword';
import PasswordResetConfirmation from '../pages/PasswordResetConfirmation';
import PersonalInfo from '../pages/PersonalInfo';
import AddressManagement from '../pages/AddressManagement';
import AdminLogin from '../pages/AdminLogin';
import LogoutSuccess from '../pages/LogoutSuccess';
import EasterEgg from '../pages/EasterEgg';

// 路由保护组件 - 检查用户是否已登录
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// 管理员路由保护组件
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  return token && userRole === 'admin' ? children : <Navigate to="/login" replace />;
};

// 已登录用户重定向组件
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/personal-info" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 公开路由 - 未登录用户可访问 */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/registration" 
        element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/password-reset-confirmation" 
        element={
          <PublicRoute>
            <PasswordResetConfirmation />
          </PublicRoute>
        } 
      />
      
      {/* 管理员路由 */}
      <Route 
        path="/admin-login" 
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } 
      />
      
      {/* 受保护的用户路由 */}
      <Route 
        path="/personal-info" 
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/address-management" 
        element={
          <ProtectedRoute>
            <AddressManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* 特殊路由 */}
      <Route path="/logout-success" element={<LogoutSuccess />} />
      <Route path="/easter-egg" element={<EasterEgg />} />
      
      {/* 默认路由 */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 404 路由 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
