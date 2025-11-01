import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User as ServiceUser } from '../../../services/users.service';
import { DashboardLayoutComponent } from '../../../components/shared/dashboard-layout/dashboard-layout.component';
import { StatusModalComponent } from '../../../components/shared/status-modal/status-modal.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

export type User = ServiceUser;

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent, StatusModalComponent],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showSuccessModal = false;
  
  selectedUser: User | null = null;
  userToDelete: User | null = null;
  
  successTitle = '';
  successMessage = '';
  
  searchTerm = '';
  userTypeFilter = 'all';
  statusFilter = 'all';
  
  createForm = {
    name: '',
    email: '',
    password: '',
    user_type: 'resident' as string,
    mobile_number: '',
    address: '',
    birthdate: '',
    is_active: true
  };
  
  editForm = {
    name: '',
    email: '',
    user_type: 'resident' as string,
    mobile_number: '',
    address: '',
    birthdate: '',
    is_active: true
  };
  
  formErrors = {
    name: '',
    email: '',
    password: '',
    user_type: ''
  };
  
  isFormSubmitted = false;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role !== 'admin') {
      this.router.navigate(['/admin/home']);
      return;
    }
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const allUsers = await this.usersService.getUsers() || [];
      this.users = allUsers.filter(user => 
        user.user_type !== 'admin' && 
        !user.isRejected
      );
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.userTypeFilter === 'all' || user.user_type === this.userTypeFilter;
      const matchesStatus = this.statusFilter === 'all' || 
                           (this.statusFilter === 'active' && (user.approved !== false && user.status !== 'inactive')) ||
                           (this.statusFilter === 'inactive' && (user.approved === false || user.status === 'inactive'));
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.isFormSubmitted = false;
    this.createForm = {
      name: '',
      email: '',
      password: '',
      user_type: 'resident',
      mobile_number: '',
      address: '',
      birthdate: '',
      is_active: true
    };
    this.formErrors = {
      name: '',
      email: '',
      password: '',
      user_type: ''
    };
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.showEditModal = true;
    this.isFormSubmitted = false;
    this.editForm = {
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      mobile_number: user.mobile_number || '',
      address: user.address || '',
      birthdate: user.birthdate || '',
      is_active: (user.approved !== false && user.status !== 'inactive')
    };
    this.formErrors = {
      name: '',
      email: '',
      password: '',
      user_type: ''
    };
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  validateForm(formData: any, isEdit = false): boolean {
    this.formErrors = {
      name: '',
      email: '',
      password: '',
      user_type: ''
    };

    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      this.formErrors.name = 'Please enter a name';
      isValid = false;
    }

    if (!formData.email || formData.email.trim() === '') {
      this.formErrors.email = 'Please enter an email';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      this.formErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!isEdit && (!formData.password || formData.password.trim() === '')) {
      this.formErrors.password = 'Please enter a password';
      isValid = false;
    }

    if (!formData.user_type) {
      this.formErrors.user_type = 'Please select a user type';
      isValid = false;
    }

    return isValid;
  }

  async createUser() {
    this.isFormSubmitted = true;
    
    if (!this.validateForm(this.createForm)) {
      return;
    }

    try {
      await this.usersService.createUser(this.createForm);
      this.closeCreateModal();
      this.successTitle = 'User Created';
      this.successMessage = 'User account has been created successfully.';
      this.showSuccessModal = true;
      await this.loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async updateUser() {
    if (!this.selectedUser || !this.selectedUser._id) return;
    
    this.isFormSubmitted = true;
    
    if (!this.validateForm(this.editForm, true)) {
      return;
    }

    try {
      await this.usersService.updateUser(this.selectedUser._id, this.editForm);
      this.closeEditModal();
      this.successTitle = 'User Updated';
      this.successMessage = 'User account has been updated successfully.';
      this.showSuccessModal = true;
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async deleteUser() {
    if (!this.userToDelete || !this.userToDelete._id) return;

    try {
      await this.usersService.deleteUser(this.userToDelete._id);
      this.closeDeleteModal();
      this.successTitle = 'User Deleted';
      this.successMessage = 'User account has been deleted successfully.';
      this.showSuccessModal = true;
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  async toggleUserStatus(user: User) {
    if (!user._id) return;
    
    try {
      const isCurrentlyActive = user.approved !== false && user.status !== 'inactive';
      const newStatus = isCurrentlyActive ? 'inactive' : 'approved';
      const newApproved = !isCurrentlyActive;
      
      await this.usersService.updateUser(user._id, { 
        approved: newApproved, 
        status: newStatus 
      });
      
      this.successTitle = isCurrentlyActive ? 'User Disabled' : 'User Enabled';
      this.successMessage = `User account has been ${isCurrentlyActive ? 'disabled' : 'enabled'} successfully.`;
      this.showSuccessModal = true;
      await this.loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  onSuccessModalClosed() {
    this.showSuccessModal = false;
  }

  getUserTypeClass(userType: string): string {
    switch (userType) {
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resident':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusClass(user: User): string {
    const isActive = user.approved !== false && user.status !== 'inactive';
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  }
}