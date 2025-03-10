import { Component, NgZone } from '@angular/core';
import { ButtonComponent } from "../../components/button/button.component";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { GoogleSigninService } from '../../google_signin.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users/user-service.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environments';  // Import environment variables
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  client_id: string = environment.google_client_id;
  userData: { [key: string]: any } = {};
  loading: boolean = false;

  // Use environment variables for role IDs
  writerRoleId = environment.writer_role_id;
  managerRoleId = environment.manager_role_id;
  adminRoleId = environment.admin_role_id;

  constructor(
    private router: Router,
    private googleAuthService: GoogleSigninService,
    private authService: SocialAuthService,
    private ngZone: NgZone,
    private userService: UserService,
    private authUserService: AuthService
  ) { }

  ngOnInit() {
    (window as any).handleCredentialResponse = (response: any) => {
      console.log("Google Response:", response);

      // Decode JWT
      const userInfo = this.decodeJwt(response.credential);
      console.log("Decoded User Info:", userInfo);

      // Save to localStorage (optional)
      localStorage.setItem("user", JSON.stringify(userInfo));

      // Store user data
      this.userData = userInfo;
      // Store in database
      this.saveUser(userInfo);
      // Store in auth service
      this.authUserService.setUser(userInfo);

      // Navigate within Angular zone
      this.ngZone.run(() => {
        // Call the function to navigate based on user role
        this.redirectBasedOnRole(userInfo);
      });
    };
  }

  decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1]; // Get Payload part
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT", e);
      return null;
    }
  }

  saveUser(userInfo: any) {
    this.userService.getUserByEmail(userInfo['email']).subscribe(user => {
      if (!user) {
        this.userService.addUser({
          email: userInfo['email'],
          name: userInfo['name'],
          image: userInfo['picture'],
          role_id: this.writerRoleId  // Default role set to writer role, you can change it as needed
        }).subscribe(id => {
          console.log("User added with ID:", id);
        });
      } else {
        console.log("User already exists");
      }
    });
  }

  ngAfterViewInit() {
    const gIdOnloadDiv = document.getElementById('g_id_onload');
    if (gIdOnloadDiv) {
      gIdOnloadDiv.setAttribute('data-client_id', this.client_id);
    }
  }

  // Method to redirect based on user role
  redirectBasedOnRole(userInfo: any) {
    this.loading = true
    this.userService.getUserByEmail(userInfo['email']).subscribe(user => {
      if (user) {
        switch (user.role_id) {
          case this.managerRoleId:
            this.router.navigate(['/manager-overview']);
            break;
          case this.adminRoleId:
            this.router.navigate(['/manager-management']);
            break;
          default:
            this.router.navigate(['/topic-overview']);
            break;
        }
      } else {
        this.router.navigate(['/access-denied']);
      }
    });
  }

  // Navigation logic after successful login
  navigateToOverview() {
    this.router.navigate(['/topic-overview']);
  }

  onLogin() {
    this.navigateToOverview();
  }

  signIn() {
    console.log('Sign in');

    // Sign in with Google
    this.googleAuthService.signInWithGoogle().then(user => {
      console.log(user);
      this.navigateToOverview();
    }).catch(err => {
      console.error('Google Sign-In Error:', err);
    });
  }
}
