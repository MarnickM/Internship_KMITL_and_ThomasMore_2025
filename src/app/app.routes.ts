import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TopicOverviewComponent } from './pages/writer/topic-overview/topic-overview.component';
import { DrawingComponent } from './pages/writer/drawing/drawing.component';
import { SubmissionsOverviewComponent } from './pages/writer/submissions-overview/submissions-overview.component';
import { AuthGuard } from './services/guards/auth.guard';
import { LoginGuard } from './services/guards/login.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RoleGuard } from './services/guards/role.guard';
import { environment } from '../environments/environments';
import { TopicManagementComponent } from './pages/manager/topic-management/topic-management.component';
import { WriterManagementComponent } from './pages/manager/writer-management/writer-management.component';
import { ManagerManagementComponent } from './pages/admin/manager-management/manager-management.component';
import { ManagerOverviewComponent } from './pages/manager/manager-overview/manager-overview.component';
import { RoleReviewComponent } from './pages/role-review/role-review.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SketchGeneratorComponent } from './experiments/sketch-generator/sketch-generator.component';
import { TopicDetailComponent } from './pages/manager/topic-detail/topic-detail.component';
// import { AutoSketchComponent } from './autosketch/autosketch.component';

export const routes: Routes = [
    // Login
    { path: '', component: LoginComponent, canActivate: [LoginGuard] },
    // Role Review
    { path: 'role-review', component: RoleReviewComponent, canActivate: [RoleGuard], data: { roles: [environment.no_role] } },
    // Writer
    { path: 'topic-overview', component: TopicOverviewComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.writer_role_id, environment.manager_role_id, environment.admin_role_id] } },
    { path: 'drawing', component: DrawingComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.writer_role_id, environment.manager_role_id, environment.admin_role_id] } },
    { path: 'submissions-overview', component: SubmissionsOverviewComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.writer_role_id, environment.admin_role_id] } },
    // Manager
    { path: 'topic-management', component: TopicManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.manager_role_id, environment.admin_role_id] } },
    { path: 'writer-management', component: WriterManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.manager_role_id, environment.admin_role_id] } },
    { path: 'manager-overview', component: ManagerOverviewComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.manager_role_id, environment.admin_role_id] } },
    { path: 'topic-detail/:id', component: TopicDetailComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.manager_role_id, environment.admin_role_id] } },
    // Admin
    { path: 'manager-management', component: ManagerManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: [environment.admin_role_id] } },
    { path: 'sketch-generator', component: SketchGeneratorComponent },
    // { path:'auto-sketch', component: AutoSketchComponent },
    // Error pages
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: 'not-found', component: NotFoundComponent },
    { path: '**', redirectTo: '/not-found' }
];
