import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any = null;

  constructor() { 
    this.loadUserFromStorage(); // Load user from localStorage if available
  }

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user)); // Save in localStorage
  }

  getUser() {
    return this.user;
  }

  loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }
}
