import { Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

  profileMenuOpen: boolean = false;

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }
}
