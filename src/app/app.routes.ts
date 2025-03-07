import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TopicOverviewComponent } from './pages/writer/topic-overview/topic-overview.component';
import { DrawingComponent } from './pages/writer/drawing/drawing.component';
import { SubmissionsOverviewComponent } from './pages/writer/submissions-overview/submissions-overview.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'topic-overview', component: TopicOverviewComponent },
    { path: 'drawing', component: DrawingComponent },
    { path: 'submissions-overview', component: SubmissionsOverviewComponent },
];
