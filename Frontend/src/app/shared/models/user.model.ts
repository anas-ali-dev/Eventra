export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  favouriteCategory?: string;
  profilePicture?: string;
  role: 'customer' | 'organizer' | 'admin';
  isVerified?: boolean;
  savedEvents?: string[];
  bookingsCount?: number;
  savedEventsCount?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  city?: string;
  favouriteCategory?: string;
  profilePicture?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}
