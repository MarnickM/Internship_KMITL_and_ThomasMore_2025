import { Component } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { User } from '../../../services/users/user';
import { UserService } from '../../../services/users/user-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-writer-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './writer-management.component.html',
  styleUrl: './writer-management.component.css'
})
export class WriterManagementComponent {

  environment = {
    writer_role_id: environment.writer_role_id,
    no_role: 'No Role'
  };

  users: User[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  selectedUser: User | null = null;
  selectedRoleId = '';
  isModalOpen: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const roles = [environment.writer_role_id, 'No Role'];
    this.userService.getUsersByRoles(roles).subscribe(users => {
      this.users = users ?? [];
    });
  }

  showRoleName(roleId: string) {
    switch (roleId) {
      case environment.writer_role_id:
        return 'Writer';
      default:
        return 'No Role';
    }
  }

  // Open modal with user details
  openModal(user: User) {
    this.selectedUser = user;
    this.selectedRoleId = user.role_id;
    this.isModalOpen = true;
  }

  // Close modal
  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
    this.selectedRoleId = '';
  }

  // Save role changes
  saveRoleChanges() {
    // console.log('Save role changes:', this.selectedUser, this.selectedRoleId);
    if (this.selectedUser && this.selectedRoleId) {
      this.selectedUser.role_id = this.selectedRoleId;
      this.userService.updateUser(this.selectedUser).subscribe(() => {
        this.closeModal();
        this.loadUsers();
      });
    }
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users?.slice(startIndex, startIndex + this.itemsPerPage) ?? [];
  }

  deleteUser(userId: string) {
    // Open browser confirmation modal
    const confirmation = window.confirm('Are you sure you want to delete this user?');

    // Only proceed if user confirmed
    if (confirmation) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.users = this.users.filter(user => user.id !== userId);
      });
    }
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

}
