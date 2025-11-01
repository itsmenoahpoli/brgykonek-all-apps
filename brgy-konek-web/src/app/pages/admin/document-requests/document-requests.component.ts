import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { DocumentRequestsService, AdminDocumentRequestItem, DocRequestStatus } from '../../../services/document-requests.service';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-admin-document-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, StatusModalComponent],
  templateUrl: './document-requests.component.html',
  styleUrls: ['./document-requests.component.scss']
})
export class DocumentRequestsComponent implements OnInit {
  requests: AdminDocumentRequestItem[] = [];
  loading = false;
  filter: DocRequestStatus | '' = '';
  search = '';

  showStatusModal = false;
  statusTitle = '';
  statusMessage = '';

  selected: AdminDocumentRequestItem | null = null;
  editStatus: DocRequestStatus = 'pending';
  editNotes = '';

  constructor(private service: DocumentRequestsService) {}

  async ngOnInit() {
    await this.load();
  }

  get filtered() {
    return this.requests.filter(r => (this.filter ? r.status === this.filter : true) && (this.search ? (r.resident_id?.name || '').toLowerCase().includes(this.search.toLowerCase()) || r.document_type.toLowerCase().includes(this.search.toLowerCase()) : true));
  }

  async load() {
    this.loading = true;
    this.requests = await this.service.getAll();
    this.loading = false;
  }

  openEdit(r: AdminDocumentRequestItem) {
    this.selected = r;
    this.editStatus = r.status;
    this.editNotes = r.staff_notes || '';
  }

  closeEdit() {
    this.selected = null;
  }

  async save() {
    if (!this.selected) return;
    const payload: any = { status: this.editStatus };
    if (this.editNotes) payload.staff_notes = this.editNotes;
    if (this.editStatus === 'completed') payload.completed_at = new Date().toISOString();
    await this.service.update(this.selected._id, payload);
    this.statusTitle = 'Request Updated';
    this.statusMessage = 'The document request has been updated.';
    this.showStatusModal = true;
    this.selected = null;
    await this.load();
  }

  async remove(r: AdminDocumentRequestItem) {
    await this.service.delete(r._id);
    await this.load();
  }
}


