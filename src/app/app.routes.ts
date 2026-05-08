import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
		canActivate: [guestGuard],
        loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    },
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'auth/register',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
    },
    {
        path: 'onboarding',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    },
    {
        path: 'staff-dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/staff-dashboard/staff-dashboard.component').then((m) => m.StaffDashboardComponent),
    },
    {
        path: 'appointments',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/appointments/appointments.component').then((m) => m.AppointmentsComponent),
    },
    {
        path: 'staff',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/staff/staff.component').then((m) => m.StaffComponent),
    },
    {
        path: 'staff/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/staff/staff-detail/staff-detail.component').then((m) => m.StaffDetailComponent),
    },
    {
        path: 'leaves',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/leaves/leaves.component').then((m) => m.LeavesComponent),
    },
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    },
    {
        path: 'solutions/solo-practitioners',
        data: { solution: 'solo-practitioners' },
        loadComponent: () => import('./pages/solutions/solution-page/solution-page.component').then((m) => m.SolutionPageComponent),
    },
    {
        path: 'solutions/multi-clinic',
        data: { solution: 'multi-clinic' },
        loadComponent: () => import('./pages/solutions/solution-page/solution-page.component').then((m) => m.SolutionPageComponent),
    },
    {
        path: 'solutions/hospitals',
        data: { solution: 'hospitals' },
        loadComponent: () => import('./pages/solutions/solution-page/solution-page.component').then((m) => m.SolutionPageComponent),
    },
    {
        path: 'solutions/telehealth',
        data: { solution: 'telehealth' },
        loadComponent: () => import('./pages/solutions/solution-page/solution-page.component').then((m) => m.SolutionPageComponent),
    },
    {
        path: 'blog',
        loadComponent: () => import('./pages/blog/blog.component').then((m) => m.BlogComponent),
    },
    {
        path: 'legal/terms',
        loadComponent: () => import('./pages/legal/terms/terms.component').then((m) => m.TermsComponent),
    },
    {
        path: 'legal/privacy',
        loadComponent: () => import('./pages/legal/privacy/privacy.component').then((m) => m.PrivacyComponent),
    },
    {
        path: 'legal/cookies',
        loadComponent: () => import('./pages/legal/cookies/cookies.component').then((m) => m.CookiesComponent),
    },
    { path: '**', redirectTo: '' },
];
