import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthLandingBgComponent } from '@shared/ui/auth-landing-bg/auth-landing-bg.component';
import { AuthService } from '@core/auth/auth.service';
import { getDefaultAppRoute } from '@core/utils/auth-routes';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLandingBgComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    readonly logoSrc = 'assets/logo-uq.png';

    form: FormGroup;
    showPassword = false;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            remember: [false]
        });
    }

    ngOnInit(): void {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            this.form.patchValue({ email: remembered, remember: true });
        }
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const { email, password, remember } = this.form.value;

        this.authService.login({ email, password }).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: () => {
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                const returnUrl = this.route.snapshot.queryParams['returnUrl']
                    || getDefaultAppRoute(this.authService.getCurrentUser()?.rol);
                this.router.navigateByUrl(returnUrl);
            },
            error: (err) => {
                this.errorMessage =
                    err.error?.message
                    ?? err.error?.error
                    ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            }
        });
    }

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }
}
