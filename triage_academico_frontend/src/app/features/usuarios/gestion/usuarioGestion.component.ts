import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '@core/services/usuario.service';
import { Usuario, UsuarioRegistro, Rol } from '@models';

@Component({
    selector: 'app-usuario-gestion',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './usuarioGestion.component.html',
    styleUrls: ['./usuarioGestion.component.scss']
})
export class UsuarioGestionComponent implements OnInit {

    usuarioForm: FormGroup;
    isEditMode = false;
    usuarioId?: number;
    loading = false;
    success = false;
    errorMessage = '';

    readonly roles = [
        Rol.ESTUDIANTE,
        Rol.DOCENTE,
        Rol.ADMINISTRATIVO
    ];

    constructor(
        private fb: FormBuilder,
        private usuarioService: UsuarioService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef   // ← FIX: forzar detección de cambios
    ) {
        this.usuarioForm = this.fb.group({
            nombre:   ['', [Validators.required, Validators.minLength(2)]],
            apellido: ['', [Validators.required, Validators.minLength(2)]],
            email:    ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            rol:      [Rol.ESTUDIANTE, Validators.required]
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && !isNaN(Number(id))) {
            this.isEditMode = true;
            this.usuarioId = Number(id);
            this.cargarUsuario();
        }
    }

    cargarUsuario(): void {
        if (!this.usuarioId) {
            this.errorMessage = 'No se encontró el identificador del usuario.';
            return;
        }

        // FIX: resetear estado antes de la petición
        this.loading      = true;
        this.success      = false;
        this.errorMessage = '';
        this.cdr.detectChanges();

        this.usuarioService.getUsuarioById(this.usuarioId).subscribe({
            next: (usuario: Usuario) => {
                // FIX: normalizar el rol a mayúsculas para evitar mismatch con el enum
                const rolNormalizado = (String(usuario.rol).toUpperCase()) as Rol;
                const rolValido = Object.values(Rol).includes(rolNormalizado)
                    ? rolNormalizado
                    : Rol.ESTUDIANTE;

                this.usuarioForm.patchValue({
                    nombre:   usuario.nombre   ?? '',
                    apellido: usuario.apellido ?? '',
                    email:    usuario.email    ?? '',
                    rol:      rolValido,
                    password: ''
                });

                // FIX: loading se apaga aquí, no en finalize()
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                // FIX: loading se apaga explícitamente en error también
                this.loading = false;
                this.errorMessage =
                    err.error?.mensaje  ??
                    err.error?.message  ??
                    err.error?.error    ??
                    'No se pudo cargar el usuario. Verifica tu conexión e inténtalo de nuevo.';
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit(): void {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            return;
        }

        this.loading      = true;
        this.success      = false;
        this.errorMessage = '';

        if (this.isEditMode && this.usuarioId) {
            const usuarioData = { ...this.usuarioForm.value };

            // No enviar contraseña vacía al backend
            if (!usuarioData.password || usuarioData.password.trim() === '') {
                delete usuarioData.password;
            }

            this.usuarioService.actualizarUsuario(this.usuarioId, usuarioData).subscribe({
                next: () => {
                    this.loading = false;
                    this.success = true;
                    this.cdr.detectChanges();
                    setTimeout(() => this.router.navigate(['/app/usuarios']), 1500);
                },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage =
                        err.error?.mensaje  ??
                        err.error?.message  ??
                        err.error?.error    ??
                        'No se pudo actualizar el usuario.';
                    this.cdr.detectChanges();
                }
            });

            return;
        }

        const usuarioRegistro: UsuarioRegistro = this.usuarioForm.value;

        this.usuarioService.crearUsuario(usuarioRegistro).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
                this.cdr.detectChanges();
                setTimeout(() => this.router.navigate(['/app/usuarios']), 1500);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage =
                    err.error?.mensaje  ??
                    err.error?.message  ??
                    err.error?.error    ??
                    'No se pudo crear el usuario.';
                this.cdr.detectChanges();
            }
        });
    }

    cancelar(): void {
        this.router.navigate(['/app/usuarios']);
    }

    getRolNombre(rol: Rol): string {
        const rolMap: Record<Rol, string> = {
            [Rol.ESTUDIANTE]:     'Estudiante',
            [Rol.DOCENTE]:        'Docente',
            [Rol.ADMINISTRATIVO]: 'Administrativo',
            [Rol.COORDINADOR]:    'Coordinador',
            [Rol.DIRECTOR]:       'Director'
        };
        return rolMap[rol] ?? rol;
    }
}