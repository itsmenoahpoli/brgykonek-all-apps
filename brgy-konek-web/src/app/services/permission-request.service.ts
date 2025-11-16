import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface PermissionRequest {
  _id?: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  current_value: any;
  request_change_value: any;
  reason: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionRequestPayload {
  current_value: any;
  request_change_value: any;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionRequestService {
  private baseUrl = '/permission-requests';

  async createPermissionRequest(payload: CreatePermissionRequestPayload): Promise<PermissionRequest | undefined> {
    try {
      const res = await apiClient.post<PermissionRequest>(this.baseUrl, payload);
      return res.data;
    } catch (error) {
      console.error('Error creating permission request:', error);
      return undefined;
    }
  }

  async getPermissionRequests(status?: string): Promise<PermissionRequest[]> {
    try {
      const url = status ? `${this.baseUrl}?status=${status}` : this.baseUrl;
      const res = await apiClient.get<PermissionRequest[]>(url);
      return res.data || [];
    } catch (error) {
      console.error('Error fetching permission requests:', error);
      return [];
    }
  }

  async getPermissionRequestById(id: string): Promise<PermissionRequest | undefined> {
    try {
      const res = await apiClient.get<PermissionRequest>(`${this.baseUrl}/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching permission request:', error);
      return undefined;
    }
  }

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewNotes?: string): Promise<PermissionRequest | undefined> {
    try {
      const res = await apiClient.put<PermissionRequest>(`${this.baseUrl}/${id}/status`, {
        status,
        review_notes: reviewNotes
      });
      return res.data;
    } catch (error: any) {
      console.error('Error updating permission request status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update permission request status');
    }
  }
}

