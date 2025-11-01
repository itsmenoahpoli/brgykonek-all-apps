import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface Resident {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  user_type: string;
  address: string;
  birthdate: string;
  barangay_clearance: string;
}

export interface Complaint {
  _id: string;
  resident_id: Resident | null;
  title?: string;
  category: string;
  date_of_report: string;
  location_of_incident?: string;
  complaint_content: string;
  attachments: string[];
  status: string;
  priority?: 'low' | 'medium' | 'high';
  sitio?: { _id?: string; code?: number; name?: string };
  resolution_note?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  private baseUrl = '/complaints';

  async getComplaints(): Promise<Complaint[] | undefined> {
    try {
      const res = await apiClient.get<Complaint[]>(this.baseUrl);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async getComplaintsByResidentId(
    authService: any
  ): Promise<Complaint[] | undefined> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) return undefined;
    try {
      const res = await apiClient.get<Complaint[]>(
        `/complaints/resident/${currentUser.id}`
      );
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async createComplaint(formData: FormData): Promise<Complaint | undefined> {
    try {
      const res = await apiClient.post<Complaint>(this.baseUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateComplaint(id: string, payload: Partial<Complaint>): Promise<Complaint | undefined> {
    try {
      const res = await apiClient.put<Complaint>(`${this.baseUrl}/${id}`, payload);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async deleteComplaint(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/complaints/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getResidentById(id: string): Promise<Resident | undefined> {
    try {
      const res = await apiClient.get<Resident>(`/residents/${id}`);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async getAllResidents(): Promise<Resident[] | undefined> {
    try {
      const res = await apiClient.get<Resident[]>('/administrator/residents');
      return res.data;
    } catch (error) {
      return undefined;
    }
  }
}
