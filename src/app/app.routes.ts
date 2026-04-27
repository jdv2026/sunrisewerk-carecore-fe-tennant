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
        path: 'legal/terms',
        loadComponent: () => import('./pages/legal/terms/terms.component').then((m) => m.TermsComponent),
    },
    {
        path: 'legal/privacy',
        loadComponent: () => import('./pages/legal/privacy/privacy.component').then((m) => m.PrivacyComponent),
    },
    { path: '**', redirectTo: '' },
];
