import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface User {
  _id?: string;
  name: string;
  email: string;
  mobile_number: string;
  user_type: string;
  address: string;
  birthdate: string;
  barangay_clearance: string;
  approved?: boolean;
  isRejected?: boolean;
  status?: 'pending' | 'approved' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private endpoint = '/administrator/users';

  async getUsers(): Promise<User[] | undefined> {
    try {
      const res = await apiClient.get(this.endpoint);
      return res?.data || [];
    } catch (error) {
      return undefined;
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const res = await apiClient.get(`${this.endpoint}/${id}`);
      return res?.data || null;
    } catch (error) {
      return null;
    }
  }

  async createUser(user: Partial<User> | FormData): Promise<User | undefined> {
    try {
      let res;
      if (user instanceof FormData) {
        res = await apiClient.post(this.endpoint, user, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await apiClient.post(this.endpoint, user);
      }
      return res?.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateUser(
    id: string,
    user: Partial<User> | FormData
  ): Promise<User | undefined> {
    try {
      let res;
      if (user instanceof FormData) {
        res = await apiClient.put(`${this.endpoint}/${id}`, user, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await apiClient.put(`${this.endpoint}/${id}`, user);
      }
      return res?.data;
    } catch (error) {
      return undefined;
    }
  }

  async approveUser(id: string): Promise<User | undefined> {
    return this.updateUser(id, { approved: true, status: 'approved' as any });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getRejectedUsers(): Promise<User[] | undefined> {
    try {
      const res = await apiClient.get(`${this.endpoint.replace('/users', '/rejected-users')}`);
      return res?.data || [];
    } catch (error) {
      return undefined;
    }
  }
}
