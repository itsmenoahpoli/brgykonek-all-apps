import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface Announcement {
  _id: string;
  banner_image: string;
  title: string;
  header: string;
  body: string;
  status: string;
  posted_by?: string;
  category?: 'Health' | 'Safety' | 'Events' | string;
  audience?: 'All Residents' | 'Specific Zone' | 'Staff Only' | string;
  publish_at?: string;
  created_at: string;
  updated_at?: string;
  selected_sitios?: string[];
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private baseUrl = '/announcements';

  async getAnnouncements(): Promise<Announcement[] | undefined> {
    try {
      const res = await apiClient.get<Announcement[]>(this.baseUrl);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async addAnnouncement(announcement: Announcement): Promise<any> {
    try {
      const res = await apiClient.post(this.baseUrl, {
        posted_by: 'admin',
        title_slug: announcement.title.toLowerCase().replace(/ /g, '-'),
        ...announcement,
      });
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async addAnnouncementWithFile(formData: FormData): Promise<any> {
    try {
      const res = await apiClient.post(this.baseUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateAnnouncement(
    _id: string,
    announcement: Announcement
  ): Promise<any> {
    try {
      const res = await apiClient.put(`${this.baseUrl}/${_id}`, announcement);
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async updateAnnouncementWithFile(_id: string, formData: FormData): Promise<any> {
    try {
      const res = await apiClient.put(`${this.baseUrl}/${_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      return undefined;
    }
  }

  async deleteAnnouncement(_id: string): Promise<any> {
    try {
      const res = await apiClient.delete(`${this.baseUrl}/${_id}`);
      return res;
    } catch (error) {
      return undefined;
    }
  }
}
