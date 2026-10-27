// ==============================================================================
// EVEREST PASAL - FRONTEND API CLIENT
// Connects UI layer to backend REST endpoints with auth tokens and error handling
// ==============================================================================

const DEFAULT_PROD_API = 'https://everest-pasal-backend.onrender.com';
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API : 'http://localhost:4000');

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: string;
}

export class ApiClient {
  private static tokenKey = 'ep_auth_token';

  public static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public static clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorMsg = `Request failed with HTTP status ${response.status}`;
        if (payload && typeof payload === 'object') {
          if (payload.error && typeof payload.error === 'object' && payload.error.message) {
            errorMsg = payload.error.message;
          } else if (typeof payload.message === 'string') {
            errorMsg = payload.message;
          } else if (typeof payload.error === 'string') {
            errorMsg = payload.error;
          }
        }
        throw new Error(errorMsg);
      }

      // If backend wrapped in { success: true, data: ... }, extract data if needed, else return payload
      if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
        return payload.data as T;
      }

      return payload as T;
    } catch (err: any) {
      console.error(`[API-ERROR] ${options.method || 'GET'} ${endpoint}:`, err.message || err);
      throw err;
    }
  }

  // HTTP Helper Methods
  public static get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
