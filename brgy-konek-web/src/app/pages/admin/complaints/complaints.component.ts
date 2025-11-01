import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ComplaintsService,
  Complaint,
  Resident,
} from '../../../services/complaints.service';
import { Observable } from 'rxjs';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { getBaseUrl } from '../../../utils/api.util';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, StatusModalComponent],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.scss'],
})
export class ComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  residents: Resident[] = [];
  loadingResidents = false;
  showViewModal = false;
  selectedComplaint: Complaint | null = null;
  showCreateModal = false;
  showSuccessModal = false;
  successTitle = '';
  successMessage = '';
  createForm = {
    resident_id: '',
    title: '',
    category: '',
    date_of_report: '',
    location_of_incident: '',
    complaint_content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'pending',
    sitio: null as number | null,
    attachments: [] as File[],
  };

  formErrors = {
    resident_id: '',
    title: '',
    category: '',
    complaint_content: ''
  };

  isFormSubmitted = false;
  displayedColumns = [
    'resident_id',
    'category',
    'sitio',
    'date_of_report',
    'complaint_content',
    'attachments',
    'priority',
    'status',
    'actions',
  ];
  constructor(
    private complaintsService: ComplaintsService,
    private route: ActivatedRoute
  ) {}
  async ngOnInit(): Promise<void> {
    const response = await this.complaintsService.getComplaints();
    if (!response) {
      this.complaints = [];
      return;
    }
    const complaintsWithResidents = await Promise.all(
      response.map(async (complaint) => {
        if (typeof complaint.resident_id === 'string') {
          const resident = await this.complaintsService.getResidentById(
            complaint.resident_id
          );
          return {
            ...complaint,
            resident_id: resident ?? {
              _id: complaint.resident_id,
              name: 'Unknown',
              email: '',
              mobile_number: '',
              user_type: '',
              address: '',
              birthdate: '',
              barangay_clearance: '',
            },
          };
        }
        return complaint;
      })
    );
    this.complaints = complaintsWithResidents;
    await this.loadResidents();
    
    // Check for complaintId query parameter to open specific complaint
    this.route.queryParams.subscribe(params => {
      if (params['complaintId']) {
        this.openComplaintById(params['complaintId']);
      }
    });
  }

  async loadResidents(): Promise<void> {
    this.loadingResidents = true;
    try {
      const residents = await this.complaintsService.getAllResidents();
      this.residents = residents || [];
    } catch (error) {
      console.error('Error loading residents:', error);
      this.residents = [];
    } finally {
      this.loadingResidents = false;
    }
  }

  openViewModal(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.showViewModal = true;
  }
  
  openComplaintById(complaintId: string) {
    const complaint = this.complaints.find(c => c._id === complaintId);
    if (complaint) {
      this.openViewModal(complaint);
    }
  }
  
  closeViewModal() {
    this.showViewModal = false;
    this.selectedComplaint = null;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.isFormSubmitted = false;
    this.createForm = {
      resident_id: '',
      title: '',
      category: '',
      date_of_report: '',
      location_of_incident: '',
      complaint_content: '',
      priority: 'medium',
      status: 'pending',
      sitio: null,
      attachments: [],
    };
    this.formErrors = {
      resident_id: '',
      title: '',
      category: '',
      complaint_content: ''
    };
  }

  validateForm(): boolean {
    this.formErrors = {
      resident_id: '',
      title: '',
      category: '',
      complaint_content: ''
    };

    let isValid = true;

    if (!this.createForm.resident_id) {
      this.formErrors.resident_id = 'Please select a resident';
      isValid = false;
    }

    if (!this.createForm.title || this.createForm.title.trim() === '') {
      this.formErrors.title = 'Please enter a complaint title';
      isValid = false;
    }

    if (!this.createForm.category) {
      this.formErrors.category = 'Please select a category';
      isValid = false;
    }

    if (!this.createForm.complaint_content || this.createForm.complaint_content.trim() === '') {
      this.formErrors.complaint_content = 'Please enter complaint content';
      isValid = false;
    }

    return isValid;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.createForm.attachments = Array.from(input.files);
    }
  }

  clearAttachments() {
    this.createForm.attachments = [];
  }

  removeAttachment(index: number) {
    this.createForm.attachments.splice(index, 1);
  }

  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer && event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files);
      // Filter for accepted file types
      const acceptedFiles = files.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      
      // Add to existing files
      this.createForm.attachments = [...this.createForm.attachments, ...acceptedFiles];
    }
  }

  async createComplaint() {
    this.isFormSubmitted = true;
    
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('resident_id', this.createForm.resident_id);
    formData.append('title', this.createForm.title);
    formData.append('category', this.createForm.category);
    formData.append('date_of_report', new Date(this.createForm.date_of_report).toISOString());
    formData.append('location_of_incident', this.createForm.location_of_incident);
    formData.append('complaint_content', this.createForm.complaint_content);
    formData.append('status', this.createForm.status);
    formData.append('priority', this.createForm.priority);
    if (this.createForm.sitio) {
      formData.append('sitio', this.createForm.sitio.toString());
    }
    for (const f of this.createForm.attachments) {
      formData.append('attachments', f);
    }
    await this.complaintsService.createComplaint(formData);
    this.closeCreateModal();
    this.successTitle = 'Complaint Created';
    this.successMessage = 'Complaint has been created successfully.';
    this.showSuccessModal = true;
    await this.ngOnInit();
  }

  async updateComplaintResolution(id: string, note: string) {
    const currentComplaint = this.complaints.find(c => c._id === id);
    const isCurrentlyResolved = currentComplaint?.status === 'resolved';
    
    const newStatus = isCurrentlyResolved ? 'pending' : 'resolved';
    
    await this.complaintsService.updateComplaint(id, { resolution_note: note, status: newStatus });
    this.showViewModal = false;
    this.selectedComplaint = null;
    
    if (isCurrentlyResolved) {
      this.successTitle = 'Complaint Reverted';
      this.successMessage = 'Complaint reverted to unresolved status successfully.';
    } else {
      this.successTitle = 'Complaint Resolved';
      this.successMessage = 'Complaint marked as resolved successfully.';
    }
    
    this.showSuccessModal = true;
    await this.ngOnInit();
  }

  async updateComplaintPriority(id: string, priority: 'low' | 'medium' | 'high') {
    await this.complaintsService.updateComplaint(id, { priority });
    this.successTitle = 'Priority Updated';
    this.successMessage = 'Complaint priority updated successfully.';
    this.showSuccessModal = true;
    await this.ngOnInit();
  }

  async updateComplaintStatus(id: string, status: string) {
    await this.complaintsService.updateComplaint(id, { status });
    this.successTitle = 'Status Updated';
    this.successMessage = 'Complaint status updated successfully.';
    this.showSuccessModal = true;
    await this.ngOnInit();
  }

  async mockUploadFiles(files: File[]): Promise<string[]> { return []; }
  fileToBase64(file: File): Promise<string | ArrayBuffer | null> { return Promise.resolve(null); }

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

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
  }

  getFileName(filePath: string): string {
    if (!filePath) return '';
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix if present (format: timestamp-randomNumber-filename)
    const timestampMatch = fileName.match(/^\d+-\d+-(.+)$/);
    return timestampMatch ? timestampMatch[1] : fileName;
  }

  viewAttachment(attachment: string): void {
    if (!attachment) return;
    
    // Construct the full URL for the attachment
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}${attachment}`;
    
    // Open in a new tab
    window.open(fullUrl, '_blank');
  }

  downloadAttachment(attachment: string): void {
    if (!attachment) return;
    
    // Construct the full URL for the attachment
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/${attachment}`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = this.getFileName(attachment);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getResidentName(complaint: Complaint): string {
    if (!complaint.resident_id) {
      return 'Unknown Resident';
    }
    return complaint.resident_id.name;
  }
}
