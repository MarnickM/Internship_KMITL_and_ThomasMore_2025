import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/users/user-service.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  profileMenuOpen: boolean = false;
  loggedIn: boolean = false;
  user: any = null;
  userRole: string = '';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loggedIn = !!user;
  
      if (this.loggedIn && user?.email) {
        this.fetchUserRole();
      }
    });
  }
  
  fetchUserRole() {
    if (this.user?.email) {
      this.userService.getUserByEmail(this.user.email).subscribe(
        (user) => {
          if (user) {
            this.userRole = user.role_id;
            console.log("User role:", this.userRole);
          }
        },
        (error) => {
          console.error("Error fetching user role:", error);
        }
      );
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  navigateToTopicOverview() {
    this.router.navigate(['/topic-overview']);
  }

  navigateToMyDrawings() {
    this.router.navigate(['/submissions-overview']);
  }

  navigateToManagerOverview() {
    this.router.navigate(['/manager-overview']);
  }

  navigateToWriterManagement() {
    this.router.navigate(['/writer-management']);
  }

  navigateToTopicManagement() {
    this.router.navigate(['/topic-management']);
  }

  navigateToManagerManagement() {
    this.router.navigate(['/manager-management']);
  }
}
