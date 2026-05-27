import api from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

const authService = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await api.post<{ success: boolean; data: RegisterResponse }>(
      '/auth/register',
      payload
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>(
      '/auth/login',
      payload
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export default authService;
