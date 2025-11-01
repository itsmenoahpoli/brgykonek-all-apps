import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { AuthService } from '../../../services/auth.service';
import { SitiosService, Sitio } from '../../../services/sitios.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { TitleCasePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { ConfirmDeleteModalComponent } from '../../../components/shared/confirm-delete-modal.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    ReactiveFormsModule,
    TitleCasePipe,
    FormsModule,
    CommonModule,
    StatusModalComponent,
    ConfirmDeleteModalComponent,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss',
})
export class AnnouncementsComponent {
  announcements: Announcement[] = [];
  form: FormGroup;
  editId: string | null = null;
  showModal = false;
  search = '';
  statusFilter = '';
  bannerImagePreview: string | null = null;
  statusModalVisible = false;
  statusModalTitle = '';
  statusModalMessage = '';
  confirmDeleteVisible = false;
  deleteId: string | null = null;
  expandedAnnouncements = new Set<string>();
  showViewModal = false;
  selectedAnnouncement: Announcement | null = null;
  sitios: Sitio[] = [];
  loadingSitios = false;
  selectedSitios: string[] = [];
  constructor(
    private announcementsService: AnnouncementsService,
    private fb: FormBuilder,
    private authService: AuthService,
    private sitiosService: SitiosService
  ) {
    this.form = this.fb.group({
      banner_image: [''],
      title: ['', { validators: [], nonNullable: false }],
      header: ['', { validators: [], nonNullable: false }],
      body: [''],
      status: ['draft'],
      category: ['Events'],
      audience: ['All Residents'],
      publish_at: [''],
      created_by: [''],
    });
    this.loadAnnouncements();
    this.loadSitios();

    this.form.get('status')?.valueChanges.subscribe((status) => {
      if (status === 'published') {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const localDatetime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        this.form.patchValue({ publish_at: localDatetime });
      }
    });

    this.form.get('audience')?.valueChanges.subscribe((audience) => {
      console.log('Audience changed to:', audience);
      if (audience === 'Specific Zone') {
        console.log('Loading sitios because Specific Zone was selected');
        this.loadSitios();
      } else {
        this.selectedSitios = [];
      }
    });
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `${environment.baseUrl}${imagePath.charAt(0) === '/' ? imagePath.slice(1) : imagePath}` : '';
  }

  get filteredAnnouncements() {
    return this.announcements.filter((a) => {
      const matchesTitle = a.title
        .toLowerCase()
        .includes(this.search.toLowerCase());
      const matchesStatus = this.statusFilter
        ? a.status === this.statusFilter
        : true;
      return matchesTitle && matchesStatus;
    });
  }
  get pendingAnnouncements() {
    return this.announcements.filter((a) => a.status === 'draft');
  }
  get publishedAnnouncements() {
    return this.announcements.filter((a) => a.status === 'published');
  }
  async loadAnnouncements() {
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = data || [];
  }

  async loadSitios() {
    console.log('loadSitios called, current sitios length:', this.sitios.length);
    if (this.sitios.length > 0) return;
    
    this.loadingSitios = true;
    console.log('Loading sitios...');
    try {
      const data = await this.sitiosService.getSitios();
      console.log('Sitios data received:', data);
      this.sitios = data || [];
      console.log('Sitios array updated:', this.sitios);
    } catch (error) {
      console.error('Error loading sitios:', error);
      this.sitios = [];
    } finally {
      this.loadingSitios = false;
      console.log('Loading completed, sitios length:', this.sitios.length);
    }
  }
  openModal(editAnnouncement?: Announcement) {
    if (editAnnouncement) {
      this.form.patchValue(editAnnouncement);
      this.editId = editAnnouncement._id;
      this.selectedSitios = editAnnouncement.selected_sitios || [];
    } else {
      this.form.reset();
      this.editId = null;
      this.selectedSitios = [];
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        const fullName = `${currentUser.firstName} ${currentUser.middleName ? currentUser.middleName + ' ' : ''}${currentUser.lastName}`.trim();
        this.form.patchValue({ created_by: fullName });
      }
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const localDatetime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      this.form.patchValue({ publish_at: localDatetime });
    }
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
    this.form.reset();
    this.editId = null;
    this.selectedSitios = [];
  }
  async submit() {
    if (this.form.invalid) return;
    
    const formData = new FormData();
    const formValue = this.form.value;

    if (formValue.status === 'published' && (!formValue.publish_at || formValue.publish_at === '')) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const localDatetime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      this.form.patchValue({ publish_at: localDatetime });
    }
    
    // Add all form fields to FormData
    Object.keys(formValue).forEach(key => {
      if (key === 'banner_image' && formValue[key] instanceof File) {
        formData.append('banner_image', formValue[key]);
      } else if (formValue[key] !== null && formValue[key] !== undefined && formValue[key] !== '') {
        formData.append(key, formValue[key]);
      }
    });
    
    // Add selected sitios if audience is Specific Zone
    if (formValue.audience === 'Specific Zone' && this.selectedSitios.length > 0) {
      formData.append('selected_sitios', JSON.stringify(this.selectedSitios));
    }
    
    if (this.editId) {
      await this.announcementsService.updateAnnouncementWithFile(this.editId, formData);
      this.editId = null;
      this.form.reset();
      await this.loadAnnouncements();
      this.showModal = false;
      this.statusModalTitle = 'Announcement Updated';
      this.statusModalMessage = 'The announcement was updated successfully.';
      this.statusModalVisible = true;
    } else {
      await this.announcementsService.addAnnouncementWithFile(formData);
      this.form.reset();
      await this.loadAnnouncements();
      this.showModal = false;
      this.statusModalTitle = 'Announcement Created';
      this.statusModalMessage = 'The announcement was created successfully.';
      this.statusModalVisible = true;
    }
  }
  async approveAnnouncement(announcement: Announcement) {
    const updated = await this.announcementsService.updateAnnouncement(announcement._id, {
      ...announcement,
      status: 'published',
      publish_at: new Date().toISOString(),
    });
    if (updated) {
      await this.loadAnnouncements();
    }
  }
  edit(announcement: Announcement) {
    this.openModal(announcement);
  }
  async delete(id: string) {
    this.deleteId = id;
    this.confirmDeleteVisible = true;
  }
  async onConfirmDelete() {
    if (this.deleteId) {
      const res = await this.announcementsService.deleteAnnouncement(
        this.deleteId
      );
      if (res && res.status === 204) {
        this.statusModalTitle = 'Deleted';
        this.statusModalMessage = 'Successfully deleted announcement.';
        this.statusModalVisible = true;
      }
      await this.loadAnnouncements();
      this.deleteId = null;
      this.confirmDeleteVisible = false;
    }
  }
  onCancelDelete() {
    this.confirmDeleteVisible = false;
    this.deleteId = null;
  }
  cancelEdit() {
    this.closeModal();
  }
  onSearchChange(value: string) {
    this.search = value;
  }
  onStatusFilterChange(value: string) {
    this.statusFilter = value;
  }
  onBannerImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      // Store the actual file for upload
      this.form.patchValue({ banner_image: file });
    }
  }
  onStatusModalClosed() {
    this.statusModalVisible = false;
  }

  viewAnnouncement(announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedAnnouncement = null;
  }

  onSitioSelectionChange(sitioId: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedSitios.includes(sitioId)) {
        this.selectedSitios.push(sitioId);
      }
    } else {
      this.selectedSitios = this.selectedSitios.filter(id => id !== sitioId);
    }
  }

  isSitioSelected(sitioId: string): boolean {
    return this.selectedSitios.includes(sitioId);
  }

  onSitioCheckboxChange(event: Event, sitioId: string) {
    const target = event.target as HTMLInputElement;
    this.onSitioSelectionChange(sitioId, target.checked);
  }

  getSitioNames(selectedSitiosIds: string[]): string[] {
    if (!selectedSitiosIds || selectedSitiosIds.length === 0) {
      return [];
    }
    return selectedSitiosIds
      .map(id => this.sitios.find(s => s._id === id)?.name)
      .filter(name => name !== undefined) as string[];
  }

  getAudienceBadgeClass(audience: string): string {
    switch (audience) {
      case 'all_residents':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'specific_zone':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'staff_only':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getAudienceDisplayText(audience: string): string {
    switch (audience) {
      case 'all_residents':
        return 'All Residents';
      case 'specific_zone':
        return 'Specific Zone';
      case 'staff_only':
        return 'Staff Only';
      default:
        return audience;
    }
  }
}
