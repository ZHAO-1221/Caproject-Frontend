// 调试认证状态的工具函数

export const debugAuthStatus = () => {
  console.log('=== 认证状态调试 ===');
  
  // 检查 sessionStorage 中的认证信息
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  const user = sessionStorage.getItem('user');
  const token = sessionStorage.getItem('token');
  
  console.log('isLoggedIn:', isLoggedIn);
  console.log('user:', user);
  console.log('token:', token);
  
  // 检查 localStorage 中的认证信息（如果存在）
  const localToken = localStorage.getItem('token');
  console.log('localStorage token:', localToken);
  
  // 检查当前页面URL
  console.log('current URL:', window.location.href);
  
  // 检查代理配置
  console.log('API_BASE_URL should be /api');
  
  console.log('=== 调试结束 ===');
  
  return {
    isLoggedIn,
    user: user ? JSON.parse(user) : null,
    token,
    localToken
  };
};

// 在控制台中可用的全局函数
(window as any).debugAuth = debugAuthStatus;