import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import ForgotPassword from '../pages/ForgotPassword';
import PasswordResetConfirmation from '../pages/PasswordResetConfirmation';
import PersonalInfo from '../pages/PersonalInfo';
import AddressManagement from '../pages/AddressManagement';
import OrderHistory from '../pages/OrderHistory';
import OrderDetails from '../pages/OrderDetails';
import ProductReview from '../pages/ProductReview';
import ProductBrowse from '../pages/ProductBrowse';
import ProductDetail from '../pages/ProductDetail';
import ProductReviewsList from '../pages/ProductReviewsList';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';
import HomePage from '../pages/HomePage';
import AdminLogin from '../pages/AdminLogin';
import LogoutSuccess from '../pages/LogoutSuccess';
import EasterEgg from '../pages/EasterEgg';
import ProductManagement from '../pages/ProductManagement';
import ProductEdit from '../pages/ProductEdit';
import ProductCreate from '../pages/ProductCreate';

// 路由保护组件 - 检查用户是否已登录
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// 管理员路由保护组件
const AdminRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const user = sessionStorage.getItem('user');
  const userRole = user ? JSON.parse(user).role : null;
  return isLoggedIn && userRole === 'admin' ? children : <Navigate to="/login" replace />;
};

// 已登录用户重定向组件
const PublicRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <Navigate to="/personal-info" replace /> : children;
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
        {/* 商品管理（管理员） */}
        <Route
            path="/product-management"
            element={<ProductManagement />}
        />
        <Route
            path="/product-edit/:productId"
            element={<ProductEdit />}
        />
        <Route
            path="/product-create"
            element={<ProductCreate />}
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
      <Route 
        path="/order-history" 
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/order-details/:orderId" 
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/product-review/:productId" 
        element={
          <ProtectedRoute>
            <ProductReview />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/products"
        element={<ProductBrowse />}
      />
      <Route
        path="/product/:productId"
        element={<ProductDetail />}
      />
      <Route
        path="/product/:productId/reviews"
        element={<ProductReviewsList />}
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment-success" 
        element={<PaymentSuccess />} 
      />
      <Route 
        path="/payment-failed" 
        element={<PaymentFailed />} 
      />
      
      {/* 特殊路由 */}
      <Route path="/logout-success" element={<LogoutSuccess />} />
      <Route path="/easter-egg" element={<EasterEgg />} />
      
      {/* 主页路由 */}
      <Route path="/home" element={<HomePage />} />
      
      {/* 默认路由 */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* 404 路由 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
