import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<any> = this.userSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  setUser(user: any) {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return this.userSubject.value;
  }

  loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  isLoggedIn$(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('user');
  }
}
