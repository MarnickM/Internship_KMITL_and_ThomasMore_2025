import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from "./components/navigation/navigation.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DrawingApp';
  loggedIn: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(status => {
      this.loggedIn = status;
    });
  }
}
