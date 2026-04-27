import { Injectable, signal } from '@angular/core';
import {
    signIn,
    signOut,
    signUp,
    signInWithRedirect,
    confirmSignUp,
    resetPassword,
    confirmResetPassword,
    getCurrentUser,
    fetchAuthSession,
    type SignInInput,
    type SignUpInput,
} from 'aws-amplify/auth';

import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

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
        try {
            const user = await getCurrentUser();
            this.currentUser.set({ userId: user.userId, username: user.username });
        } catch {
            this.currentUser.set(null);
        }
    }

    async login(username: string, password: string, rememberMe = true) {
        const store = rememberMe ? localStorage : sessionStorage;
        cognitoUserPoolsTokenProvider.setKeyValueStorage({
            setItem: (k, v) => Promise.resolve(store.setItem(k, v)),
            getItem: (k) => Promise.resolve(store.getItem(k)),
            removeItem: (k) => Promise.resolve(store.removeItem(k)),
            clear: () => Promise.resolve(store.clear()),
        });
        this.isLoading.set(true);
        try {
            await signOut().catch(() => {});
            const result = await signIn({ username, password } satisfies SignInInput);
            if (result.isSignedIn) {
                await this.loadCurrentUser();
            }
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
                        given_name: givenName,
                        family_name: familyName,
                    },
                },
            } satisfies SignUpInput);
        } finally {
            this.isLoading.set(false);
        }
    }

    async confirmRegistration(username: string, code: string) {
        return confirmSignUp({ username, confirmationCode: code });
    }

    async logout(): Promise<void> {
        await signOut();
        this.currentUser.set(null);
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

    async getTokenClaims(): Promise<{ givenName: string; familyName: string; email: string } | null> {
        try {
            const session = await fetchAuthSession();
            const payload = session.tokens?.idToken?.payload;
            if (!payload) return null;
            return {
                givenName:  (payload['given_name']  as string) ?? '',
                familyName: (payload['family_name'] as string) ?? '',
                email:      (payload['email']       as string) ?? '',
            };
        } catch {
            return null;
        }
    }

}
