import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManagerManagementComponent } from './manager-management.component';
import { UserService } from '../../../services/users/user-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { User } from '../../../services/users/user';
import { environment } from '../../../../environments/environments';

describe('ManagerManagementComponent', () => {
  let component: ManagerManagementComponent;
  let fixture: ComponentFixture<ManagerManagementComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUsers: User[] = [
    { id: 'user1', email: 'manager1@example.com', name: 'Manager One', role_id: environment.manager_role_id, image: 'image1.jpg' },
    { id: 'user2', email: 'writer1@example.com', name: 'Writer One', role_id: environment.writer_role_id, image: 'image2.jpg' },
    { id: 'user3', email: 'no-role@example.com', name: 'No Role User', role_id: 'No Role', image: 'image3.jpg' }
  ];

  beforeEach(async () => {
    // Create spy object for UserService
    mockUserService = jasmine.createSpyObj('UserService', [
      'getUsersByRoles', 
      'updateUser', 
      'deleteUser'
    ]);

    await TestBed.configureTestingModule({
      imports: [ManagerManagementComponent, CommonModule, FormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerManagementComponent);
    component = fixture.componentInstance;

    // Setup mock responses
    mockUserService.getUsersByRoles.and.returnValue(of(mockUsers));
    mockUserService.updateUser.and.returnValue(of(undefined));
    mockUserService.deleteUser.and.returnValue(of(undefined));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users with manager, writer or no role on initialization', fakeAsync(() => {
    // Trigger ngOnInit
    fixture.detectChanges();
    tick();

    expect(mockUserService.getUsersByRoles).toHaveBeenCalledWith([
      environment.manager_role_id,
      environment.writer_role_id,
      'No Role'
    ]);
    expect(component.users).toEqual(mockUsers);
  }));

  it('should correctly show role names', () => {
    expect(component.showRoleName(environment.admin_role_id)).toBe('Admin');
    expect(component.showRoleName(environment.manager_role_id)).toBe('Manager');
    expect(component.showRoleName(environment.writer_role_id)).toBe('Writer');
    expect(component.showRoleName('invalid-role')).toBe('No Role');
  });

  it('should open and close modal correctly', () => {
    const testUser = mockUsers[0];
    
    // Open modal
    component.openModal(testUser);
    expect(component.isModalOpen).toBeTrue();
    expect(component.selectedUser).toEqual(testUser);
    expect(component.selectedRoleId).toBe(testUser.role_id);

    // Close modal
    component.closeModal();
    expect(component.isModalOpen).toBeFalse();
    expect(component.selectedUser).toBeNull();
    expect(component.selectedRoleId).toBe('');
  });

  it('should save role changes and refresh users', fakeAsync(() => {
    const testUser = mockUsers[0];
    const newRole = environment.writer_role_id;
    
    component.openModal(testUser);
    component.selectedRoleId = newRole;
    
    component.saveRoleChanges();
    tick();

    expect(mockUserService.updateUser).toHaveBeenCalledWith({
      ...testUser,
      role_id: newRole
    });
    expect(mockUserService.getUsersByRoles).toHaveBeenCalledTimes(2); // Once on init, once after update
    expect(component.isModalOpen).toBeFalse();
  }));

  it('should paginate users correctly', () => {
    component.users = mockUsers;
    component.itemsPerPage = 2;

    // First page
    component.currentPage = 1;
    expect(component.paginatedUsers).toEqual(mockUsers.slice(0, 2));
    expect(component.getPageNumbers()).toEqual([1, 2]);

    // Second page
    component.currentPage = 2;
    expect(component.paginatedUsers).toEqual(mockUsers.slice(2, 4));
  });

  it('should delete user and update list', fakeAsync(() => {
    const userIdToDelete = 'user1';
    component.users = [...mockUsers];
    
    component.deleteUser(userIdToDelete);
    tick();

    expect(mockUserService.deleteUser).toHaveBeenCalledWith(userIdToDelete);
    expect(component.users.length).toBe(2);
    expect(component.users.some(u => u.id === userIdToDelete)).toBeFalse();
  }));

  it('should change page correctly', () => {
    component.users = [...mockUsers];
    component.itemsPerPage = 1;
    
    // Test valid page changes
    component.changePage(2);
    expect(component.currentPage).toBe(2);
    
    // Test minimum boundary
    component.changePage(0);
    expect(component.currentPage).toBe(0);
    
    // Test maximum boundary
    component.changePage(4);
    expect(component.currentPage).toBe(4); // 3 pages total (3 users / 1 per page)
    
    // Test with different items per page
    component.itemsPerPage = 2;
    component.changePage(2);
    expect(component.currentPage).toBe(2); // 2 pages total (3 users / 2 per page = ceil(1.5) = 2)
    
    component.changePage(3);
    expect(component.currentPage).toBe(3); // Should not exceed max page
  });
});