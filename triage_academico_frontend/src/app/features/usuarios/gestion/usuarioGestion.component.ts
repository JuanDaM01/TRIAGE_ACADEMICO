import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario, UsuarioRegistro, Rol } from '../../../core/models';

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

    readonly roles = Object.values(Rol);

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
        if (!this.usuarioId) return;

        this.loading = true;
        this.usuarioService.getUsuarioById(this.usuarioId).subscribe({
            next: (usuario) => {
                this.usuarioForm.patchValue({
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    rol: usuario.rol,
                    password: ''
                });
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudo cargar el usuario.';
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.usuarioForm.invalid) return;

        this.loading = true;
        this.errorMessage = '';

        if (this.isEditMode && this.usuarioId) {
            const usuarioData = { ...this.usuarioForm.value };
            if (!usuarioData.password) {
                delete usuarioData.password;
            }
            this.usuarioService.actualizarUsuario(this.usuarioId, usuarioData).subscribe({
                next: () => {
                    this.success = true;
                    setTimeout(() => {
                        this.router.navigate(['/usuarios']);
                    }, 1500);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message ?? 'No se pudo actualizar el usuario.';
                    this.loading = false;
                }
            });
        } else {
            const usuarioRegistro: UsuarioRegistro = this.usuarioForm.value;
            this.usuarioService.crearUsuario(usuarioRegistro).subscribe({
                next: () => {
                    this.success = true;
                    setTimeout(() => {
                        this.router.navigate(['/usuarios']);
                    }, 1500);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message ?? 'No se pudo crear el usuario.';
                    this.loading = false;
                }
            });
        }
    }

    cancelar(): void {
        this.router.navigate(['/usuarios']);
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
