import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { NgIcon } from '@ng-icons/core';
import {
  ComplaintsService,
  Complaint,
  Resident,
} from '../../../services/complaints.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDeleteModalComponent } from '../../../components/shared/confirm-delete-modal.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { getImageUrl } from '../../../utils/api.util';

@Component({
  selector: 'app-resident-complaints',
  standalone: true,
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DashboardLayoutComponent,
    NgIcon,
    ConfirmDeleteModalComponent,
    StatusModalComponent,
  ],
})
export class ComplaintsComponent {
  complaints: Complaint[] = [];
  statusList = ['pending', 'in_progress', 'resolved', 'rejected'];
  categoryList = ['Infrastructure', 'Environment', 'Safety', 'Noise', 'Health', 'Other'];
  selectedStatus = '';
  selectedCategory = '';
  showCreateModal = false;
  uploadedFiles: File[] = [];
  isDragOver = false;
  complaintTitle = '';
  complaintCategory = '';
  complaintDate = '';
  complaintLocation = '';
  complaintContent = '';
  complaintStatus = 'pending';
  complaintPriority: 'low' | 'medium' | 'high' = 'low';
  complaintSitio: number | null = null;
  showDeleteModal = false;
  complaintToDelete: Complaint | null = null;
  showViewModal = false;
  selectedComplaint: Complaint | null = null;
  showSuccessModal = false;
  successTitle = '';
  successMessage = '';

  formErrors = {
    title: '',
    category: '',
    complaint_content: ''
  };

  isFormSubmitted = false;

  constructor(
    private complaintsService: ComplaintsService,
    private authService: AuthService
  ) {
    this.loadComplaints();
  }

  async loadComplaints() {
    const data = await this.complaintsService.getComplaintsByResidentId(
      this.authService
    );
    this.complaints = data || [];
  }

  get filteredComplaints() {
    return this.complaints.filter(
      (c) =>
        (this.selectedStatus ? c.status === this.selectedStatus : true) &&
        (this.selectedCategory ? c.category === this.selectedCategory : true)
    );
  }

  onCreateComplaint() {
    this.showCreateModal = true;
    this.uploadedFiles = [];
    this.isDragOver = false;
  }
  closeCreateModal() {
    this.showCreateModal = false;
    this.uploadedFiles = [];
    this.isDragOver = false;
  }
  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  addFiles(files: File[]) {
    for (const file of files) {
      if (
        !this.uploadedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        )
      ) {
        this.uploadedFiles.push(file);
      }
    }
  }
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
  getFileExtension(file: File): string {
    const parts = file.name.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  }
  onEditComplaint(complaint: Complaint) {
    // Edit logic here
  }
  onDeleteComplaint(complaint: Complaint) {
    this.complaintToDelete = complaint;
    this.showDeleteModal = true;
  }
  async confirmDeleteComplaint() {
    if (!this.complaintToDelete) return;
    const deleted = await this.complaintsService.deleteComplaint(
      this.complaintToDelete._id
    );
    this.showDeleteModal = false;
    if (deleted) {
      this.successTitle = 'Complaint Deleted';
      this.successMessage = 'Your complaint has been deleted successfully.';
      this.showSuccessModal = true;
      this.loadComplaints();
    }
    this.complaintToDelete = null;
  }
  onDeleteModalClosed() {
    this.showDeleteModal = false;
    this.complaintToDelete = null;
  }
  onSuccessModalClosed() {
    this.showSuccessModal = false;
  }

  validateForm(): boolean {
    this.formErrors = {
      title: '',
      category: '',
      complaint_content: ''
    };

    let isValid = true;

    if (!this.complaintTitle || this.complaintTitle.trim() === '') {
      this.formErrors.title = 'Please enter a complaint title';
      isValid = false;
    }

    if (!this.complaintCategory) {
      this.formErrors.category = 'Please select a category';
      isValid = false;
    }

    if (!this.complaintContent || this.complaintContent.trim() === '') {
      this.formErrors.complaint_content = 'Please enter complaint content';
      isValid = false;
    }

    return isValid;
  }

  async submitComplaint() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isFormSubmitted = true;

    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('resident_id', user.id);
    formData.append('title', this.complaintTitle);
    formData.append('category', this.complaintCategory);
    formData.append('date_of_report', new Date(this.complaintDate).toISOString());
    formData.append('location_of_incident', this.complaintLocation);
    formData.append('complaint_content', this.complaintContent);
    formData.append('status', this.complaintStatus);
    formData.append('priority', this.complaintPriority);
    if (this.complaintSitio) {
      formData.append('sitio', this.complaintSitio.toString());
    }
    for (const f of this.uploadedFiles) {
      formData.append('attachments', f);
    }
    const created = await this.complaintsService.createComplaint(formData);
    if (created) {
      this.successTitle = 'Complaint Submitted';
      this.successMessage = 'Your complaint has been submitted successfully.';
      this.showSuccessModal = true;
      this.closeCreateModal();
      this.loadComplaints();
    }
  }

  fileUrl(path: string): string {
    return getImageUrl(path);
  }

  getPriorityClass(priority?: string): string {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-500';
      case 'published':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  }

  getCategoryClass(category?: string): string {
    switch (category) {
      case 'Infrastructure':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Environment':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Safety':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Noise':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Health':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Other':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  openViewModal(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedComplaint = null;
  }

  // Removed base64 mock uploader in favor of multipart form upload
}
