import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink, ModalComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
    form!: FormGroup;
    showPassword     = signal(false);
    isLoading        = signal(false);
    showSuccessModal = signal(false);
    loginRole        = signal<'admin' | 'staff'>('admin');
    error            = signal<string | null>(null);

    showConfirmStep  = signal(false);
    confirmEmail     = signal('');
    confirmCode      = signal('');
    isConfirming     = signal(false);
    confirmError     = signal<string | null>(null);
    resendCooldown   = signal(0);

    constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email, Validators.minLength(6), Validators.maxLength(45)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(45)]],
            rememberMe: [false],
        });

        if (this.route.snapshot.queryParams['registered'] === '1') {
            this.showSuccessModal.set(true);
        }
    }

    get email() { return this.form.get('email')!; }
    get password() { return this.form.get('password')!; }

    togglePassword() { this.showPassword.update((v) => !v); }
    dismissModal()   { this.showSuccessModal.set(false); }
    setRole(role: 'admin' | 'staff') {
        this.loginRole.set(role);
        this.error.set(null);
        this.form.reset();
    }
    async submitConfirmCode(): Promise<void> {
        const code = this.confirmCode().trim();
        if (!code) return;
        this.isConfirming.set(true);
        this.confirmError.set(null);
        try {
            await this.authService.confirmRegistration(this.confirmEmail(), code);
            this.showConfirmStep.set(false);
            this.confirmCode.set('');
            await this.onSubmit();
        } catch (err: any) {
            this.confirmError.set(err.message ?? 'Invalid confirmation code.');
        } finally {
            this.isConfirming.set(false);
        }
    }

    async resendCode(): Promise<void> {
        if (this.resendCooldown() > 0) return;
        try {
            await this.authService.resendCode(this.confirmEmail());
            this.resendCooldown.set(30);
            const interval = setInterval(() => {
                this.resendCooldown.update(v => {
                    if (v <= 1) { clearInterval(interval); return 0; }
                    return v - 1;
                });
            }, 1000);
        } catch (err: any) {
            this.confirmError.set(err.message ?? 'Could not resend code.');
        }
    }

    signInWithGoogle() {
        this.isLoading.set(true);
        this.authService.signInWithGoogle();
    }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.error.set(null);
        try {
            const { email, password, rememberMe } = this.form.value;
            const loginFn = this.loginRole() === 'staff'
                ? this.authService.loginAsStaff.bind(this.authService)
                : this.authService.login.bind(this.authService);
            const result = await loginFn(email, password, rememberMe);
            if (result.isSignedIn) {
                const claims = await this.authService.getTokenClaims();
                this.router.navigate([claims?.isStaff ? '/staff-dashboard' : '/onboarding']);
            } else if ((result as any).nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
                this.confirmEmail.set(email);
                this.showConfirmStep.set(true);
            }
        } catch (err: any) {
            this.error.set(err.message ?? 'Invalid email or password.');
        } finally {
            this.isLoading.set(false);
        }
    }

}
