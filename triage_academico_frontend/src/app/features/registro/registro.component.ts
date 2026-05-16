import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { Rol } from '../../core/models';
import { AuthLandingBgComponent } from '../../shared/ui/auth-landing-bg/auth-landing-bg.component';

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthLandingBgComponent],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {

    form: FormGroup;
    showPassword = false;
    showConfirmPassword = false;
    loading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern(/@uniquindio\.edu\.co$/i)
                ]
            ],
            password: ['', [Validators.required, Validators.minLength(4)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordsMatchValidator });
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const { nombre, apellido, email, password } = this.form.value;

        this.authService.registro({
            nombre,
            apellido,
            email,
            password,
            rol: Rol.ESTUDIANTE
        }).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: () => this.router.navigate(['/dashboard']),
            error: (err) => {
                this.errorMessage =
                    err.error?.message
                    ?? err.error?.error
                    ?? 'No se pudo completar el registro. Verifica los datos e intenta de nuevo.';
            }
        });
    }

    private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;

        if (!password || !confirm) {
            return null;
        }

        return password === confirm ? null : { passwordMismatch: true };
    }

    get nombre() {
        return this.form.get('nombre');
    }

    get apellido() {
        return this.form.get('apellido');
    }

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }

    get confirmPassword() {
        return this.form.get('confirmPassword');
    }

    get passwordsMismatch(): boolean {
        return this.form.hasError('passwordMismatch')
            && (this.confirmPassword?.touched ?? false);
    }
}
