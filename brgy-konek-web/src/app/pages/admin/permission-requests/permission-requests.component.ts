import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionRequestService, PermissionRequest } from '../../../services/permission-request.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-permission-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, StatusModalComponent],
  templateUrl: './permission-requests.component.html',
  styleUrls: ['./permission-requests.component.scss']
})
export class PermissionRequestsComponent implements OnInit {
  permissionRequests: PermissionRequest[] = [];
  loading = false;
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  
  showSuccessModal = false;
  successTitle = '';
  successMessage = '';

  showViewModal = false;
  selectedRequest: PermissionRequest | null = null;

  showReviewModal = false;
  requestToReview: PermissionRequest | null = null;
  reviewNotes = '';
  reviewAction: 'approve' | 'reject' = 'approve';

  constructor(private permissionRequestService: PermissionRequestService) {}

  ngOnInit() {
    this.loadPermissionRequests();
  }

  async loadPermissionRequests() {
    this.loading = true;
    try {
      const requests = await this.permissionRequestService.getPermissionRequests();
      this.permissionRequests = requests;
    } catch (error) {
      console.error('Error loading permission requests:', error);
    } finally {
      this.loading = false;
    }
  }

  switchTab(tab: 'pending' | 'approved' | 'rejected') {
    this.activeTab = tab;
    this.loadPermissionRequests();
  }

  getFilteredRequests(): PermissionRequest[] {
    return this.permissionRequests.filter(req => req.status === this.activeTab);
  }

  viewRequest(request: PermissionRequest) {
    this.selectedRequest = request;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedRequest = null;
  }

  openReviewModal(request: PermissionRequest, action: 'approve' | 'reject') {
    this.requestToReview = request;
    this.reviewAction = action;
    this.reviewNotes = '';
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.requestToReview = null;
    this.reviewNotes = '';
  }

  async submitReview() {
    if (!this.requestToReview?._id) return;

    try {
      const result = await this.permissionRequestService.updateStatus(
        this.requestToReview._id,
        this.reviewAction === 'approve' ? 'approved' : 'rejected',
        this.reviewNotes
      );

      if (result) {
        this.successTitle = this.reviewAction === 'approve' ? 'Request Approved' : 'Request Rejected';
        this.successMessage = `Permission request has been ${this.reviewAction === 'approve' ? 'approved' : 'rejected'} successfully.`;
        this.showSuccessModal = true;
        this.closeReviewModal();
        await this.loadPermissionRequests();
      }
    } catch (error: any) {
      console.error('Error updating permission request:', error);
      alert(error.message || 'Failed to update permission request');
    }
  }

  onSuccessModalClosed() {
    this.showSuccessModal = false;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getUserName(userId: any): string {
    if (typeof userId === 'object' && userId !== null) {
      return userId.name || userId.email || 'Unknown User';
    }
    return 'Unknown User';
  }

  getUserEmail(userId: any): string {
    if (typeof userId === 'object' && userId !== null) {
      return userId.email || '';
    }
    return '';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  getChangedFields(current: any, requested: any): string[] {
    if (!current || !requested) return [];
    const fields: string[] = [];
    Object.keys(requested).forEach(key => {
      if (current[key] !== requested[key]) {
        fields.push(key);
      }
    });
    return fields;
  }

  // Make Object available in template
  Object = Object;
}

