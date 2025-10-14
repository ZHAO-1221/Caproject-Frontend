import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.11:8080/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserInfo;
}

export interface UserInfo {
  username: string;
  email: string;
  userType: number;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('=== AuthService.login 调试信息 ===');
      console.log('登录凭据:', credentials);
      console.log('请求URL:', `${API_BASE_URL}/auth/login`);
      
      const config = { headers: { 'Content-Type': 'application/json' } };
      let response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, config);
      
      console.log('登录响应:', response.data);
      
      // 如果登录成功，保存认证信息
      if (response.data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        if (response.data.token) {
          sessionStorage.setItem('token', response.data.token);
          console.log('Token已保存:', response.data.token);
        } else {
          console.warn('登录响应中没有token');
        }
        if (response.data.user) {
          // 保存基本用户信息
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('用户信息已保存:', response.data.user);
          
          // 尝试获取完整的用户信息（包含userId）
          try {
            console.log('尝试获取完整用户信息...');
            const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${response.data.token}`
              }
            });
            console.log('用户详细信息响应:', userResponse.data);
            if (userResponse.data) {
              // 合并用户信息，保留登录时的基本信息，添加完整的用户数据
              const completeUser = {
                ...response.data.user,
                userId: userResponse.data.userId,
                userPhone: userResponse.data.userPhone,
                userEmail: userResponse.data.userEmail,
                userType: userResponse.data.userType,
                userRegisterTime: userResponse.data.userRegisterTime,
                userLastLoginTime: userResponse.data.userLastLoginTime,
                userName: userResponse.data.userName,
                userGender: userResponse.data.userGender,
                userBirthday: userResponse.data.userBirthday,
                userIntroduce: userResponse.data.userIntroduce,
                userProfileUrl: userResponse.data.userProfileUrl,
                wallet: userResponse.data.wallet
              };
              sessionStorage.setItem('user', JSON.stringify(completeUser));
            }
          } catch (userError) {
            console.warn('获取用户详细信息失败，使用基本信息:', userError);
            // 如果获取完整用户信息失败，仍然保存基本登录信息
          }
        }
      }
      
      return response.data;
    } catch (error: any) {
      // 兼容后端可能使用 userName 字段的情况，出现 Bad credentials 时重试一次
      if (error.response && error.response.status === 400) {
        const message = error.response.data?.message || '';
        if (typeof message === 'string' && message.includes('Bad credentials')) {
          try {
            const trimmedPassword = credentials.password?.trim();
            // 先尝试 userName
            const fallbackBody1 = { userName: credentials.username?.trim(), password: trimmedPassword };
            const config = { headers: { 'Content-Type': 'application/json' } };
            console.warn('首次登录返回400，尝试使用 userName 字段重试...');
            let retryResp = await axios.post(`${API_BASE_URL}/auth/login`, fallbackBody1, config);
            if (!retryResp.data?.success) {
              // 再尝试 email 字段
              console.warn('使用 userName 登录失败，尝试使用 email 字段重试...');
              const fallbackBody2 = { email: credentials.username?.trim(), password: trimmedPassword };
              retryResp = await axios.post(`${API_BASE_URL}/auth/login`, fallbackBody2, config);
            }

            if (retryResp.data?.success) {
              // 与上面相同的成功处理逻辑
              sessionStorage.setItem('isLoggedIn', 'true');
              if (retryResp.data.token) {
                sessionStorage.setItem('token', retryResp.data.token);
              }
              if (retryResp.data.user) {
                sessionStorage.setItem('user', JSON.stringify(retryResp.data.user));
                try {
                  const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${retryResp.data.token}` }
                  });
                  if (userResponse.data) {
                    const completeUser = { ...retryResp.data.user, ...userResponse.data };
                    sessionStorage.setItem('user', JSON.stringify(completeUser));
                  }
                } catch {}
              }
              return retryResp.data;
            }
            return retryResp.data;
          } catch (retryError: any) {
            if (retryError.response) return retryError.response.data;
            throw new Error('网络错误，请稍后重试');
          }
        }
        return error.response.data;
      }
      throw new Error('网络错误，请稍后重试');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清理所有认证信息
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  getAuthHeaders(): { Authorization: string } | {} {
    const token = sessionStorage.getItem('token');
    console.log('=== AuthService.getAuthHeaders 调试信息 ===');
    console.log('从sessionStorage获取的token:', token);
    console.log('token类型:', typeof token);
    console.log('token长度:', token ? token.length : 0);
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('生成的认证头:', headers);
    console.log('认证头是否包含Authorization:', 'Authorization' in headers);
    
    return headers;
  }

  getCurrentUser(): UserInfo | null {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUserSession(user: UserInfo): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('isLoggedIn', 'true');
  }

  clearUserSession(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
  }
}

export default new AuthService();
