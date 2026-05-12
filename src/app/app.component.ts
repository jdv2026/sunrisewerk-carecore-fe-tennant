import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Hub } from 'aws-amplify/utils';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { ServiceUnavailableComponent } from './pages/service-unavailable/service-unavailable.component';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ServiceUnavailableComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'p-scheduler-web';
    serverDown = false;
    checking = true;
    private hubListener: (() => void) | null = null;

    constructor(
        private router: Router,
        private authService: AuthService,
        private http: HttpClient,
    ) {}

    ngOnInit(): void {
        this.checkHealth();

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

    private checkHealth(): void {
        this.http
            .get(`${environment.laravelAdminBackendApi}health`)
            .pipe(
                timeout(8000),
                catchError(() => {
                    this.serverDown = true;
                    return of(null);
                }),
            )
            .subscribe(() => {
                this.checking = false;
                document.getElementById('cc-splash')?.remove();
            });
    }

    ngOnDestroy(): void {
        this.hubListener?.();
    }
}
