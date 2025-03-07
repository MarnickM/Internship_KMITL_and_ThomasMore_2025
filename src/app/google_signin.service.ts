import { Injectable } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class GoogleSigninService {

  constructor(private authService: SocialAuthService) { }

  async signInWithGoogle(): Promise<SocialUser> {
    await this.authService.initState.toPromise();
    return this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signOut(): Promise<void> {
    return this.authService.signOut();
  }
}