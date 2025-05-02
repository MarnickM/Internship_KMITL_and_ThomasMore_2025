// import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
// import { AppComponent } from './app.component';
// import { NavigationComponent } from "./components/navigation/navigation.component";
// import { AuthService } from './services/auth.service';
// import { AngularFaviconService } from 'angular-favicon';
// import { UserService } from './services/users/user-service.service';
// import { Router, NavigationEnd } from '@angular/router';
// import { of, Subject } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { RouterTestingModule } from '@angular/router/testing';

// describe('AppComponent', () => {
//   let component: AppComponent;
//   let fixture: ComponentFixture<AppComponent>;
//   let mockAuthService: jasmine.SpyObj<AuthService>;
//   let mockFaviconService: jasmine.SpyObj<AngularFaviconService>;
//   let mockUserService: jasmine.SpyObj<UserService>;
//   let routerEventsSubject: Subject<any>;
//   let mockRouter: any;
//   let currentMockUrl: string;

//   beforeEach(async () => {
//     routerEventsSubject = new Subject<any>();

//     currentMockUrl = '/initial'; // Initialize URL

//     // Create router mock with getter for url
//     const mockRouter = {
//       events: routerEventsSubject.asObservable(),
//       routerState: { snapshot: {}, root: {} },
//       navigate: () => Promise.resolve(true),
//       get url() {
//         return currentMockUrl; // Return the current URL
//       }
//     };
    
//     // Create proper spy objects with default implementations
//     mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'getUser']);
//     mockFaviconService = jasmine.createSpyObj('AngularFaviconService', ['setFavicon']);
//     mockUserService = jasmine.createSpyObj('UserService', ['getUserByEmail']);

//     // Set default return values
//     mockAuthService.isLoggedIn.and.returnValue(of(false));
//     mockAuthService.getUser.and.returnValue({ email: 'test@example.com' });
//     mockUserService.getUserByEmail.and.returnValue(of({ 
//       role_id: 'admin', 
//       email: 'test@example.com',
//       name: 'Test User',
//       image: 'test.jpg' 
//     }));

//     await TestBed.configureTestingModule({
//       imports: [
//         AppComponent,
//         NavigationComponent,
//         CommonModule,
//         RouterTestingModule.withRoutes([])
//       ],
//       providers: [
//         { provide: AuthService, useValue: mockAuthService },
//         { provide: AngularFaviconService, useValue: mockFaviconService },
//         { provide: UserService, useValue: mockUserService },
//         { provide: Router, useValue: mockRouter }
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(AppComponent);
//     component = fixture.componentInstance;
//   });

//   afterEach(() => {
//     routerEventsSubject.complete();
//   });

//   it('should create the app', () => {
//     expect(component).toBeTruthy();
//   });

//   it(`should have the 'DrawingApp' title`, () => {
//     expect(component.title).toEqual('DrawingApp');
//   });

//   it('should initialize with default values', () => {
//     expect(component.loggedIn).toBeFalse();
//     expect(component.userRole).toBe('');
//     expect(component.currentRoute).toBe('');
//     expect(component.menuOpen).toBeTrue();
//   });

//   it('should set favicon on initialization', fakeAsync(() => {
//     fixture.detectChanges();
//     tick();
//     expect(mockFaviconService.setFavicon).toHaveBeenCalledWith(component.favicon);
//   }));

//   it('should update loggedIn status when auth status changes', fakeAsync(() => {
//     mockAuthService.isLoggedIn.and.returnValue(of(true));
//     fixture.detectChanges();
//     tick();
//     expect(component.loggedIn).toBeTrue();
//   }));

//   it('should fetch user role when logged in', fakeAsync(() => {
//     const mockUserDetails = { 
//       role_id: 'admin', 
//       email: 'test@example.com',
//       name: 'Test User',
//       image: 'test.jpg' 
//     };
    
//     mockAuthService.isLoggedIn.and.returnValue(of(true));
//     mockUserService.getUserByEmail.and.returnValue(of(mockUserDetails));
    
//     fixture.detectChanges();
//     tick();
    
//     expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
//     expect(component.userRole).toBe('admin');
//   }));

// it('should track route changes', fakeAsync(() => {
//   const testUrl = '/test-route';
  
//   // Create a new mock router instance for this test
//   const mockRouter = {
//     events: routerEventsSubject.asObservable(),
//     routerState: { snapshot: {}, root: {} },
//     navigate: () => Promise.resolve(true),
//     url: testUrl  // Set the URL directly
//   };

//   // Override the router provider for this test
//   TestBed.overrideProvider(Router, { useValue: mockRouter });
  
//   // Recreate the component with the new router
//   fixture = TestBed.createComponent(AppComponent);
//   component = fixture.componentInstance;
  
//   // Emit the navigation event
//   routerEventsSubject.next(new NavigationEnd(1, testUrl, testUrl));
  
//   fixture.detectChanges();
//   tick();
  
//   expect(component.currentRoute).toBe(testUrl);
// }));

//   afterEach(() => {
//     routerEventsSubject.complete();
//   });

//   it('should toggle menu state', () => {
//     expect(component.menuOpen).toBeTrue();
//     component.toggleMenu();
//     expect(component.menuOpen).toBeFalse();
//     component.toggleMenu();
//     expect(component.menuOpen).toBeTrue();
//   });
// });