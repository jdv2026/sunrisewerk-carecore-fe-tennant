import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

function passwordMatchValidator(group: FormGroup) {
    const pw = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pw === confirm ? null : { passwordMismatch: true };
}

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    confirmForm!: FormGroup;
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    isLoading = signal(false);
    step = signal<'register' | 'confirm'>('register');
    error = signal<string | null>(null);
    private pendingEmail = '';

    constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            givenName: ['', [Validators.required, Validators.maxLength(50)]],
            familyName: ['', [Validators.required, Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email, Validators.minLength(6), Validators.maxLength(45)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(45)]],
            confirmPassword: ['', Validators.required],
            terms: [false, Validators.requiredTrue],
        }, { validators: passwordMatchValidator });

        this.confirmForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        });
    }

    get givenName() { return this.form.get('givenName')!; }
    get familyName() { return this.form.get('familyName')!; }
    get email() { return this.form.get('email')!; }
    get password() { return this.form.get('password')!; }
    get confirmPassword() { return this.form.get('confirmPassword')!; }
    get terms() { return this.form.get('terms')!; }
    get code() { return this.confirmForm.get('code')!; }
    get passwordMismatch() { return this.form.hasError('passwordMismatch') && this.confirmPassword.touched; }

    get passwordStrength(): 'weak' | 'fair' | 'strong' {
        const v = this.password.value ?? '';
        const hasUpper = /[A-Z]/.test(v);
        const hasNumber = /\d/.test(v);
        const hasSpecial = /[^A-Za-z0-9]/.test(v);
        const score = [v.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score <= 1) return 'weak';
        if (score <= 2) return 'fair';
        return 'strong';
    }

    signUpWithGoogle() {
        this.isLoading.set(true);
        this.authService.signUpWithGoogle();
    }
    togglePassword() { this.showPassword.update((v) => !v); }
    toggleConfirmPassword() { this.showConfirmPassword.update((v) => !v); }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.error.set(null);
        try {
            const { email, password, givenName, familyName } = this.form.value;
            await this.authService.register(email, password, email, givenName, familyName);
            this.pendingEmail = email;
            this.step.set('confirm');
        } catch (err: any) {
            this.error.set(err.message ?? 'Registration failed. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async onConfirm() {
        if (this.confirmForm.invalid) {
            this.confirmForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.error.set(null);
        try {
            await this.authService.confirmRegistration(this.pendingEmail, this.code.value);
            this.router.navigate(['/auth/login'], { queryParams: { registered: '1' } });
        } catch (err: any) {
            this.error.set(err.message ?? 'Invalid code. Please try again.');
        } finally {
            this.isLoading.set(false);
        }
    }
}
