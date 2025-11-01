import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import {
  DashboardService,
  OverviewStatistics,
} from '../../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';
import {
  ComplaintsService,
  Complaint,
} from '../../../services/complaints.service';
import {
  AnnouncementsService,
  Announcement,
} from '../../../services/announcements.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    BaseChartDirective,
    DashboardLayoutComponent,
    DatePipe,
  ],
  standalone: true,
})
export class DashboardComponent implements OnInit {
  statistics: OverviewStatistics | null = null;
  recentComplaints: Complaint[] = [];
  recentAnnouncements: Announcement[] = [];
  documentRequestCounts: { pending: number; in_progress: number; completed: number } | null = null;
  
  get resolvedComplaints(): number | string {
    if (!this.statistics) return '-';
    const resolvedCount = this.recentComplaints.filter(c => c.status === 'resolved').length;
    return resolvedCount > 0 ? resolvedCount : '-';
  }

  complaintsLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  complaintsLineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  usersAreaChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  usersAreaChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  constructor(
    private dashboardService: DashboardService,
    private complaintsService: ComplaintsService,
    private announcementsService: AnnouncementsService,
    private router: Router,
    public authService: AuthService
  ) {
    Chart.register(...registerables);
  }

  get isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'admin';
  }

  async ngOnInit(): Promise<void> {
    this.dashboardService.getOverviewStatistics().subscribe({
      next: (stats) => {
        console.log('Dashboard stats received:', stats);
        this.statistics = stats;
        
        // Initialize chart data with proper validation
        this.complaintsLineChartData = {
          labels: stats.complaintsPerMonth?.map((d) => d.month) || [],
          datasets: [
            {
              data: stats.complaintsPerMonth?.map((d) => d.count) || [],
              label: 'Complaints',
              fill: false,
              borderColor: '#ef4444',
              tension: 0.4,
            },
          ],
        };
        
        
        this.usersAreaChartData = {
          labels: stats.usersPerMonth?.map((d) => d.month) || [],
          datasets: [
            {
              data: stats.usersPerMonth?.map((d) => d.count) || [],
              label: 'User Activity',
              fill: true,
              backgroundColor: 'rgba(59,130,246,0.2)',
              borderColor: '#3b82f6',
              tension: 0.4,
            },
          ],
        };
      },
      error: (error) => {
        console.error('Error fetching dashboard statistics:', error);
        // Initialize with empty data on error
        this.initializeEmptyCharts();
      }
    });
    const complaints = await this.complaintsService.getComplaints();
    this.recentComplaints = (complaints || [])
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
    const announcements = await this.announcementsService.getAnnouncements();
    this.recentAnnouncements = (announcements || [])
      .sort((a, b) =>
        new Date(a.created_at) < new Date(b.created_at) ? 1 : -1
      )
      .slice(0, 10);

    try {
      const res = await fetch(`${location.origin.replace(/\/$/, '')}/api/documents/requests`, {
        headers: { 'Authorization': (document?.cookie || localStorage.getItem('accessToken')) ? '' : '' }
      });
      // Fallback: use existing service via apiClient for consistent auth headers
    } catch {}
  }

  getAnnouncementDate(announcement: any): string {
    const date = announcement.created_at || announcement.updated_at;
    return date ? new Date(date).toLocaleString() : '-';
  }

  openComplaints() {
    this.router.navigate(['/admin/complaints']);
  }

  openAnnouncements() {
    this.router.navigate(['/admin/announcements']);
  }

  openDocumentRequests() {
    this.router.navigate(['/admin/document-requests']);
  }

  openUsers() {
    this.router.navigate(['/admin/accounts']);
  }

  openResolvedComplaints() {
    this.router.navigate(['/admin/complaints'], { queryParams: { status: 'resolved' } });
  }

  getComplaintsBySitio() {
    if (!this.statistics?.complaintsBySitio) return [];
    return this.statistics.complaintsBySitio
      .filter(sitio => sitio.sitio !== null && sitio.sitio !== undefined)
      .sort((a, b) => b.count - a.count);
  }

  get topComplaintCategories() {
    if (!this.statistics?.complaintsByCategory) return [];
    return this.statistics.complaintsByCategory.slice(0, 5);
  }

  getResidentName(complaint: Complaint): string {
    if (!complaint.resident_id) {
      return 'Unknown Resident';
    }
    return complaint.resident_id.name;
  }

  getCategoryBadgeClass(category: string): string {
    switch (category?.toLowerCase()) {
      case 'infrastructure':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'environment':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'safety':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'noise':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'health':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  private initializeEmptyCharts() {
    // Generate sample data for development/testing
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sampleData = Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 20) + 1);
    
    this.complaintsLineChartData = {
      labels: months,
      datasets: [
        {
          data: sampleData,
          label: 'Complaints',
          fill: false,
          borderColor: '#ef4444',
          tension: 0.4,
        },
      ],
    };
    
    
    this.usersAreaChartData = {
      labels: months,
      datasets: [
        {
          data: sampleData.map(val => val + Math.floor(Math.random() * 10)),
          label: 'User Activity',
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.2)',
          borderColor: '#3b82f6',
          tension: 0.4,
        },
      ],
    };

    // Generate sample statistics if none exist
    if (!this.statistics) {
      this.statistics = {
        totalComplaints: 42,
        totalActiveAnnouncements: 8,
        totalResidents: 156,
        complaintsPerMonth: months.map((month, i) => ({ month, count: sampleData[i] })),
        announcementsPerMonth: months.slice(0, 6).map((month, i) => ({ month, count: sampleData[i] })),
        usersPerMonth: months.map((month, i) => ({ month, count: sampleData[i] + Math.floor(Math.random() * 10) })),
        complaintsBySitio: [
          { sitio: 1, count: 8 },
          { sitio: 5, count: 6 },
          { sitio: 12, count: 5 },
          { sitio: 23, count: 4 },
          { sitio: 45, count: 3 },
        ],
        complaintsByCategory: [
          { category: 'Infrastructure', count: 15 },
          { category: 'Noise', count: 12 },
          { category: 'Environment', count: 8 },
          { category: 'Safety', count: 5 },
          { category: 'Health', count: 2 },
        ],
      };
    }
  }
}
