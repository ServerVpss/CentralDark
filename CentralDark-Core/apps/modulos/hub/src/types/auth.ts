export type UserRole = 'root' | 'admin' | 'operator' | 'viewer';

export interface HubUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthState {
  user: HubUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}