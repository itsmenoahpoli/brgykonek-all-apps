import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-landing-layout',
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, NgIconComponent],
})
export class LandingLayoutComponent {
  mobileMenuOpen = false;

  constructor(private router: Router) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  goHome() {
    this.router.navigate(['/']);
    this.mobileMenuOpen = false;
  }

  goContact() {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.mobileMenuOpen = false;
  }

  goServices() {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.mobileMenuOpen = false;
  }

  goLogin() {
    this.router.navigate(['/login']);
    this.mobileMenuOpen = false;
  }

  goAnnouncements() {
    this.router.navigate(['/announcements']);
    this.mobileMenuOpen = false;
  }
}
