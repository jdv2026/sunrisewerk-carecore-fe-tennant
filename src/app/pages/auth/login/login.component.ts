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
    showPassword = signal(false);
    isLoading = signal(false);
    showSuccessModal = signal(false);

    error = signal<string | null>(null);

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
    dismissModal() { this.showSuccessModal.set(false); }
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
            const result = await this.authService.login(email, password, rememberMe);
            if (result.isSignedIn) {
                this.router.navigate(['/onboarding']);
            }
        } catch (err: any) {
            this.error.set(err.message ?? 'Invalid email or password.');
        } finally {
            this.isLoading.set(false);
        }
    }

}
