import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/users/user-service.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUser = {
    email: 'test@example.com',
    uid: '123',
    displayName: 'Test User'
  };

  const mockUserWithRole = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role_id: 'manager',
    image: ''
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'user$']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule,
        NavigationComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: UserService, useValue: mockUserService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;

    mockAuthService.user$ = of(mockUser);
    mockUserService.getUserByEmail.and.returnValue(of(mockUserWithRole));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user data', fakeAsync(() => {
    tick();
    expect(component.user).toEqual(mockUser);
    expect(component.loggedIn).toBeTrue();
  }));

  it('should fetch user role on initialization', fakeAsync(() => {
    tick();
    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(component.userRole).toBe('manager');
  }));
  

  it('should toggle menu', () => {
    expect(component.menuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('should toggle profile menu', () => {
    expect(component.profileMenuOpen).toBeFalse();
    component.toggleProfileMenu();
    expect(component.profileMenuOpen).toBeTrue();
    component.toggleProfileMenu();
    expect(component.profileMenuOpen).toBeFalse();
  });

  it('should navigate to topic overview', () => {
    component.navigateToTopicOverview();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-overview']);
  });

  it('should navigate to my drawings', () => {
    component.navigateToMyDrawings();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/submissions-overview']);
  });

  it('should navigate to manager overview', () => {
    component.navigateToManagerOverview();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/manager-overview']);
  });

  it('should navigate to writer management', () => {
    component.navigateToWriterManagement();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/writer-management']);
  });

  it('should navigate to topic management', () => {
    component.navigateToTopicManagement();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-management']);
  });

  it('should navigate to manager management', () => {
    component.navigateToManagerManagement();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/manager-management']);
  });

  it('should handle error when fetching user role', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    mockUserService.getUserByEmail.and.returnValue(throwError(() => new Error('User fetch error')));
    
    mockAuthService.user$ = of(mockUser);
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user role:', jasmine.any(Object));
  }));
  
});