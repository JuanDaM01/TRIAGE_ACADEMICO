import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '@core/services/usuario.service';
import { Usuario, UsuarioRegistro, Rol } from '@models';
import { finalize } from 'rxjs';

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
        private router: Router
    ) {
        this.usuarioForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            apellido: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            rol: [Rol.ESTUDIANTE, Validators.required]
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.usuarioId = Number(id);
            this.cargarUsuario();
        }
    }

    cargarUsuario(): void {
        if (!this.usuarioId) {
            this.loading = false;
            this.errorMessage = 'No se encontró el identificador del usuario.';
            return;
        }

        this.loading = true;
        this.success = false;
        this.errorMessage = '';

        this.usuarioService.getUsuarioById(this.usuarioId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (usuario: Usuario) => {
                    const rolUsuario = String(usuario.rol) as Rol;

                    this.usuarioForm.patchValue({
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        email: usuario.email,
                        rol: rolUsuario,
                        password: ''
                    });
                },
                error: (err) => {
                    this.errorMessage =
                        err.error?.mensaje ??
                        err.error?.message ??
                        err.error?.error ??
                        'No se pudo cargar el usuario.';
                }
            });
    }

    onSubmit(): void {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.success = false;
        this.errorMessage = '';

        if (this.isEditMode && this.usuarioId) {
            const usuarioData = { ...this.usuarioForm.value };

            if (!usuarioData.password) {
                delete usuarioData.password;
            }

            this.usuarioService.actualizarUsuario(this.usuarioId, usuarioData).subscribe({
                next: () => {
                    this.loading = false;
                    this.success = true;

                    setTimeout(() => {
                        this.router.navigate(['/app/usuarios']);
                    }, 1000);
                },
                error: (err) => {
                    this.loading = false;
                    this.success = false;
                    this.errorMessage =
                        err.error?.mensaje ??
                        err.error?.message ??
                        err.error?.error ??
                        'No se pudo actualizar el usuario.';
                }
            });

            return;
        }

        const usuarioRegistro: UsuarioRegistro = this.usuarioForm.value;

        this.usuarioService.crearUsuario(usuarioRegistro).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;

                setTimeout(() => {
                    this.router.navigate(['/app/usuarios']);
                }, 1000);
            },
            error: (err) => {
                this.loading = false;
                this.success = false;
                this.errorMessage =
                    err.error?.mensaje ??
                    err.error?.message ??
                    err.error?.error ??
                    'No se pudo crear el usuario.';
            }
        });
    }

    cancelar(): void {
        this.router.navigate(['/app/usuarios']);
    }

    getRolNombre(rol: Rol): string {
        const rolMap: Record<Rol, string> = {
            [Rol.ESTUDIANTE]: 'Estudiante',
            [Rol.DOCENTE]: 'Docente',
            [Rol.ADMINISTRATIVO]: 'Administrativo',
            [Rol.COORDINADOR]: 'Coordinador',
            [Rol.DIRECTOR]: 'Director'
        };
        return rolMap[rol] || rol;
    }
}
