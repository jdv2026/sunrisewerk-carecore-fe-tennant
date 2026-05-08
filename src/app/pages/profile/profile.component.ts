import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { AuthService } from '../../core/auth/auth.service';

interface ProfileInfo {
    givenName:  string;
    familyName: string;
    email:      string;
    clinicName: string;
    isStaff:    boolean;
}

@Component({
    selector: 'app-profile',
    imports: [SidebarComponent, FormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
    sidebarOpen = signal(false);
    isLoading   = signal(true);
    profile     = signal<ProfileInfo | null>(null);

    showCurrentPassword = signal(false);
    showNewPassword     = signal(false);
    showConfirmPassword = signal(false);

    pwForm = { current: '', newPw: '', confirm: '' };
    pwLoading = signal(false);
    pwError   = signal<string | null>(null);
    pwSuccess = signal(false);

    constructor(private authService: AuthService) {}

    async ngOnInit(): Promise<void> {
        const claims = await this.authService.getTokenClaims();
        if (claims) {
            this.profile.set(claims);
        }
        this.isLoading.set(false);
    }

    get initials(): string {
        const p = this.profile();
        if (!p) return '?';
        return ((p.givenName[0] ?? '') + (p.familyName[0] ?? '')).toUpperCase() || '?';
    }

    get fullName(): string {
        const p = this.profile();
        if (!p) return '';
        return `${p.givenName} ${p.familyName}`.trim();
    }

    async submitPasswordChange(): Promise<void> {
        this.pwError.set(null);
        this.pwSuccess.set(false);

        if (!this.pwForm.current || !this.pwForm.newPw || !this.pwForm.confirm) {
            this.pwError.set('Please fill in all password fields.');
            return;
        }
        if (this.pwForm.newPw.length < 8) {
            this.pwError.set('New password must be at least 8 characters.');
            return;
        }
        if (this.pwForm.newPw !== this.pwForm.confirm) {
            this.pwError.set('New passwords do not match.');
            return;
        }

        this.pwLoading.set(true);
        try {
            await this.authService.changePassword(this.pwForm.current, this.pwForm.newPw);
            this.pwSuccess.set(true);
            this.pwForm = { current: '', newPw: '', confirm: '' };
        } catch (err: any) {
            this.pwError.set(err?.message ?? 'Failed to update password.');
        } finally {
            this.pwLoading.set(false);
        }
    }
}
