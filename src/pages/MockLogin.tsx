import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MockLogin: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 模拟登录成功，设置登录状态
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('user', JSON.stringify({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'user'
    }));

    // 显示成功消息
    alert('模拟登录成功！现在可以访问需要登录的页面了。');

    // 跳转到个人信息页面
    navigate('/personal-info');
  }, [navigate]);

  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>正在模拟登录...</h2>
      <p>请稍候，即将跳转到个人信息页面。</p>
    </div>
  );
};

export default MockLogin;
