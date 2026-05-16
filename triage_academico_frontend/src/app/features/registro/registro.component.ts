import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Rol } from '../../core/models';

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {

    registroForm: FormGroup;
    loading = false;
    error = '';
    success = false;

    readonly rolesDisponibles = [
        { value: Rol.ESTUDIANTE, label: 'Estudiante' },
        { value: Rol.DOCENTE, label: 'Docente' }
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registroForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            apellido: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rol: [Rol.ESTUDIANTE, Validators.required]
        });
    }

    onSubmit(): void {
        if (this.registroForm.invalid) return;

        this.loading = true;
        this.error = '';

        this.authService.registro(this.registroForm.value).subscribe({
            next: () => {
                this.success = true;
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2500);
            },
            error: (err) => {
                this.error = err.error?.message || 'Error al registrar usuario';
                this.loading = false;
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}