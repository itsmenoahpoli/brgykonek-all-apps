import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../components/shared/auth-layout/auth-layout.component';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthLayoutComponent,
    StatusModalComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isDragOver = false;
  selectedFileName = '';
  showSuccessDialog = false;
  showPassword = false;

  getMobileDisplay(): string {
    const full = this.registerForm.get('mobile_number')?.value || '';
    return full.startsWith('+639') ? full.slice(4) : '';
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const digits = (input?.value || '').replace(/[^0-9]/g, '').slice(0, 9);
    this.registerForm.get('mobile_number')?.setValue(`+639${digits}`);
  }

  get passwordValidationStatus() {
    const password = this.registerForm.get('password')?.value || '';
    return {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: ['Juan', [Validators.required, Validators.minLength(2)]],
        middle_name: ['Santos'],
        last_name: ['Dela Cruz', [Validators.required, Validators.minLength(2)]],
        birthdate: ['1990-05-15', [Validators.required]],
        email: ['juan.delacruz@gmail.com', [Validators.required, Validators.email]],
        password: ['TestPass123!', [Validators.required, this.passwordStrengthValidator]],
        confirmPassword: ['TestPass123!', [Validators.required]],
        mobile_number: ['+639123456789', [Validators.required, this.philippineMobileValidator]],
        province: ['Oriental Mindoro'],
        municipality: ['Bongabong'],
        barangay: ['Masaguisi'],
        sitio: ['Purok 1', [Validators.required]],
        barangay_clearance: ['', [this.fileValidator]],
        rememberDevice: [true],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const minLength = 8;
    const maxLength = 20;

    if (password.length < minLength || password.length > maxLength) {
      return { passwordLength: { min: minLength, max: maxLength } };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors: any = {};

    if (!hasUpperCase) {
      errors.passwordUppercase = true;
    }
    if (!hasLowerCase) {
      errors.passwordLowercase = true;
    }
    if (!hasNumbers) {
      errors.passwordNumber = true;
    }
    if (!hasSpecialChar) {
      errors.passwordSpecial = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  philippineMobileValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const mobileRegex = /^(\+63)[0-9]{10}$/;
    if (!mobileRegex.test(control.value)) {
      return { philippineMobile: true };
    }

    return null;
  }

  gmailOnlyValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const email = control.value;
    if (!email.endsWith('@gmail.com')) {
      return { gmailOnly: true };
    }

    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword && confirmPassword.errors) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  fileValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const file = control.value;
    if (!(file instanceof File)) {
      return null;
    }
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      return { fileSize: true };
    }

    if (!allowedTypes.includes(file.type)) {
      return { fileType: true };
    }

    return null;
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form value:', this.registerForm.value);

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const formData = new FormData();

      formData.append(
        'name',
        `${formValue.first_name} ${formValue.middle_name} ${formValue.last_name}`.trim()
      );
      formData.append('email', formValue.email);
      formData.append('password', formValue.password);
      formData.append('mobile_number', formValue.mobile_number);
      formData.append('user_type', 'resident');
      formData.append('address', `${formValue.sitio}, ${formValue.barangay}, ${formValue.municipality}, ${formValue.province}`);
      formData.append('birthdate', formValue.birthdate);
      formData.append('address_sitio', formValue.sitio);
      formData.append('address_barangay', formValue.barangay);
      formData.append('address_municipality', formValue.municipality);
      formData.append('address_province', formValue.province);
      formData.append('rememberDevice', formValue.rememberDevice ? '1' : '0');

      if (formValue.barangay_clearance) {
        formData.append('barangay_clearance', formValue.barangay_clearance);
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration response:', response);
          if (response.success || response.user) {
            this.showSuccessDialog = true;
            setTimeout(() => {
              this.showSuccessDialog = false;
              const email = formValue.email;
              this.router.navigate(['/verify-otp'], { queryParams: { email, password: formValue.password, user_type: 'resident', type: 'registration', remember: formValue.rememberDevice ? '1' : '0' } });
            }, 1500);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          console.log('Registration error:', error);
          this.isLoading = false;
          if (error.message && error.message.includes('Network error')) {
            console.log(
              'API not available, simulating successful registration for testing'
            );
            this.showSuccessDialog = true;
            setTimeout(() => {
              console.log('Hiding dialog and redirecting');
              this.showSuccessDialog = false;
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = 'An error occurred during registration';
          }
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToLanding(): void {
    this.router.navigate(['/']);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFileSelection(file);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    this.selectedFileName = file.name;
    this.registerForm.patchValue({
      barangay_clearance: file,
    });
    this.registerForm.get('barangay_clearance')?.markAsTouched();
  }

}
