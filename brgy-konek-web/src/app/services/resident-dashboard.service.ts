import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import apiClient from '../utils/api.util';

export interface ResidentDashboardStats {
  pendingComplaints: number;
  resolvedComplaints: number;
  documentRequests: number;
}

export interface DashboardComplaint {
  _id: string;
  title?: string;
  complaint_content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardDocumentRequest {
  _id: string;
  document_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ResidentDashboardService {
  private baseUrl = '/resident/dashboard';

  async getDashboardStats(residentId: string): Promise<ResidentDashboardStats | undefined> {
    try {
      const [complaintsRes, documentsRes] = await Promise.all([
        apiClient.get(`/complaints/resident/${residentId}`),
        apiClient.get(`/documents/requests/resident/${residentId}`)
      ]);

      const complaints = (complaintsRes?.data?.data ?? complaintsRes?.data) || [];
      const documents = (documentsRes?.data?.data ?? documentsRes?.data) || [];

      const pendingComplaints = complaints.filter((c: any) => 
        c.status === 'pending' || c.status === 'in_progress'
      ).length;

      const resolvedComplaints = complaints.filter((c: any) => 
        c.status === 'resolved'
      ).length;

      const documentRequests = documents.length;

      return {
        pendingComplaints,
        resolvedComplaints,
        documentRequests
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return undefined;
    }
  }

  async getRecentComplaints(residentId: string): Promise<DashboardComplaint[] | undefined> {
    try {
      const res = await apiClient.get(`/complaints/resident/${residentId}`);
      const complaints = res?.data || [];
      return complaints.slice(0, 5).map((complaint: any) => ({
        _id: complaint._id,
        title: complaint.title,
        complaint_content: complaint.complaint_content,
        status: complaint.status,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at
      }));
    } catch (error) {
      console.error('Error fetching recent complaints:', error);
      return undefined;
    }
  }

  async getRecentDocumentRequests(residentId: string): Promise<DashboardDocumentRequest[] | undefined> {
    try {
      const res = await apiClient.get(`/documents/requests/resident/${residentId}`);
      const documents = res?.data || [];
      return documents.slice(0, 5).map((doc: any) => ({
        _id: doc._id,
        document_type: doc.document_type,
        status: doc.status,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));
    } catch (error) {
      console.error('Error fetching recent document requests:', error);
      return undefined;
    }
  }
}
