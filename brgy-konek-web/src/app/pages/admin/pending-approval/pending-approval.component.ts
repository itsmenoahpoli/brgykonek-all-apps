import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../../services/users.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { ConfirmDeleteModalComponent } from '../../../components/shared/confirm-delete-modal.component';
import { getBaseUrl } from '../../../utils/api.util';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, StatusModalComponent, ConfirmDeleteModalComponent],
  templateUrl: './pending-approval.component.html',
  styleUrls: ['./pending-approval.component.scss']
})
export class PendingApprovalComponent implements OnInit {
  users: User[] = [];
  loading = false;
  
  showSuccessModal = false;
  successTitle = '';
  successMessage = '';

  showUserDetailsModal = false;
  selectedUser: User | null = null;

  showRejectConfirmationModal = false;
  userToReject: User | null = null;

  activeTab: 'pending' | 'rejected' = 'pending';

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      if (this.activeTab === 'pending') {
        const allUsers = await this.usersService.getUsers() || [];
        this.users = allUsers.filter(user => 
          user.user_type !== 'admin' && 
          !user.isRejected &&
          (user.status === 'pending' || 
           (user.approved === false || user.approved === undefined))
        ).reverse();
      } else {
        const rejectedUsers = await this.usersService.getRejectedUsers() || [];
        this.users = rejectedUsers;
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  switchTab(tab: 'pending' | 'rejected') {
    this.activeTab = tab;
    this.loadUsers();
  }

  async approveUser(user: User) {
    if (!user._id) return;
    
    try {
      await this.usersService.approveUser(user._id);
      this.successTitle = 'User Approved';
      this.successMessage = `${user.name} has been approved successfully.`;
      this.showSuccessModal = true;
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }

  openRejectConfirmation(user: User) {
    this.userToReject = user;
    this.showRejectConfirmationModal = true;
  }

  async rejectUser(user: User) {
    if (!user._id) return;
    
    try {
      await this.usersService.updateUser(user._id, { 
        isRejected: true, 
        approved: false 
      });
      this.successTitle = 'User Rejected';
      this.successMessage = `${user.name} has been rejected.`;
      this.showSuccessModal = true;
      this.showRejectConfirmationModal = false;
      this.userToReject = null;
    } catch (error) {
      console.error('Error rejecting user:', error);
      this.showRejectConfirmationModal = false;
      this.userToReject = null;
    }
  }

  onRejectConfirmationCanceled() {
    this.showRejectConfirmationModal = false;
    this.userToReject = null;
  }

  onRejectConfirmationConfirmed() {
    if (this.userToReject) {
      this.rejectUser(this.userToReject);
    }
  }

  async unrejectUser(user: User) {
    if (!user._id) return;
    
    try {
      await this.usersService.updateUser(user._id, { 
        isRejected: false,
        status: 'pending'
      });
      this.successTitle = 'User Unrejected';
      this.successMessage = `${user.name} has been unrejected and restored to pending status.`;
      this.showSuccessModal = true;
      await this.loadUsers();
    } catch (error) {
      console.error('Error unrejecting user:', error);
    }
  }

  async onSuccessModalClosed() {
    this.showSuccessModal = false;
    await this.loadUsers();
  }

  viewUserDetails(user: User) {
    this.selectedUser = user;
    this.showUserDetailsModal = true;
  }

  closeUserDetailsModal() {
    this.showUserDetailsModal = false;
    this.selectedUser = null;
  }

  isPdfFile(filePath: string): boolean {
    if (!filePath || filePath.trim() === '') return false;
    return filePath.toLowerCase().endsWith('.pdf');
  }

  getFileName(filePath: string): string {
    if (!filePath || filePath.trim() === '') return 'No file';
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1] || 'Unknown file';
    return fileName.trim() === '' ? 'Unknown file' : fileName;
  }

  viewDocument(filePath: string) {
    if (!filePath || filePath.trim() === '') {
      console.error('No file path provided');
      alert('No file available to view');
      return;
    }
    
    try {
      const fullUrl = this.getFullFileUrl(filePath);
      if (fullUrl && fullUrl !== '') {
        const newWindow = window.open(fullUrl, '_blank');
        if (!newWindow) {
          alert('Please allow popups for this site to view documents');
        }
      } else {
        console.error('Invalid file URL');
        alert('Unable to generate file URL');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Error opening document. Please try again.');
    }
  }

  downloadDocument(filePath: string) {
    if (!filePath || filePath.trim() === '') {
      console.error('No file path provided');
      alert('No file available to download');
      return;
    }
    
    try {
      const fullUrl = this.getFullFileUrl(filePath);
      if (fullUrl && fullUrl !== '') {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = this.getFileName(filePath);
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Invalid file URL');
        alert('Unable to generate download URL');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  }

  private getFullFileUrl(filePath: string): string {
    if (!filePath || filePath.trim() === '') return '';
    
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    try {
      const baseUrl = getBaseUrl();
      if (!baseUrl || baseUrl.trim() === '') {
        console.error('Base URL not configured');
        return '';
      }
      
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      return `${baseUrl}${cleanPath}`;
    } catch (error) {
      console.error('Error generating file URL:', error);
      return '';
    }
  }

  getUserTypeClass(userType: string): string {
    switch (userType) {
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resident':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
}
