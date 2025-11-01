import { Component } from '@angular/core';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { AnnouncementDetailsModalComponent } from '../../../components/shared/announcement-details-modal/announcement-details-modal.component';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { SitiosService, Sitio } from '../../../services/sitios.service';

@Component({
  selector: 'app-resident-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss'],
  imports: [
    DashboardLayoutComponent,
    CommonModule,
    FormsModule,
    TitleCasePipe,
    AnnouncementDetailsModalComponent,
  ],
})
export class AnnouncementsComponent {
  announcements: Announcement[] = [];
  search = '';
  selectedAnnouncement: Announcement | null = null;
  showModal = false;
  currentUserSitio: string | undefined;
  sitios: Sitio[] = [];

  constructor(
    private announcementsService: AnnouncementsService,
    private authService: AuthService,
    private sitiosService: SitiosService
  ) {
    this.loadData();
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `${environment.baseUrl}${imagePath.charAt(0) === '/' ? imagePath.slice(1) : imagePath}` : '';
  }

  get filteredAnnouncements() {
    return this.announcements.filter((a) => {
      const matchesTitle = a.title
        .toLowerCase()
        .includes(this.search.toLowerCase());
      const matchesStatus = a.status === 'published';
      
      if (!matchesTitle || !matchesStatus) {
        return false;
      }
      
      if (a.audience === 'all_residents') {
        return true;
      }
      
      if (a.audience === 'staff_only') {
        return false;
      }
      
      if (a.audience === 'specific_zone' && a.selected_sitios && a.selected_sitios.length > 0 && this.currentUserSitio) {
        const userSitioId = this.sitios.find(s => s.name === this.currentUserSitio)?._id;
        return userSitioId && a.selected_sitios.includes(userSitioId);
      }
      
      return false;
    });
  }

  async loadData() {
    await Promise.all([
      this.loadAnnouncements(),
      this.loadSitios(),
      this.loadCurrentUserSitio()
    ]);
  }

  async loadAnnouncements() {
    const data = await this.announcementsService.getAnnouncements();
    this.announcements = data || [];
  }

  async loadSitios() {
    const data = await this.sitiosService.getSitios();
    this.sitios = data || [];
  }

  async loadCurrentUserSitio() {
    const user = this.authService.getCurrentUser();
    this.currentUserSitio = user?.sitio;
  }

  onSearchChange(value: string) {
    this.search = value;
  }

  openAnnouncementDetails(announcement: Announcement) {
    this.selectedAnnouncement = announcement;
    this.showModal = true;
  }

  onModalClosed() {
    this.showModal = false;
    this.selectedAnnouncement = null;
  }
}
