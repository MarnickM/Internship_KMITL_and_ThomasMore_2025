import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NavigationComponent } from "./components/navigation/navigation.component";
import { AuthService } from './services/auth.service';
import { AngularFaviconService } from 'angular-favicon';
import { environment } from '../environments/environments';
import { UserService } from './services/users/user-service.service';  // Import the UserService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DrawingApp';
  loggedIn: boolean = false;
  favicon: string = environment.favicon_url;
  userRole: string = '';  // Variable to store the user's role
  currentRoute: string = '';  // Variable to store the current route
  menuOpen: boolean = true;  // Variable to control the menu state

  constructor(
    private authService: AuthService,
    private ngxFavicon: AngularFaviconService,
    private userService: UserService,  // Inject the UserService
    private activatedRoute: ActivatedRoute,  // Inject the ActivatedRoute
    private router: Router  // Inject the Router to get the current route
  ) { }

  ngOnInit() {
    // Subscribe to the login status to check if the user is logged in
    this.authService.isLoggedIn().subscribe(status => {
      this.loggedIn = status;
      this.ngxFavicon.setFavicon(this.favicon);

      if (this.loggedIn) {
        // Get the current user's email from the auth service (assuming it's available)
        const user = this.authService.getUser();

        if (user) {
          // Fetch the user details by email and store the role in the userRole variable
          this.userService.getUserByEmail(user.email).subscribe(userDetails => {
            if (userDetails) {
              this.userRole = userDetails.role_id;  // Store the user's role
              console.log('User role:', this.userRole);
            }
          });
        }
      }
    });
    
    // Capture the current route whenever it changes
    this.router.events.subscribe(event => {
      if (event.constructor.name === 'NavigationEnd') {
        this.currentRoute = this.router.url;  // Store the current route in the variable
        console.log('Current Route:', this.currentRoute);
      }
    });
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
