import { Component, NgZone } from '@angular/core';
import { ButtonComponent } from "../../components/button/button.component";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { GoogleSigninService } from '../../google_signin.service';
import { environment } from '../../../environments/environments';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/users/user-service.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonComponent, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  client_id: string = environment.google_client_id;
  userData: { [key: string]: any } = {};


  constructor(private router: Router, private googleAuthService: GoogleSigninService, private authService: SocialAuthService, private ngZone: NgZone, private userService: UserService, private authUserService: AuthService) { 
  }

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
      // store in database
      this.saveUser();
      // store in auth service
      this.authUserService.setUser(userInfo);

      // Navigate within Angular zone
      this.ngZone.run(() => {
        this.router.navigate(['/topic-overview']);
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

  saveUser() {
    this.userService.getUserByEmail(this.userData['email']).subscribe(user => {
      if (!user) {
        this.userService.addUser({
          email: this.userData['email'],
          name: this.userData['name'],
          image: this.userData['picture'],
          role_id: 'dfaNnrXgH6bqFys0Sw44'
        }).subscribe(id => {
          console.log("User added with ID:", id);
        });
      }
    });
  }

  ngAfterViewInit() {
    const gIdOnloadDiv = document.getElementById('g_id_onload');
    if (gIdOnloadDiv) {
      gIdOnloadDiv.setAttribute('data-client_id', this.client_id);
    }
  }

  // ngOnInit() {
  //   this.authService.authState.subscribe((user) => {
  //     this.user = user;
  //     this.loggedIn = (user != null);
  //   });
  // }

  navigateToOverview() {
    this.router.navigate(['/topic-overview']);
  }

  onLogin() {
    this.navigateToOverview();
  }

  signIn() {
    console.log('Sign in');
  
    // this.authService.initState.subscribe((isReady) => {
    //   if (!isReady) {
    //     console.error('Login providers not ready yet. Please wait...');
    //     return;
    //   }
  
      // this.authService.authState.subscribe((user) => {
        // if (!user) {
          console.log('Sign in with Google');
          this.googleAuthService.signInWithGoogle().then(user => {
            console.log(user);
            this.navigateToOverview();
          }).catch(err => {
            console.error('Google Sign-In Error:', err);
          });
        // }
      // });
    // });
  }
  
}
