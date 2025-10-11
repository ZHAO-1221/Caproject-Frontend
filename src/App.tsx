import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import PasswordResetConfirmation from './pages/PasswordResetConfirmation';
import PersonalInfo from './pages/PersonalInfo';
import AddressManagement from './pages/AddressManagement';
import AdminLogin from './pages/AdminLogin';
import LogoutSuccess from './pages/LogoutSuccess';
import EasterEgg from './pages/EasterEgg';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset-confirmation" element={<PasswordResetConfirmation />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/address-management" element={<AddressManagement />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/logout-success" element={<LogoutSuccess />} />
          <Route path="/easter-egg" element={<EasterEgg />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
