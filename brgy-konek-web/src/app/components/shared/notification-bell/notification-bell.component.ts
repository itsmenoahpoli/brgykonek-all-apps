import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, NotificationItem } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationItem[]>;
  unreadCount$: Observable<number>;
  showDropdown = false;
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
    // Subscribe to notifications to handle real-time updates
    const notificationSub = this.notifications$.subscribe();
    this.subscriptions.push(notificationSub);
    this.notificationService.refresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
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
    this.showDropdown = false;
    
    // Get current user role
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role;
    
    // Navigate based on notification type and user role
    switch (notification.type) {
      case 'announcement':
        if (userRole === 'admin' || userRole === 'staff') {
          this.router.navigate(['/admin/announcements']);
        } else {
          this.router.navigate(['/resident/announcements']);
        }
        break;
      case 'complaint_update':
        if (userRole === 'admin' || userRole === 'staff') {
          this.router.navigate(['/admin/complaints']);
        } else {
          this.router.navigate(['/resident/complaints']);
        }
        break;
      case 'document_request_update':
        if (userRole === 'admin' || userRole === 'staff') {
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

  trackByNotificationId(index: number, notification: NotificationItem): string {
    return notification._id;
  }
}
