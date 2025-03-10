import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TopicOverviewComponent } from './pages/writer/topic-overview/topic-overview.component';
import { DrawingComponent } from './pages/writer/drawing/drawing.component';
import { SubmissionsOverviewComponent } from './pages/writer/submissions-overview/submissions-overview.component';
import { AuthGuard } from './services/guards/auth.guard';
import { LoginGuard } from './services/guards/login.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RoleGuard } from './services/guards/role.guard';

export const routes: Routes = [
    { path: '', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'topic-overview', component: TopicOverviewComponent, canActivate: [AuthGuard] },
    { path: 'drawing', component: DrawingComponent, canActivate: [AuthGuard] },
    { path: 'submissions-overview', component: SubmissionsOverviewComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [1] } },
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: '**', redirectTo: '/access-denied' }
];
