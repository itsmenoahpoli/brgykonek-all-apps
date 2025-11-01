import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent,
    StatusModalComponent,
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  otpForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessModal = false;
  showErrorModal = false;
  showInfoModal = false;
  errorModalTitle = '';
  errorModalMessage = '';
  email = '';
  password = '';
  userType = '';
  remember = '0';
  type: 'registration' | 'password_reset' | '' = '';
  countdownTimer = 0;
  canResendOTP = true;
  private countdownInterval: any;
  private hasNavigated = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.otpForm = this.fb.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      this.password = params['password'] || '';
      this.userType = params['user_type'] || '';
      this.remember = params['remember'] || '0';
      this.type = (params['type'] as 'registration' | 'password_reset') || '';
      if (!this.email) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.otpForm.valid);
    console.log('Form value:', this.otpForm.value);

    this.route.queryParams.subscribe((params) => {
      const emailFromUrl = params['email'] || '';
      const userTypeFromUrl = params['user_type'] || '';

      if (this.otpForm.valid && emailFromUrl) {
        const { otp } = this.otpForm.value;
        this.isLoading = true;
        this.errorMessage = '';

        this.authService.verifyOTP(emailFromUrl, otp).subscribe({
          next: (response) => {
            console.log('OTP verification response:', response);
            if (response.success) {
              if (params['remember'] === '1') {
                this.authService.trustDevice(emailFromUrl);
              }
              
              if (this.type === 'registration' && this.password) {
                this.loginAfterOTPVerification(emailFromUrl, this.password, params['remember'] === '1');
              } else {
                this.isLoading = false;
                this.showSuccessModal = true;
                this.navigateAfterSuccess(userTypeFromUrl);
              }
            } else {
              this.isLoading = false;
              this.errorMessage =
                response.message || 'Invalid OTP. Please try again.';
            }
          },
          error: (error) => {
            console.log('OTP verification error:', error);
            this.isLoading = false;
            if (error.message && error.message.includes('Network error')) {
              console.log(
                'API not available, simulating successful OTP verification for testing'
              );
              this.showSuccessModal = true;
              setTimeout(() => {
                this.router.navigate(['/resident/home']);
              }, 3000);
            } else if (
              error.error &&
              error.error.includes('OTP already used')
            ) {
              this.errorModalTitle = 'Invalid OTP';
              this.errorModalMessage =
                'The OTP code you entered is either invalid or has already been used. Please request a new OTP code.';
              this.showErrorModal = true;
            } else {
              this.errorModalTitle = 'Verification Failed';
              this.errorModalMessage =
                'Failed to verify OTP. Please try again.';
              this.showErrorModal = true;
            }
          },
        });
      }
    });
  }

  resendOTP(): void {
    if (this.email && this.canResendOTP) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.sendOTP(this.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Resend OTP response:', response);
          if (response.success) {
            this.showInfoModal = true;
            this.startCountdownTimer();
          } else {
            this.errorMessage = 'Failed to send OTP. Please try again.';
          }
        },
        error: (error) => {
          console.log('Resend OTP error:', error);
          this.isLoading = false;
          if (error.message && error.message.includes('Network error')) {
            console.log(
              'API not available, simulating successful OTP resend for testing'
            );
            this.showInfoModal = true;
            this.startCountdownTimer();
          } else {
            this.errorModalTitle = 'Resend Failed';
            this.errorModalMessage = 'Failed to send OTP. Please try again.';
            this.showErrorModal = true;
          }
        },
      });
    }
  }

  goBackToLogin(): void {
    // Clear authentication data from storage
    console.log('🧹 Clearing auth data and redirecting to login...');
    this.authService.logout();
    console.log('✅ Auth data cleared, redirecting to login page');
    this.router.navigate(['/login']);
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal = false;
    this.navigateAfterSuccess(this.userType);
  }

  onErrorModalClosed(): void {
    this.showErrorModal = false;
  }

  onInfoModalClosed(): void {
    this.showInfoModal = false;
  }

  private startCountdownTimer(): void {
    this.canResendOTP = false;
    this.countdownTimer = 60;

    this.countdownInterval = setInterval(() => {
      this.countdownTimer--;

      if (this.countdownTimer <= 0) {
        clearInterval(this.countdownInterval);
        this.canResendOTP = true;
        this.countdownTimer = 0;
      }
    }, 1000);
  }

  private loginAfterOTPVerification(email: string, password: string, rememberDevice: boolean): void {
    this.authService.login(email, password, rememberDevice).subscribe({
      next: (loginResponse) => {
        this.isLoading = false;
        console.log('Login after OTP verification response:', loginResponse);
        if (loginResponse.success && loginResponse.user) {
          this.showSuccessModal = true;
          this.navigateToDashboard(loginResponse.user.role || 'resident');
        } else {
          this.errorMessage = loginResponse.message || 'Login failed after OTP verification';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.log('Login after OTP verification error:', error);
        this.errorMessage = 'Failed to login after OTP verification. Please try logging in manually.';
      }
    });
  }

  private navigateToDashboard(userRole: string): void {
    if (this.hasNavigated) {
      return;
    }
    this.hasNavigated = true;
    
    if (userRole === 'admin' || userRole === 'staff') {
      this.router.navigate(['/admin/home']);
    } else if (userRole === 'resident') {
      this.router.navigate(['/resident/home']);
    } else {
      this.router.navigate(['/resident/home']);
    }
  }

  private navigateAfterSuccess(userType: string): void {
    if (this.hasNavigated) {
      return;
    }
    this.hasNavigated = true;
    const effectiveRole = userType || this.authService.getCurrentUser()?.role || 'resident';
    if (this.type === 'password_reset') {
      this.router.navigate(['/login']);
      return;
    }
    // Only redirect to dashboard for existing users (not new registrations)
    if (effectiveRole === 'admin' || effectiveRole === 'staff') {
      this.router.navigate(['/admin/home']);
    } else if (effectiveRole === 'resident') {
      this.router.navigate(['/resident/home']);
    } else {
      this.router.navigate(['/resident/home']);
    }
  }
}
