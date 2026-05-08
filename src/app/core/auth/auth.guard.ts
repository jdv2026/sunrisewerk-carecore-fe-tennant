import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.loadCurrentUser();

    if (auth.isLoggedIn) {
        return true;
    }

    return router.createUrlTree(['/auth/login']);
};

export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.loadCurrentUser();

    if (auth.isLoggedIn) {
        return router.createUrlTree(['/onboarding']);
    }

    return true;
};
