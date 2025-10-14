import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TestAllPages: React.FC = () => {
  const pages = [
    { name: '测试页面', url: '/test', description: '基础功能测试' },
    { name: '主页', url: '/home', description: '轮播图和商品分类' },
    { name: '登录页面', url: '/login', description: '用户登录界面' },
    { name: '注册页面', url: '/registration', description: '用户注册界面' },
    { name: '个人信息', url: '/personal-info', description: '个人信息管理（需要登录）' },
    { name: '地址管理', url: '/address-management', description: '地址管理（需要登录）' },
    { name: '结账页面', url: '/checkout', description: '结账流程（需要登录）' },
    { name: '测试结账页面', url: '/test-checkout', description: '结账流程（无API）' },
    { name: '彩蛋页面', url: '/easter-egg', description: '多语言动画效果' },
    { name: '忘记密码', url: '/forgot-password', description: '密码重置流程' },
    { name: '管理员登录', url: '/admin-login', description: '管理员登录界面' },
    { name: '退出成功', url: '/logout-success', description: '退出登录确认' }
  ];

  const openPage = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Header />
      
      <main style={{ padding: '40px 20px' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '32px'
          }}>
            🧪 页面测试中心
          </h1>
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '40px',
            fontSize: '16px'
          }}>
            点击下方按钮测试各个页面功能
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {pages.map((page, index) => (
              <div key={index} style={{
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#fff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => openPage(page.url)}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '8px',
                  fontSize: '18px'
                }}>
                  {page.name}
                </h3>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  {page.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <code style={{
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#667eea'
                  }}>
                    {page.url}
                  </code>
                  <span style={{
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    点击测试 →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '15px' }}>⚠️ 重要提醒 - 测试模式</h3>
            <ul style={{ color: '#856404', lineHeight: '1.6' }}>
              <li><strong>只读测试</strong>：所有测试页面都不会修改任何数据</li>
              <li><strong>安全测试</strong>：表单提交、支付等操作已被禁用</li>
              <li><strong>模拟数据</strong>：使用模拟数据展示UI效果</li>
              <li><strong>功能验证</strong>：仅测试界面布局和用户交互</li>
            </ul>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>📝 测试说明</h3>
            <ul style={{ color: '#666', lineHeight: '1.6' }}>
              <li><strong>绿色标记</strong>：无需登录，可直接访问</li>
              <li><strong>API降级</strong>：部分页面会在API失败时使用模拟数据</li>
              <li><strong>功能测试</strong>：所有页面都包含完整的UI和交互</li>
              <li><strong>响应式设计</strong>：支持桌面和移动端显示</li>
            </ul>
          </div>

          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            color: '#888',
            fontSize: '14px'
          }}>
            <p>💡 提示：如果页面无法打开，请检查浏览器控制台是否有错误信息</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TestAllPages;
