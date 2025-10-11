// 网络请求调试工具

export const logNetworkRequest = (config: any) => {
  console.log('=== 网络请求调试 ===');
  console.log('请求方法:', config.method?.toUpperCase());
  console.log('请求URL:', config.url);
  console.log('请求参数:', config.params);
  console.log('请求头:', config.headers);
  console.log('请求数据:', config.data);
  console.log('完整配置:', config);
};

export const logNetworkResponse = (response: any) => {
  console.log('=== 网络响应调试 ===');
  console.log('响应状态:', response.status);
  console.log('响应状态文本:', response.statusText);
  console.log('响应头:', response.headers);
  console.log('响应数据:', response.data);
  console.log('完整响应:', response);
};

export const logNetworkError = (error: any) => {
  console.log('=== 网络错误调试 ===');
  console.log('错误对象:', error);
  console.log('错误消息:', error.message);
  console.log('错误代码:', error.code);
  
  if (error.response) {
    console.log('错误响应状态:', error.response.status);
    console.log('错误响应数据:', error.response.data);
    console.log('错误响应头:', error.response.headers);
  }
  
  if (error.request) {
    console.log('请求对象:', error.request);
  }
  
  console.log('完整错误:', error);
};

// 在控制台中可用的全局函数
(window as any).logNetworkRequest = logNetworkRequest;
(window as any).logNetworkResponse = logNetworkResponse;
(window as any).logNetworkError = logNetworkError;
