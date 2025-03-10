import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../users/user-service.service';
import { AuthService } from '../auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UserService
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {

        const user = this.authService.getUser();

        if (user) {
            return this.userService.getUserByEmail(user.email).pipe(
                map(userDetails => {
                    const roleId = userDetails?.role_id;
                    console.log("RoleId: ", roleId)
                    const allowedRoles = route.data['roles'] as string[];
                    if (allowedRoles.includes(roleId)) {
                        return true;
                    } else {
                        this.router.navigate(['/access-denied']);
                        return false;
                    }
                }),
                catchError(() => {
                    this.router.navigate(['/']);
                    return [false];
                })
            );
        } else {
            this.router.navigate(['/']);
            return false;
        }
    }
}
