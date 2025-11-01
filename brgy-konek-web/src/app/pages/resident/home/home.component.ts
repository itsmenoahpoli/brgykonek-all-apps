import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { AuthService, User } from '../../../services/auth.service';
import { ResidentDashboardService, ResidentDashboardStats } from '../../../services/resident-dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isPendingApproval = false;
  currentUser: User | null = null;
  dashboardStats: ResidentDashboardStats = {
    pendingComplaints: 0,
    resolvedComplaints: 0,
    documentRequests: 0
  };
  isLoading = true;

  constructor(
    private authService: AuthService,
    private dashboardService: ResidentDashboardService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkPendingStatus();
    this.loadDashboardData();
    
    this.authService.fetchProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.checkPendingStatus();
        this.loadDashboardData();
      },
    });

    this.authService.checkApprovalStatus().subscribe((approved) => {
      if (this.currentUser) {
        this.isPendingApproval = this.currentUser.role === 'resident' && !approved;
      }
    });
  }

  private checkPendingStatus(): void {
    if (this.currentUser) {
      this.isPendingApproval = this.currentUser.role === 'resident' && !this.currentUser.approved;
    }
  }

  private async loadDashboardData(): Promise<void> {
    if (!this.currentUser?.id) {
      this.isLoading = false;
      return;
    }

    try {
      const stats = await this.dashboardService.getDashboardStats(this.currentUser.id);
      if (stats) {
        this.dashboardStats = stats;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
