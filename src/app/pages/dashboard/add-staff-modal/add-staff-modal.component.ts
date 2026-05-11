import { Component, output, signal, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-add-staff-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './add-staff-modal.component.html',
    styleUrl: './add-staff-modal.component.scss',
})
export class AddStaffModalComponent {
    saved     = output<void>();
    cancelled = output<void>();

    isLoading        = signal(false);
    error            = signal<string | null>(null);
    specialties      = signal<string[]>([]);
    specialtyInput   = signal('');
    specialtyError   = signal<string | null>(null);
    showSuccess      = signal(false);
    tempPassword     = signal('');
    cognitoWarning   = signal<string | null>(null);
    copiedPassword   = signal(false);

    specialtyCharCount = computed(() =>
        this.specialties().length ? this.specialties().join(', ').length : 0
    );

    readonly roles = [
        { value: 'doctor',       label: 'Doctor' },
        { value: 'nurse',        label: 'Nurse' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'other',        label: 'Other' },
    ];

    private fb          = inject(FormBuilder);
    private http        = inject(HttpClient);
    private authService = inject(AuthService);
    private router      = inject(Router);

    form = this.fb.group({
        given_name:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        family_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email:       ['', [Validators.required, Validators.email]],
        number:      [''],
        role:        ['', [Validators.required]],
    });

    get givenName()  { return this.form.get('given_name')!; }
    get familyName() { return this.form.get('family_name')!; }
    get email()      { return this.form.get('email')!; }
    get role()       { return this.form.get('role')!; }

    addSpecialty(): void {
        const val = this.specialtyInput().trim();
        if (!val) return;
        this.specialtyError.set(null);
        if (this.specialties().includes(val)) return;
        const combined = [...this.specialties(), val].join(', ');
        if (combined.length > 255) {
            this.specialtyError.set('Specialties exceed the 255-character limit.');
            return;
        }
        this.specialties.update(s => [...s, val]);
        this.specialtyInput.set('');
    }

    removeSpecialty(item: string): void {
        this.specialties.update(s => s.filter(x => x !== item));
        this.specialtyError.set(null);
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.isLoading.set(true);
        this.error.set(null);

        try {
            const [token, claims] = await Promise.all([
                this.authService.getAccessToken(),
                this.authService.getTokenClaims(),
            ]);
            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            });
            const { given_name, family_name, email, number, role } = this.form.value;
            const body = {
                given_name, family_name, email, number, role,
                tennant_email: claims?.email      ?? '',
                clinic_name:   claims?.clinicName ?? '',
                status:        'active',
                specialty:     this.specialties().length ? this.specialties().join(', ') : null,
            };
            await firstValueFrom(
                this.http.post(`${environment.laravelAdminBackendApi}staffs`, body, { headers })
            );

            const pwd = this.generateTempPassword();
            this.tempPassword.set(pwd);

            try {
                await this.authService.registerStaff(
                    email!,
                    pwd,
                    given_name!,
                    family_name!,
                    claims?.clinicName ?? '',
                );
            } catch (cognitoErr: any) {
                const msg = cognitoErr?.message ?? '';
                if (!msg.toLowerCase().includes('already exists') && !msg.toLowerCase().includes('username exists')) {
                    this.cognitoWarning.set(msg || 'Staff saved but Cognito registration failed.');
                }
            }

            this.showSuccess.set(true);
        } catch (err: any) {
            this.error.set(err?.error?.message ?? 'Failed to add staff. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async copyPassword(): Promise<void> {
        await navigator.clipboard.writeText(this.tempPassword());
        this.copiedPassword.set(true);
        setTimeout(() => this.copiedPassword.set(false), 2000);
    }

    done(): void { this.saved.emit(); }

    goToDashboard(): void {
        this.saved.emit();
        this.router.navigate(['/dashboard']);
    }

    dismiss(): void { this.cancelled.emit(); }

    private generateTempPassword(): string {
        const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower   = 'abcdefghjkmnpqrstuvwxyz';
        const digits  = '23456789';
        const special = '!@#$';
        const all     = upper + lower + digits;
        let pwd = upper[Math.floor(Math.random() * upper.length)]
                + lower[Math.floor(Math.random() * lower.length)]
                + digits[Math.floor(Math.random() * digits.length)]
                + special[Math.floor(Math.random() * special.length)];
        for (let i = 0; i < 6; i++) {
            pwd += all[Math.floor(Math.random() * all.length)];
        }
        return pwd.split('').sort(() => Math.random() - 0.5).join('');
    }
}
