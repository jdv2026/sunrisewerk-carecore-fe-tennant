import { Component, output, signal, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

function pastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const entered = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entered < today ? null : { notPast: true };
}

@Component({
    selector: 'app-add-patient-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './add-patient-modal.component.html',
    styleUrl: './add-patient-modal.component.scss',
})
export class AddPatientModalComponent {
    saved     = output<void>();
    cancelled = output<void>();

    isLoading = signal(false);
    error     = signal<string | null>(null);

    readonly maxDob = new Date().toISOString().split('T')[0];

    private fb          = inject(FormBuilder);
    private http        = inject(HttpClient);
    private authService = inject(AuthService);

    form = this.fb.group({
        given_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
        last_name:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
        email:      ['', [Validators.required, Validators.email, Validators.maxLength(45)]],
        phone:      ['', [Validators.maxLength(20), Validators.pattern(/^[0-9+\-\s()]*$/)]],
        dob:        ['', [pastDateValidator]],
        addr:       ['', [Validators.maxLength(255)]],
        city:       ['', [Validators.maxLength(100)]],
        country:    ['', [Validators.maxLength(100)]],
    });

    get givenName() { return this.form.get('given_name')!; }
    get lastName()  { return this.form.get('last_name')!; }
    get email()     { return this.form.get('email')!; }
    get dob()       { return this.form.get('dob')!; }
    get phone()     { return this.form.get('phone')!; }
    get addr()      { return this.form.get('addr')!; }
    get city()      { return this.form.get('city')!; }
    get country()   { return this.form.get('country')!; }

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
            await firstValueFrom(
                this.http.post(`${environment.laravelBackendApi}patients/store`, {
                    ...this.form.value,
                    tennant_email: claims?.email      ?? '',
                    clinic_name:   claims?.clinicName ?? '',
                }, { headers })
            );
            this.saved.emit();
        } catch (err: any) {
            this.error.set(err?.error?.message ?? 'Failed to add patient. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }

    sanitizePhone(event: Event): void {
        const input = event.target as HTMLInputElement;
        const cleaned = input.value.replace(/[^0-9+\-\s()]/g, '');
        if (cleaned !== input.value) {
            this.phone.setValue(cleaned, { emitEvent: false });
            input.value = cleaned;
        }
    }

    dismiss(): void { this.cancelled.emit(); }
}
