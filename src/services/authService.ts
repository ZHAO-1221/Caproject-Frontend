//By (HU XINTIAN)
import axios from 'axios';

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
      console.log('=== AuthService.login Debug Info ===');
      console.log('Login credentials:', credentials);
      console.log('Request URL:', `/api/auth/login`);
      
      const config = { headers: { 'Content-Type': 'application/json' } };
      let response = await axios.post(`/api/auth/login`, credentials, config);
      
      console.log('Login response:', response.data);
      
      // 如果登录成功，保存认证信息
      if (response.data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        if (response.data.token) {
          sessionStorage.setItem('token', response.data.token);
          console.log('Token saved:', response.data.token);
        } else {
          console.warn('No token in login response');
        }
        if (response.data.user) {
          // 保存基本用户信息
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('User information saved:', response.data.user);
          
          // 尝试获取完整的用户信息（包含userId）
          try {
            console.log('Attempting to get complete user information...');
            const userResponse = await axios.get(`/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${response.data.token}`
              }
            });
            console.log('User details response:', userResponse.data);
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
            console.warn('Failed to get user details, using basic information:', userError);
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
            console.warn('First login returned 400, retrying with userName field...');
            let retryResp = await axios.post(`/api/auth/login`, fallbackBody1, config);
            if (!retryResp.data?.success) {
              // 再尝试 email 字段
              console.warn('Login with userName failed, retrying with email field...');
              const fallbackBody2 = { email: credentials.username?.trim(), password: trimmedPassword };
              retryResp = await axios.post(`/api/auth/login`, fallbackBody2, config);
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
                  const userResponse = await axios.get(`/api/users/me`, {
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
            throw new Error('Network error, please try again later');
          }
        }
        return error.response.data;
      }
      throw new Error('Network error, please try again later');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`/api/logout`);
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
    console.log('=== AuthService.getAuthHeaders Debug Info ===');
    console.log('Token from sessionStorage:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log('Generated auth headers:', headers);
    console.log('Auth headers contain Authorization:', 'Authorization' in headers);
    
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
