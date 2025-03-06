import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TopicOverviewComponent } from './pages/writer/topic-overview/topic-overview.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'topic-overview', component: TopicOverviewComponent },
];
