import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, NotificationItem } from '../../../services/notification.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationItem[]>;
  unreadCount$: Observable<number>;
  selectedFilter: 'all' | 'unread' | 'announcement' | 'complaint_update' | 'document_request_update' = 'all';
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    const notificationSub = this.notifications$.subscribe();
    this.notificationService.refresh();
    this.subscriptions.push(notificationSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  markAsRead(notification: NotificationItem): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification._id);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  handleNotificationClick(notification: NotificationItem): void {
    this.markAsRead(notification);
    
    // Get current user to determine if admin
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'staff';
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'announcement':
        this.router.navigate(['/announcements']);
        break;
      case 'complaint_update':
        if (isAdmin) {
          // For admin users, navigate to admin complaints page
          // Pass complaint ID as query parameter to open specific complaint
          const complaintId = notification.payload?.['complaint_id'] || notification.payload?.['complaintId'];
          this.router.navigate(['/admin/complaints'], {
            queryParams: complaintId ? { complaintId } : {}
          });
        } else {
          // For resident users, navigate to resident complaints
          this.router.navigate(['/resident/complaints']);
        }
        break;
      case 'document_request_update':
        if (isAdmin) {
          this.router.navigate(['/admin/document-requests']);
        } else {
          this.router.navigate(['/resident/list-of-reports']);
        }
        break;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'announcement':
        return 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z';
      case 'complaint_update':
        return 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'document_request_update':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      default:
        return 'M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'announcement':
        return 'text-blue-600';
      case 'complaint_update':
        return 'text-red-600';
      case 'document_request_update':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  getFilteredNotifications(notifications: NotificationItem[]): NotificationItem[] {
    if (this.selectedFilter === 'all') {
      return notifications;
    } else if (this.selectedFilter === 'unread') {
      return notifications.filter(n => !n.read);
    } else {
      return notifications.filter(n => n.type === this.selectedFilter);
    }
  }

  getNotificationTypeLabel(type: string): string {
    switch (type) {
      case 'announcement':
        return 'Announcement';
      case 'complaint_update':
        return 'Complaint';
      case 'document_request_update':
        return 'Document Request';
      default:
        return 'Notification';
    }
  }

  trackByNotificationId(index: number, notification: NotificationItem): string {
    return notification._id;
  }

  getDocumentRequestCount(): number {
    // This would be calculated from the notifications observable
    // For now, return 0 as a placeholder - in a real implementation,
    // you would subscribe to notifications$ and filter by type
    return 0;
  }
}