import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from "./components/navigation/navigation.component";
import { AuthService } from './services/auth.service';
import { AngularFaviconService } from 'angular-favicon';
import { environment } from '../environments/environments';

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
  favicon: string = environment.favicon_url;

  constructor(private authService: AuthService, private ngxFavicon: AngularFaviconService) { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(status => {
      this.loggedIn = status;
      this.ngxFavicon.setFavicon(this.favicon);
    });
  }
}
