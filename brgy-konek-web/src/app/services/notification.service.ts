import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import apiClient from '../utils/api.util';

export interface NotificationItem {
  _id: string;
  recipient_id: string;
  type: 'announcement' | 'complaint_update' | 'document_request_update';
  title: string;
  message: string;
  payload?: Record<string, any>;
  read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  async refresh(): Promise<void> {
    const items = await this.getNotifications();
    this.notificationsSubject.next(items);
    this.updateUnreadCount(items);
  }

  private updateUnreadCount(items: NotificationItem[]) {
    const count = items.filter((n) => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get<NotificationItem[]>('/notifications');
      return res.data || [];
    } catch {
      return [];
    }
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.put(`/notifications/${id}/read`, {});
      await this.refresh();
      return true;
    } catch {
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.put(`/notifications/mark-all-read`, {});
      await this.refresh();
      return true;
    } catch {
      return false;
    }
  }
}
