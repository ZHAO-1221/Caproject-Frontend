import axios from 'axios';

const ADMIN_API_BASE_URL = '/api/admin/auth';

export interface AdminLoginRequest {
  username: string; // admin account (could be employee number)
  password: string;
}

export interface AdminAuthResponse {
  token: string;
}

class AdminAuthService {
  private adminTokenKey = 'admin_token';
  private adminLoggedInKey = 'isAdminLoggedIn';

  async login(credentials: AdminLoginRequest): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const response = await axios.post(`${ADMIN_API_BASE_URL}/login`, credentials);
      const data = response.data as AdminAuthResponse;

      if (data && data.token) {
        sessionStorage.setItem(this.adminLoggedInKey, 'true');
        sessionStorage.setItem(this.adminTokenKey, data.token);
        return { success: true, message: 'OK', token: data.token };
      }

      return { success: false, message: 'Invalid login response' };
    } catch (error: any) {
      if (error.response) {
        const backend = error.response.data;
        const msg = (backend && (backend.message || backend.error || backend)) || 'Login failed';
        return { success: false, message: String(msg) };
      }
      return { success: false, message: 'Network error, please try again later' };
    }
  }

  async loginWithEmployeeNumber(employeeNumber: string, password: string) {
    return this.login({ username: employeeNumber, password });
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem(this.adminLoggedInKey);
    sessionStorage.removeItem(this.adminTokenKey);
  }

  isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(this.adminLoggedInKey) === 'true';
  }

  getAdminAuthHeaders(): { Authorization: string } | {} {
    const token = sessionStorage.getItem(this.adminTokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getAdminToken(): string | null {
    return sessionStorage.getItem(this.adminTokenKey);
  }
}

export default new AdminAuthService();


