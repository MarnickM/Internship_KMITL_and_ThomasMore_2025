import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { GoogleSigninService } from '../../google_signin.service';
import { UserService } from '../../services/users/user-service.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { of } from 'rxjs';
import { NgZone } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleSigninService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNgZone: NgZone;

  const mockUser = {
    email: 'test@example.com',
    name: 'Test User',
    picture: 'test.jpg',
    role_id: 'writer',
    image: 'test.jpg',
  };

  const mockJwt = 'header.payload.signature';
  const mockDecodedJwt = {
    email: 'test@example.com',
    name: 'Test User',
    picture: 'test.jpg'
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockGoogleAuthService = jasmine.createSpyObj('GoogleSigninService', ['signInWithGoogle']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail', 'addUser']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['setUser']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule, 
        CommonModule,
        LoginComponent,
        LoaderComponent
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: GoogleSigninService, useValue: mockGoogleAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: NgZone,
          useValue: new NgZone({enableLongStackTrace: false})
        },
        { provide: SocialAuthService, useValue: { authState: of(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockNgZone = TestBed.inject(NgZone);

    component.writerRoleId = 'writer';
    component.managerRoleId = 'manager';
    component.adminRoleId = 'admin';
    component.noRole = 'no-role';

    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should decode JWT correctly', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicGljdHVyZSI6InRlc3QuanBnIn0.signature';
    const decoded = component.decodeJwt(token);
    
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.name).toBe('Test User');
    expect(decoded.picture).toBe('test.jpg');
  });

  it('should handle invalid JWT decoding', () => {
    const invalidToken = 'invalid.token';
    const decoded = component.decodeJwt(invalidToken);
    expect(decoded).toBeNull();
  });

  it('should save new user if not exists', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of(undefined));
    mockUserService.addUser.and.returnValue(of('new-user-id'));

    component.saveUser(mockDecodedJwt);
    tick();

    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockUserService.addUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      image: 'test.jpg',
      role_id: 'No Role'
    });
  }));

  it('should not save user if already exists', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of(mockUser));

    component.saveUser(mockDecodedJwt);
    tick();

    expect(mockUserService.getUserByEmail).toHaveBeenCalled();
    expect(mockUserService.addUser).not.toHaveBeenCalled();
  }));

  it('should handle credential response and redirect', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of(mockUser));
    
    component.redirectBasedOnRole = jasmine.createSpy('redirectBasedOnRole');
    
    spyOn(component, 'decodeJwt').and.returnValue(mockDecodedJwt);
    spyOn(localStorage, 'setItem');
    
    const mockResponse = { credential: mockJwt };
    (window as any).handleCredentialResponse(mockResponse);
    tick();
  
    expect(component.decodeJwt).toHaveBeenCalledWith(mockJwt);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockDecodedJwt));
    expect(component.userData).toEqual(mockDecodedJwt);
    expect(mockAuthService.setUser).toHaveBeenCalledWith(mockDecodedJwt);
    expect(component.redirectBasedOnRole).toHaveBeenCalledWith(mockDecodedJwt);
  }));

  it('should redirect based on writer role', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of({ ...mockUser, role_id: 'writer' }));
    
    component.redirectBasedOnRole(mockDecodedJwt);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-overview']);
    expect(component.loading).toBeTrue();
  }));

  it('should redirect based on manager role', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of({ ...mockUser, role_id: 'manager' }));
    
    component.redirectBasedOnRole(mockDecodedJwt);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/manager-overview']);
  }));

  it('should redirect based on admin role', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of({ ...mockUser, role_id: 'admin' }));
    
    component.redirectBasedOnRole(mockDecodedJwt);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/manager-management']);
  }));

  it('should redirect to role-review for no role', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of({ ...mockUser, role_id: 'no-role' }));
    
    component.redirectBasedOnRole(mockDecodedJwt);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/role-review']);
  }));

  it('should redirect to access-denied if user not found', fakeAsync(() => {
    mockUserService.getUserByEmail.and.returnValue(of(undefined));
    
    component.redirectBasedOnRole(mockDecodedJwt);
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/access-denied']);
  }));

  it('should navigate to overview on login', () => {
    component.onLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-overview']);
  });

  it('should sign in with Google', fakeAsync(() => {
    const mockGoogleUser:  any = {
      email: 'test@example.com',
      name: 'Test User',
      provider: 'GOOGLE',
      id: '12345',
      photoUrl: 'test.jpg',
      firstName: 'Test',
      lastName: 'User',
      authToken: 'mockAuthToken',
      idToken: 'mockIdToken',
      authorizationCode: 'mockAuthorizationCode',
      response: {}
    };
    mockGoogleAuthService.signInWithGoogle.and.returnValue(Promise.resolve(mockGoogleUser));
    
    component.signIn();
    tick();

    expect(mockGoogleAuthService.signInWithGoogle).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/topic-overview']);
  }));

  it('should handle Google sign-in error', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    mockGoogleAuthService.signInWithGoogle.and.returnValue(Promise.reject('Error'));
    
    component.signIn();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Google Sign-In Error:', 'Error');
  }));

  it('should set client_id in ngAfterViewInit', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    fixture = TestBed.createComponent(LoginComponent);
    fixture.autoDetectChanges();
    
    const gIdOnloadDiv = document.createElement('div');
    gIdOnloadDiv.id = 'g_id_onload';
    container.appendChild(gIdOnloadDiv);
    
    component.client_id = 'test-client-id';
    component.ngAfterViewInit();
    
    expect(gIdOnloadDiv.getAttribute('data-client_id')).toBe('test-client-id');
    
    document.body.removeChild(container);
  });
});