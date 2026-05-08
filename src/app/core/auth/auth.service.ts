import { Injectable, signal } from '@angular/core';
import { Amplify } from 'aws-amplify';
import {
    signIn,
    signOut,
    signUp,
    signInWithRedirect,
    confirmSignUp,
    resendSignUpCode,
    resetPassword,
    confirmResetPassword,
    updatePassword,
    getCurrentUser,
    fetchAuthSession,
    type SignInInput,
    type SignUpInput,
} from 'aws-amplify/auth';

import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { cognitoConfig, staffCognitoConfig } from './cognito.config';

export interface AuthUser {
    userId: string;
    username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    currentUser = signal<AuthUser | null>(null);
    isLoading = signal(false);

    get isLoggedIn(): boolean {
        return this.currentUser() !== null;
    }

    signUpWithGoogle() {
        return signInWithRedirect({ provider: 'Google' });
    }

    signInWithGoogle() {
        return signInWithRedirect({ provider: 'Google' });
    }

    async loadCurrentUser(): Promise<void> {
        const pool = localStorage.getItem('carecore_pool');
        // ── Staff ──────────────────────────────────────────────────────────
        if (pool === 'staff') {
            Amplify.configure(staffCognitoConfig);
            cognitoUserPoolsTokenProvider.setKeyValueStorage({
                setItem:    (k, v) => Promise.resolve(localStorage.setItem(k, v)),
                getItem:    (k)    => Promise.resolve(localStorage.getItem(k)),
                removeItem: (k)    => Promise.resolve(localStorage.removeItem(k)),
                clear:      ()     => Promise.resolve(localStorage.clear()),
            });

        // ── Admin (or no flag set yet) ─────────────────────────────────────
        } else {
            Amplify.configure(cognitoConfig);
            cognitoUserPoolsTokenProvider.setKeyValueStorage({
                setItem:    (k, v) => Promise.resolve(localStorage.setItem(k, v)),
                getItem:    (k)    => Promise.resolve(localStorage.getItem(k)),
                removeItem: (k)    => Promise.resolve(localStorage.removeItem(k)),
                clear:      ()     => Promise.resolve(localStorage.clear()),
            });
        }

        try {
            const user = await getCurrentUser();
            this.currentUser.set({ userId: user.userId, username: user.username });
        } catch {
            this.currentUser.set(null);
        }
    }

    async login(username: string, password: string, _rememberMe = true) {
        Amplify.configure(cognitoConfig);
        cognitoUserPoolsTokenProvider.setKeyValueStorage({
            setItem:    (k, v) => Promise.resolve(localStorage.setItem(k, v)),
            getItem:    (k)    => Promise.resolve(localStorage.getItem(k)),
            removeItem: (k)    => Promise.resolve(localStorage.removeItem(k)),
            clear:      ()     => Promise.resolve(localStorage.clear()),
        });
        this.isLoading.set(true);
        try {
            await signOut().catch(() => {});
            localStorage.removeItem('carecore_pool');
            const result = await signIn({ username, password } satisfies SignInInput);
            return result;
        } finally {
            this.isLoading.set(false);
        }
    }

    async register(username: string, password: string, email: string, givenName: string, familyName: string) {
        this.isLoading.set(true);
        try {
            return await signUp({
                username,
                password,
                options: {
                    userAttributes: {
                        email,
                        given_name:  givenName,
                        family_name: familyName,
                    },
                },
            } satisfies SignUpInput);
        } finally {
            this.isLoading.set(false);
        }
    }

    async registerStaff(email: string, password: string, givenName: string, familyName: string, clinicName: string) {
        Amplify.configure(staffCognitoConfig);
        try {
            return await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        given_name:           givenName,
                        family_name:          familyName,
                        'custom:clinic_name': clinicName,
                        'custom:is_staff':    'true',
                    },
                },
            } satisfies SignUpInput);
        } finally {
            Amplify.configure(cognitoConfig);
        }
    }

    async loginAsStaff(username: string, password: string, _rememberMe = true) {
        Amplify.configure(staffCognitoConfig);
        cognitoUserPoolsTokenProvider.setKeyValueStorage({
            setItem:    (k, v) => Promise.resolve(localStorage.setItem(k, v)),
            getItem:    (k)    => Promise.resolve(localStorage.getItem(k)),
            removeItem: (k)    => Promise.resolve(localStorage.removeItem(k)),
            clear:      ()     => Promise.resolve(localStorage.clear()),
        });
        this.isLoading.set(true);
        try {
            await signOut().catch(() => {});
            const result = await signIn({ username, password } satisfies SignInInput);
            if (result.isSignedIn) {
                localStorage.setItem('carecore_pool', 'staff');
            }
            return result;
        } catch (err) {
            Amplify.configure(cognitoConfig);
            throw err;
        } finally {
            this.isLoading.set(false);
        }
    }

	// aws4jd@gmail.com
	// uFrf6@fdsn
    async confirmRegistration(username: string, code: string) {
        return confirmSignUp({ username, confirmationCode: code });
    }

    async resendCode(username: string) {
        return resendSignUpCode({ username });
    }

    async logout(): Promise<void> {
        await signOut();
        localStorage.removeItem('carecore_pool');
        this.currentUser.set(null);
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await updatePassword({ oldPassword, newPassword });
    }

    async forgotPassword(username: string) {
        return resetPassword({ username });
    }

    async confirmForgotPassword(username: string, code: string, newPassword: string) {
        return confirmResetPassword({ username, confirmationCode: code, newPassword });
    }

    async getAccessToken(): Promise<string | null> {
        try {
            const session = await fetchAuthSession();
            return session.tokens?.idToken?.toString() ?? null;
        } catch {
            return null;
        }
    }

    async getTokenClaims(): Promise<{ givenName: string; familyName: string; email: string; clinicName: string; isStaff: boolean } | null> {
        try {
            const session = await fetchAuthSession();
            const payload = session.tokens?.idToken?.payload;
            if (!payload) return null;
            return {
                givenName:  (payload['given_name']         as string) ?? '',
                familyName: (payload['family_name']        as string) ?? '',
                email:      (payload['email']              as string) ?? '',
                clinicName: (payload['custom:clinic_name'] as string) ?? '',
                isStaff:    (payload['custom:is_staff']    as string) === 'true',
            };
        } catch {
            return null;
        }
    }
}
