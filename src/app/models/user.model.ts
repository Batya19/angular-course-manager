export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface AuthResponse {
  token: string;
  userId: number;
  role: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface LoginRequest {
  email: string;
  password: string;
}