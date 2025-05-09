import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { NavigationComponent } from "./components/navigation/navigation.component";
import { AuthService } from './services/auth.service';
import { AngularFaviconService } from 'angular-favicon';
import { environment } from '../environments/environments';
import { UserService } from './services/users/user-service.service';
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
  userRole: string = '';
  currentRoute: string = '';
  menuOpen: boolean = true;

  constructor(
    private authService: AuthService,
    private ngxFavicon: AngularFaviconService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(status => {
      this.loggedIn = status;
      this.ngxFavicon.setFavicon(this.favicon);

      if (this.loggedIn) {
        const user = this.authService.getUser();

        if (user) {
          this.userService.getUserByEmail(user.email).subscribe(userDetails => {
            if (userDetails) {
              this.userRole = userDetails.role_id; 
              console.log('User role:', this.userRole);
            }
          });
        }
      }
    });
    
    this.router.events.subscribe(event => {
      if (event.constructor.name === 'NavigationEnd') {
        this.currentRoute = this.router.url;
        console.log('Current Route:', this.currentRoute);
      }
    });
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
