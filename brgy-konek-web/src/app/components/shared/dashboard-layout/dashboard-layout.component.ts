import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService, NotificationItem } from '../../../services/notification.service';
import { NgIcon } from '@ng-icons/core';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, NgIcon, NotificationBellComponent, RouterModule, ConfirmDeleteModalComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  sidebarOpen = true;
  isMobile = false;
  breadcrumbs: { label: string; url: string }[] = [];
  sidebarLinks: { label: string; icon: string; route: string }[] = [];
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  showLogoutConfirmationModal = false;
  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationsService: NotificationService
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'resident') {
      this.sidebarLinks = [
        {
          label: 'Dashboard',
          icon: 'heroHome',
          route: 'resident/home',
        },
        {
          label: 'Complaints',
          icon: 'heroExclamationTriangle',
          route: 'resident/complaints',
        },
        {
          label: 'Announcements',
          icon: 'heroSpeakerWave',
          route: 'resident/announcements',
        },
        {
          label: 'Notifications',
          icon: 'heroBell',
          route: 'resident/notifications',
        },
        {
          label: 'List of Request Documents',
          icon: 'heroDocumentText',
          route: 'resident/list-of-reports',
        },
        {
          label: 'Profile',
          icon: 'heroUser',
          route: 'profile',
        },
      ];
    } else if (currentUser?.role === 'admin') {
      this.sidebarLinks = [
        { label: 'Dashboard', icon: 'heroHome', route: 'admin/home' },
        {
          label: 'Pending Approval',
          icon: 'heroClock',
          route: 'admin/pending-approval',
        },
        {
          label: 'Account Management',
          icon: 'heroUsers',
          route: 'admin/accounts',
        },
        { label: 'Document Requests', icon: 'heroDocumentText', route: 'admin/document-requests' },
        { label: 'Complaints', icon: 'heroExclamationTriangle', route: 'admin/complaints' },
        {
          label: 'Announcements',
          icon: 'heroSpeakerWave',
          route: 'admin/announcements',
        },
        {
          label: 'Notifications',
          icon: 'heroBell',
          route: 'admin/notifications',
        },
        {
          label: 'Permission Requests',
          icon: 'heroClipboardDocumentCheck',
          route: 'admin/permission-requests',
        },
        {
          label: 'Profile',
          icon: 'heroUser',
          route: 'admin/profile',
        },
      ];
    } else if (currentUser?.role === 'staff') {
      this.sidebarLinks = [
        { label: 'Dashboard', icon: 'heroHome', route: 'admin/home' },
        {
          label: 'Pending Approval',
          icon: 'heroClock',
          route: 'admin/pending-approval',
        },
        { label: 'Document Requests', icon: 'heroDocumentText', route: 'admin/document-requests' },
        { label: 'Complaints', icon: 'heroExclamationTriangle', route: 'admin/complaints' },
        {
          label: 'Announcements',
          icon: 'heroSpeakerWave',
          route: 'admin/announcements',
        },
        {
          label: 'Notifications',
          icon: 'heroBell',
          route: 'admin/notifications',
        },
        {
          label: 'Profile',
          icon: 'heroUser',
          route: 'admin/profile',
        },
      ];
    } else {
      this.sidebarLinks = [];
    }
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
      });

    const currentUserForNotifications = this.authService.getCurrentUser();
    if (currentUserForNotifications?.id) {
      this.notificationsService.refresh().then(() => {
        this.notificationsService.notifications$.subscribe((items) => {
          this.notifications = items || [];
          this.unreadCount = (this.notifications || []).filter((n) => !n.read).length;
        });
      });
    }
  }

  ngOnInit() {
    this.checkMobileView();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileView();
  }

  private checkMobileView() {
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
    if (this.isMobile) {
      this.sidebarOpen = false; // Collapse sidebar on mobile
    } else {
      this.sidebarOpen = true; // Expand sidebar on desktop
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  openLogoutConfirmation() {
    this.showLogoutConfirmationModal = true;
  }
  onLogoutCancelled() {
    this.showLogoutConfirmationModal = false;
  }
  onLogoutConfirmed() {
    this.showLogoutConfirmationModal = false;
    this.logout();
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  goNotifications() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    for (const n of this.notifications) {
      if (!n.read) this.notificationsService.markAsRead(n._id);
    }
    this.unreadCount = 0;
  }
  goToSidebarLink(link: any) {
    this.router.navigate([link.route]);
  }
  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = []
  ): { label: string; url: string }[] {
    let children = route.children;
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard Overview', url: '' });
      breadcrumbs.push({ label: 'Home', url: '/home' });
    }
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (let child of children) {
      let routeURL = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '' && routeURL !== 'home') {
        url += `/${routeURL}`;
        let label =
          routeURL.charAt(0).toUpperCase() +
          routeURL.slice(1).replace('-', ' ');
        breadcrumbs.push({ label, url });
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
