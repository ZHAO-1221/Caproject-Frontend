import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 测试页面成功！
      </h1>
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <strong style={{ color: '#856404' }}>⚠️ 测试模式提醒</strong>
        <p style={{ color: '#856404', margin: '5px 0 0 0', fontSize: '14px' }}>
          所有测试页面都是只读的，不会修改任何数据
        </p>
      </div>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        如果你能看到这个页面，说明React应用正在正常运行。
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>✅ 状态检查</h2>
        <ul style={{ textAlign: 'left', color: '#555' }}>
          <li>✅ React 应用运行正常</li>
          <li>✅ 路由系统工作正常</li>
          <li>✅ 组件渲染成功</li>
          <li>✅ 样式加载正常</li>
        </ul>
        <p style={{ marginTop: '20px', color: '#888' }}>
          现在你可以访问其他页面了！
        </p>
      </div>
    </div>
  );
};

export default TestPage;
