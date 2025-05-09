import { Component } from '@angular/core';
import { User } from '../../../services/users/user';
import { UserService } from '../../../services/users/user-service.service';
import { environment } from '../../../../environments/environments';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-management.component.html',
  styleUrl: './manager-management.component.css'
})
export class ManagerManagementComponent {
  environment = {
    admin_role_id: environment.admin_role_id,
    manager_role_id: environment.manager_role_id,
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
    const roles = [environment.manager_role_id, environment.writer_role_id, 'No Role'];
    this.userService.getUsersByRoles(roles).subscribe(users => {
      this.users = users ?? [];
    });
  }

  showRoleName(roleId: string) {
    switch (roleId) {
      case environment.admin_role_id:
        return 'Admin';
      case environment.manager_role_id:
        return 'Manager';
      case environment.writer_role_id:
        return 'Writer';
      default:
        return 'No Role';
    }
  }

    openModal(user: User) {
      this.selectedUser = user;
      this.selectedRoleId = user.role_id;
      this.isModalOpen = true;
    }
  
    closeModal() {
      this.isModalOpen = false;
      this.selectedUser = null;
      this.selectedRoleId = '';
    }
  
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
    this.userService.deleteUser(userId).subscribe(() => {
      this.users = this.users.filter(user => user.id !== userId);
    });
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}