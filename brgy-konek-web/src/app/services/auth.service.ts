import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import apiClient, { encrypt } from '../utils/api.util';

export interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
  sitio?: string;
  role?: string;
  approved?: boolean;
}

interface ApiUser {
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile_number?: string;
    user_type?: string;
    address?: string;
    birthdate?: string;
    approved?: boolean;
  };
  requiresOTP?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private loginAttempts = new Map<
    string,
    { count: number; lockedUntil?: number }
  >();

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    // Load login attempts from localStorage
    this.loadLoginAttemptsFromStorage();
  }

  private getTrustedDeviceKey(email: string): string {
    return `trustedDevice:${email}`;
  }

  isDeviceTrusted(email: string): boolean {
    try {
      const raw = localStorage.getItem(this.getTrustedDeviceKey(email));
      if (!raw) return false;
      const data = JSON.parse(raw) as { token: string; exp: number };
      if (!data || !data.exp) return false;
      return Date.now() < data.exp;
    } catch (e) {
      return false;
    }
  }

  trustDevice(email: string, days = 30): void {
    const exp = Date.now() + days * 24 * 60 * 60 * 1000;
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(
      this.getTrustedDeviceKey(email),
      JSON.stringify({ token, exp })
    );
  }

  private getDeviceInfo() {
    return {
      deviceId: localStorage.getItem('deviceId') || ((): string => {
        const id = crypto.getRandomValues(new Uint8Array(16)).reduce((p, c) => p + c.toString(16).padStart(2, '0'), '');
        localStorage.setItem('deviceId', id);
        return id;
      })(),
      deviceName: navigator.platform || 'web',
      userAgent: navigator.userAgent,
      ipAddress: ''
    };
  }

  login(
    email: string,
    password: string,
    rememberDevice = false
  ): Observable<{ success: boolean; message: string; user?: User; requiresOTP?: boolean }> {
    return from(
      apiClient
        .post<ApiUser>('/auth/login', { email, password })
        .then((response) => {
          const data = response.data;
          if (data && data.token) {
            localStorage.setItem('accessToken', encrypt(data.token));
          }
          if (data && data.user && data.user.id) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              firstName: data.user.name,
              lastName: '',
              phone: data.user.mobile_number,
              address: data.user.address,
              barangay: '',
              city: '',
              province: '',
              role: data.user.user_type,
              approved: data.user.approved,
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return {
              success: true,
              message: data.message || 'Login successful',
              user,
            };
          } else {
            return {
              success: false,
              message: data?.message || 'Invalid email or password',
            };
          }
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  register(
    userData:
      | FormData
      | {
          first_name: string;
          middle_name?: string;
          last_name: string;
          email: string;
          password: string;
          mobile_number: string;
        }
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return from(
      (async () => {
        console.log('🚀 Starting registration request...');
        const isFormData = userData instanceof FormData;
        console.log('📦 Is FormData:', isFormData);
        console.log('🔗 API URL:', apiClient.defaults.baseURL + '/auth/register');
        
        let response;
        if (isFormData) {
          console.log('📤 Sending FormData request...');
          response = await apiClient.post<ApiUser>('/auth/register', userData, {
            headers: {
              // Don't set Content-Type for FormData - let browser set it with boundary
            },
            timeout: 60000, // Explicit timeout for this request
          });
        } else {
          console.log('📤 Sending JSON request...');
          response = await apiClient.post<ApiUser>('/auth/register', userData, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 60000, // Explicit timeout for this request
          });
        }
        console.log('✅ Request completed successfully');
        const data = response.data;
        if (data && data.user && (data.user.id || response.status === 201)) {
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.name,
            lastName: '',
            phone: data.user.mobile_number,
            address: data.user.address,
            barangay: '',
            city: '',
            province: '',
            role: data.user.user_type,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return {
            success: true,
            message: data.message || 'Registration successful',
            user,
          };
        } else {
          return {
            success: false,
            message: data?.message || 'Registration failed',
          };
        }
      })().catch((error) => {
        console.error('❌ Registration error:', error);
        console.error('📊 Error status:', error.response?.status);
        console.error('📄 Error response:', error.response?.data);
        console.error('🔍 Error message:', error.message);
        console.error('🌐 Error code:', error.code);
        
        return {
          success: false,
          message: error.response?.data?.message || 'Network error occurred',
        };
      })
    );
  }

  

  updateProfile(
    userData: {
      name: string;
      mobile_number: string;
      address_sitio: string;
      address_barangay: string;
      address_municipality: string;
      address_province: string;
    }
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return from(
      apiClient
        .put('/auth/update-profile', userData)
        .then((response) => {
          const data = response.data;
          if (data && data.user) {
            const user = data.user;
            const nameParts = user.name?.split(' ') || ['', '', ''];
            const updatedUser: User = {
              id: user.id,
              email: user.email,
              firstName: nameParts[0] || '',
              middleName: nameParts[1] || '',
              lastName: nameParts.slice(2).join(' ') || '',
              phone: user.mobile_number,
              address: user.address,
              barangay: user.address_barangay || '',
              city: user.address_municipality || '',
              province: user.address_province || '',
              sitio: user.address_sitio || '',
              role: user.user_type,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
            return {
              success: true,
              message: data.message || 'Profile updated successfully',
              user: updatedUser,
            };
          } else {
            return {
              success: false,
              message: data?.message || 'Failed to update profile',
            };
          }
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    const email = this.currentUserSubject.value?.email;
    if (email) {
      const key = this.getTrustedDeviceKey(email);
      const raw = localStorage.getItem(key);
      if (raw) {
        localStorage.removeItem(key);
      }
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdminAccount(email: string): boolean {
    return email.includes('admin');
  }

  fetchProfile(): Observable<User> {
    return from(
      apiClient.get('/auth/my-profile').then((response) => {
        const user = response.data?.user || response.data;
        const updatedUser: User = {
          id: user.id,
          email: user.email,
          firstName: (user.name || '').split(' ')[0] || '',
          lastName: (user.name || '').split(' ').slice(1).join(' ') || '',
          phone: user.mobile_number,
          address: user.address,
          barangay: user.address_barangay || '',
          city: user.address_municipality || '',
          province: user.address_province || '',
          sitio: user.address_sitio || '',
          role: user.user_type,
          approved: user.approved ?? this.currentUserSubject.value?.approved,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
        return updatedUser;
      })
    );
  }

  checkApprovalStatus(): Observable<boolean> {
    return from(
      apiClient.get('/auth/approval-status').then((response) => {
        const approved = Boolean(response.data?.approved);
        const current = this.currentUserSubject.value;
        if (current && current.approved !== approved) {
          const updated = { ...current, approved } as User;
          localStorage.setItem('currentUser', JSON.stringify(updated));
          this.currentUserSubject.next(updated);
        }
        return approved;
      })
    );
  }

  getLoginAttempts(email: string): { count: number; lockedUntil?: number } {
    return this.loginAttempts.get(email) || { count: 0 };
  }

  incrementLoginAttempts(email: string): void {
    // Skip max attempts for admin accounts
    if (this.isAdminAccount(email)) {
      return;
    }

    const attempts = this.loginAttempts.get(email) || { count: 0 };
    attempts.count += 1;

    if (attempts.count >= 3) {
      attempts.lockedUntil = Date.now() + 5 * 60 * 1000;
      // Save email to localStorage for persistent lockout
      const lockedEmails = JSON.parse(localStorage.getItem('lockedEmails') || '[]');
      if (!lockedEmails.includes(email)) {
        lockedEmails.push(email);
        localStorage.setItem('lockedEmails', JSON.stringify(lockedEmails));
      }
    }

    this.loginAttempts.set(email, attempts);
    // Save attempts to localStorage for persistence
    this.saveLoginAttemptsToStorage();
  }

  resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
    // Remove from locked emails list
    const lockedEmails = JSON.parse(localStorage.getItem('lockedEmails') || '[]');
    const updatedLockedEmails = lockedEmails.filter((e: string) => e !== email);
    localStorage.setItem('lockedEmails', JSON.stringify(updatedLockedEmails));
    // Save updated attempts to localStorage
    this.saveLoginAttemptsToStorage();
  }

  isAccountLocked(email: string): boolean {
    // Skip lockout check for admin accounts
    if (this.isAdminAccount(email)) {
      return false;
    }

    // Check if email is in locked emails list (persistent lockout)
    const lockedEmails = JSON.parse(localStorage.getItem('lockedEmails') || '[]');
    if (lockedEmails.includes(email)) {
      return true;
    }

    // Check temporary lockout from current session
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return true;
    }

    if (attempts.count >= 3 && !attempts.lockedUntil) {
      return true;
    }

    return false;
  }

  sendOTP(email: string, type: string = 'password_reset'): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/request-otp', { email, type })
        .then((response) => {
          const data = response.data;
          return {
            success: data.success,
            message: data.message || 'OTP sent successfully',
          };
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  verifyOTP(
    email: string,
    otp: string
  ): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/verify-otp', { email, otp_code: otp })
        .then((response) => {
          const data = response.data;
          return {
            success: data.success,
            message: data.message || 'OTP verified successfully',
          };
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  changePassword(
    current_password: string,
    new_password: string
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return from(
      apiClient
        .put('/auth/change-password', {
          current_password,
          new_password,
        })
        .then((response) => {
          const data = response.data;
          if (data && data.user) {
            const user = data.user;
            const nameParts = user.name?.split(' ') || ['', '', ''];
            const updatedUser: User = {
              id: user.id,
              email: user.email,
              firstName: nameParts[0] || '',
              middleName: nameParts[1] || '',
              lastName: nameParts.slice(2).join(' ') || '',
              phone: user.mobile_number,
              address: user.address,
              barangay: user.address_barangay || '',
              city: user.address_municipality || '',
              province: user.address_province || '',
              sitio: user.address_sitio || '',
              role: user.user_type,
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
            return {
              success: true,
              message: data.message || 'Password changed successfully',
              user: updatedUser,
            };
          } else {
            return {
              success: false,
              message: data?.message || 'Failed to change password',
            };
          }
        })
        .catch((error) => {
          return {
            success: false,
            message: error.response?.data?.message || 'Network error occurred',
          };
        })
    );
  }

  resetPassword(
    email: string,
    otp_code: string,
    new_password: string
  ): Observable<{ success: boolean; message: string }> {
    return from(
      apiClient
        .post('/auth/reset-password', {
          email,
          otp_code,
          new_password,
        })
        .then((response) => ({
          success: response.data.success,
          message:
            response.data.message ||
            (response.data.success
              ? 'Password reset successful'
              : 'Password reset failed'),
        }))
    );
  }

  private saveLoginAttemptsToStorage(): void {
    const attemptsObj = Object.fromEntries(this.loginAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(attemptsObj));
  }

  private loadLoginAttemptsFromStorage(): void {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
      try {
        const attemptsObj = JSON.parse(stored);
        this.loginAttempts = new Map(Object.entries(attemptsObj));
      } catch (error) {
        console.error('Error loading login attempts from storage:', error);
        localStorage.removeItem('loginAttempts');
      }
    }
  }
}
