import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../components/shared/dashboard-layout/dashboard-layout.component';
import { AuthService, User } from '../../services/auth.service';
import { StatusModalComponent } from '../../components/shared/status-modal/status-modal.component';
import { PermissionRequestService } from '../../services/permission-request.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DashboardLayoutComponent, StatusModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isSavingProfile = false;
  isChangingPassword = false;
  profileSuccess = false;
  profileError = '';
  passwordError = '';
  passwordSuccess = false;
  showValidationAlert = false;
  showPermissionWarningModal = false;
  permissionReason = '';
  permissionRequestSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private permissionRequestService: PermissionRequestService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.populateProfileForm();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: [''],
      phone: ['', [Validators.required]],
      sitio: ['', [Validators.required]],
      municipality: ['Bongabong'],
      province: ['Oriental Mindoro'],
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_new_password: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });
  }

  private populateProfileForm(): void {
    if (!this.user) return;

    const fullName = [this.user.firstName, this.user.middleName, this.user.lastName]
      .filter(name => name && name.trim())
      .join(' ');

    this.profileForm.patchValue({
      fullName: fullName || '',
      email: this.user.email || '',
      phone: this.user.phone || '',
      sitio: this.user.sitio || '',
      municipality: this.user.city || 'Bongabong',
      province: this.user.province || 'Oriental Mindoro',
    });
  }

  passwordsMatchValidator(group: AbstractControl) {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_new_password')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      group.get('confirm_new_password')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  saveProfile(): void {
    if (!this.profileForm.valid) {
      console.log('Form is invalid, showing validation alert');
      this.showValidationAlert = true;
      this.markFormGroupTouched(this.profileForm);
      return;
    }
    
    this.showValidationAlert = false;

    // Check if user is resident - show warning modal
    if (this.user?.role === 'resident') {
      this.showPermissionWarningModal = true;
      return;
    }

    // For admin/staff, proceed with save directly
    this.proceedWithSave();
  }

  proceedWithSave(): void {
    console.log('Form is valid, proceeding with save...');
    console.log('Form value:', this.profileForm.value);
    
    this.isSavingProfile = true;
    this.profileError = '';
    
    const formValue = this.profileForm.value;
    const payload = {
      name: formValue.fullName.trim(),
      mobile_number: formValue.phone,
      address_sitio: formValue.sitio,
      address_barangay: 'Masaguisi',
      address_municipality: formValue.municipality,
      address_province: formValue.province,
    };
    
    console.log('Payload:', payload);
    
    this.authService.updateProfile(payload as any).subscribe({
      next: (res) => {
        console.log('Profile update response:', res);
        this.isSavingProfile = false;
        if (res.success) {
          this.user = res.user || null;
          this.profileSuccess = true;
        } else {
          this.profileError = res.message || 'Failed to update profile';
        }
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.isSavingProfile = false;
        this.profileError = error.message || 'Failed to update profile';
      }
    });
  }

  async onPermissionWarningConfirm(): Promise<void> {
    if (!this.permissionReason || this.permissionReason.trim() === '') {
      return;
    }

    if (!this.user?.id) {
      this.profileError = 'User not found';
      return;
    }

    this.isSavingProfile = true;
    this.profileError = '';

    // Get current values from user
    const currentValue = {
      name: this.user.firstName || '',
      mobile_number: this.user.phone || '',
      address_sitio: this.user.sitio || '',
      address_municipality: this.user.city || '',
      address_province: this.user.province || '',
    };

    // Get requested changes from form
    const formValue = this.profileForm.value;
    const requestChangeValue = {
      name: formValue.fullName.trim(),
      mobile_number: formValue.phone,
      address_sitio: formValue.sitio,
      address_municipality: formValue.municipality,
      address_province: formValue.province,
    };

    try {
      const result = await this.permissionRequestService.createPermissionRequest({
        current_value: currentValue,
        request_change_value: requestChangeValue,
        reason: this.permissionReason.trim(),
      });

      if (result) {
        this.showPermissionWarningModal = false;
        this.permissionReason = '';
        this.permissionRequestSuccess = true;
        this.profileError = '';
      } else {
        this.profileError = 'Failed to submit permission request. Please try again.';
      }
    } catch (error: any) {
      this.profileError = error.message || 'Failed to submit permission request. Please try again.';
    } finally {
      this.isSavingProfile = false;
    }
  }

  onPermissionWarningCancel(): void {
    this.showPermissionWarningModal = false;
    this.permissionReason = '';
  }

  changePassword(): void {
    if (!this.passwordForm.valid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }
    
    this.isChangingPassword = true;
    this.passwordError = '';
    
    const currentPassword = this.passwordForm.get('current_password')?.value;
    const newPassword = this.passwordForm.get('new_password')?.value;
    
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        if (res.success) {
          this.passwordSuccess = true;
          this.passwordForm.reset();
        } else {
          this.passwordError = res.message || 'Failed to change password';
        }
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.passwordError = error.message || 'Failed to change password';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onProfileSuccessClosed(): void {
    this.profileSuccess = false;
  }

  onPasswordSuccessClosed(): void {
    this.passwordSuccess = false;
  }

  onPermissionRequestSuccessClosed(): void {
    this.permissionRequestSuccess = false;
  }

  onButtonClick(): void {
    console.log('=== BUTTON CLICKED ===');
    console.log('Form valid:', this.profileForm.valid);
    console.log('Form touched:', this.profileForm.touched);
    console.log('Form dirty:', this.profileForm.dirty);
    console.log('Form value:', this.profileForm.value);
  }

  onFormFieldChange(): void {
    if (this.showValidationAlert && this.profileForm.valid) {
      this.showValidationAlert = false;
    }
  }
}
