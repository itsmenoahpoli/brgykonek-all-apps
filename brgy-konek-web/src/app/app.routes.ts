import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin/profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-v2/register-v2.component').then(
        (m) => m.RegisterV2Component
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },

  {
    path: 'verify-otp',
    loadComponent: () =>
      import('./pages/verify-otp/verify-otp.component').then(
        (m) => m.VerifyOtpComponent
      ),
  },
  {
    path: 'admin/home',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'admin/announcements',
    loadComponent: () =>
      import('./pages/admin/announcements/announcements.component').then(
        (m) => m.AnnouncementsComponent
      ),
  },
  {
    path: 'admin/pending-approval',
    loadComponent: () =>
      import('./pages/admin/pending-approval/pending-approval.component').then(
        (m) => m.PendingApprovalComponent
      ),
  },
  {
    path: 'admin/accounts',
    loadComponent: () =>
      import('./pages/admin/accounts/accounts.component').then(
        (m) => m.AccountsComponent
      ),
  },
  {
    path: 'admin/complaints',
    loadComponent: () =>
      import('./pages/admin/complaints/complaints.component').then(
        (m) => m.ComplaintsComponent
      ),
  },
  {
    path: 'admin/document-requests',
    loadComponent: () =>
      import('./pages/admin/document-requests/document-requests.component').then(
        (m) => m.DocumentRequestsComponent
      ),
  },
  {
    path: 'admin/notifications',
    loadComponent: () =>
      import('./pages/resident/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
  },
  {
    path: 'resident/home',
    loadComponent: () =>
      import('./pages/resident/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'resident/announcements',
    loadComponent: () =>
      import('./pages/resident/announcements/announcements.component').then(
        (m) => m.AnnouncementsComponent
      ),
  },
  {
    path: 'resident/complaints',
    loadComponent: () =>
      import('./pages/resident/complaints/complaints.component').then(
        (m) => m.ComplaintsComponent
      ),
  },
  {
    path: 'resident/list-of-reports',
    loadComponent: () =>
      import('./pages/resident/list-of-reports/list-of-reports.component').then(
        (m) => m.ListOfReportsComponent
      ),
  },
  {
    path: 'resident/notifications',
    loadComponent: () =>
      import('./pages/resident/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
  },
  {
    path: 'announcements',
    loadComponent: () =>
      import('./pages/announcements/announcements.component').then(
        (m) => m.AnnouncementsComponent
      ),
  },
];
