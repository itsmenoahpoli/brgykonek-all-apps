import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    StatusModalComponent,
    NgIcon,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessModal = false;
  showOtpLoadingModal = false;
  showOtpSuccessModal = false;
  showOtpModal = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberDevice: [false],
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      const route = this.getHomeRoute(user?.role);
      this.router.navigate([route]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // Skip max attempts check for admin accounts
      if (!this.authService.isAdminAccount(email) && this.authService.isAccountLocked(email)) {
        this.errorMessage = 'Your account has been disabled temporarily. Max login attempt reached, please contact admin to enable your account';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      const remember = this.loginForm.get('rememberDevice')?.value;
      this.authService.login(email, password, remember).subscribe({
        next: (response) => {
          console.log(response);
          this.isLoading = false;
          if (response.success) {
            this.authService.resetLoginAttempts(email);
            const userType = response.user?.role || '';
            const route = this.getHomeRoute(userType);
            this.router.navigate([route]);
          } else {
            // Only increment attempts for non-admin accounts
            if (!this.authService.isAdminAccount(email)) {
              this.authService.incrementLoginAttempts(email);
              const attempts = this.authService.getLoginAttempts(email);
            }

            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          // Only increment attempts for non-admin accounts
          if (!this.authService.isAdminAccount(email)) {
            this.authService.incrementLoginAttempts(email);
            const attempts = this.authService.getLoginAttempts(email);
          }

          this.errorMessage = 'An error occurred during login';
        },
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
    const user = this.authService.getCurrentUser();
    const route = this.getHomeRoute(user?.role);
    this.router.navigate([route]);
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getHomeRoute(role?: string): string {
    switch (role) {
      case 'admin':
        return '/admin/home';
      case 'resident':
        return '/resident/home';
      default:
        return '/resident/home';
    }
  }
}
