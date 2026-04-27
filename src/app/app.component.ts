import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Hub } from 'aws-amplify/utils';
import { AuthService } from './core/auth/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'p-scheduler-web';
    private hubListener: (() => void) | null = null;

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {
        this.hubListener = Hub.listen('auth', async ({ payload }) => {
            switch (payload.event) {
                case 'signInWithRedirect':
                    await this.authService.loadCurrentUser();
                    this.router.navigate(['/onboarding']);
                    break;
                case 'signInWithRedirect_failure':
                    console.error('Google sign-in failed:', payload.data);
                    this.router.navigate(['/auth/login']);
                    break;
            }
        });
    }

    ngOnDestroy(): void {
        this.hubListener?.();
    }
}
