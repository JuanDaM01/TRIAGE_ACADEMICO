import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService, UsuarioFiltros } from '@core/services/usuario.service';
import { Usuario, Rol } from '@models';

@Component({
    selector: 'app-usuarios-lista',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './usuariosLista.component.html',
    styleUrls: ['./usuariosLista.component.scss']
})
export class UsuariosListaComponent implements OnInit {

    usuarios: Usuario[] = [];
    loading = true;
    errorMessage = '';

    filtros: UsuarioFiltros = {
        rol: '',
        activo: undefined,
        page: 0,
        size: 20
    };

    readonly roles = Object.values(Rol);

    constructor(private usuarioService: UsuarioService) {}

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.loading = true;
        this.errorMessage = '';

        this.usuarioService.consultarUsuarios(this.filtros).subscribe({
            next: (page) => {
                this.usuarios = page.content;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudieron cargar los usuarios.';
                this.loading = false;
            }
        });
    }

    aplicarFiltros(): void {
        this.filtros.page = 0;
        this.cargarUsuarios();
    }

    limpiarFiltros(): void {
        this.filtros = {
            rol: '',
            activo: undefined,
            page: 0,
            size: 20
        };
        this.cargarUsuarios();
    }

    toggleActivo(usuario: Usuario): void {
        const action = usuario.activo 
            ? this.usuarioService.desactivarUsuario(usuario.id)
            : this.usuarioService.activarUsuario(usuario.id);

        action.subscribe({
            next: (updatedUsuario) => {
                const index = this.usuarios.findIndex(u => u.id === usuario.id);
                if (index !== -1) {
                    this.usuarios[index] = updatedUsuario;
                }
            },
            error: () => {
                this.errorMessage = 'No se pudo actualizar el estado del usuario.';
            }
        });
    }

    eliminarUsuario(id: number): void {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            this.usuarioService.eliminarUsuario(id).subscribe({
                next: () => {
                    this.usuarios = this.usuarios.filter(u => u.id !== id);
                },
                error: () => {
                    this.errorMessage = 'No se pudo eliminar el usuario.';
                }
            });
        }
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
