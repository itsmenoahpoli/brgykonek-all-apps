import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export type DocRequestStatus = 'pending' | 'received' | 'seen_by_staff' | 'in_progress' | 'completed' | 'rejected';

export interface AdminDocumentRequestItem {
  _id: string;
  resident_id: any;
  document_type: string;
  notes?: string;
  staff_notes?: string;
  status: DocRequestStatus;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentRequestsService {
  private baseUrl = '/documents/requests';

  async getAll(): Promise<AdminDocumentRequestItem[]> {
    const res = await apiClient.get(this.baseUrl);
    return res?.data?.data || [];
  }

  async update(id: string, data: { status: DocRequestStatus; staff_notes?: string; completed_at?: string }): Promise<boolean> {
    await apiClient.put(`${this.baseUrl}/${id}`, data);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
    return true;
  }
}


