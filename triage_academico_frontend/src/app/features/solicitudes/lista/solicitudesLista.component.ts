import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UsuarioService, UsuarioFiltros } from '@core/services/usuario.service';
import { Usuario, Rol } from '@models';

type EstadoFiltro = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

interface FiltrosVista {
    nombre: string;
    email: string;
    rol: Rol | '';
    estado: EstadoFiltro;
    page: number;
    size: number;
}

@Component({
    selector: 'app-usuarios-lista',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './usuariosLista.component.html',
    styleUrls: ['./usuariosLista.component.scss']
})
export class UsuariosListaComponent implements OnInit {

    usuarios: Usuario[] = [];

    loading = false;
    errorMessage = '';

    totalElements = 0;
    totalPages = 0;

    accionEnProcesoId: number | null = null;

    filtros: FiltrosVista = {
        nombre: '',
        email: '',
        rol: '',
        estado: 'TODOS',
        page: 0,
        size: 20
    };

    readonly roles: Rol[] = Object.values(Rol);

    constructor(private usuarioService: UsuarioService) { }

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    cargarUsuarios(): void {
        this.loading = true;
        this.errorMessage = '';

        const filtrosApi = this.construirFiltrosApi();

        this.usuarioService.consultarUsuarios(filtrosApi).subscribe({
            next: (page) => {
                this.usuarios = page.content ?? [];
                this.totalElements = page.totalElements ?? this.usuarios.length;
                this.totalPages = page.totalPages ?? 0;
                this.filtros.page = page.number ?? this.filtros.page;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error cargando usuarios:', error);
                this.usuarios = [];
                this.totalElements = 0;
                this.totalPages = 0;
                this.errorMessage = error?.error?.message ?? 'No se pudieron cargar los usuarios.';
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
            nombre: '',
            email: '',
            rol: '',
            estado: 'TODOS',
            page: 0,
            size: 20
        };

        this.cargarUsuarios();
    }

    cambiarPagina(delta: number): void {
        const nuevaPagina = this.filtros.page + delta;

        if (nuevaPagina < 0 || nuevaPagina >= this.totalPages) {
            return;
        }

        this.filtros.page = nuevaPagina;
        this.cargarUsuarios();
    }

    toggleActivo(usuario: Usuario): void {
        this.errorMessage = '';
        this.accionEnProcesoId = usuario.id;

        const accion = usuario.activo
            ? this.usuarioService.desactivarUsuario(usuario.id)
            : this.usuarioService.activarUsuario(usuario.id);

        accion.subscribe({
            next: () => {
                this.accionEnProcesoId = null;
                this.cargarUsuarios();
            },
            error: (error) => {
                console.error('Error actualizando estado del usuario:', error);
                this.errorMessage = error?.error?.message ?? 'No se pudo actualizar el estado del usuario.';
                this.accionEnProcesoId = null;
            }
        });
    }

    eliminarUsuario(usuario: Usuario): void {
        const confirmado = confirm(
            `¿Está seguro de eliminar o desactivar al usuario ${usuario.nombre} ${usuario.apellido}?`
        );

        if (!confirmado) {
            return;
        }

        this.errorMessage = '';
        this.accionEnProcesoId = usuario.id;

        this.usuarioService.eliminarUsuario(usuario.id).subscribe({
            next: () => {
                this.accionEnProcesoId = null;
                this.cargarUsuarios();
            },
            error: (error) => {
                console.error('Error eliminando usuario:', error);
                this.errorMessage = error?.error?.message ?? 'No se pudo eliminar el usuario.';
                this.accionEnProcesoId = null;
            }
        });
    }

    getRolNombre(rol: Rol | string): string {
        const rolMap: Record<string, string> = {
            [Rol.ESTUDIANTE]: 'Estudiante',
            [Rol.DOCENTE]: 'Docente',
            [Rol.ADMINISTRATIVO]: 'Administrativo',
            [Rol.COORDINADOR]: 'Coordinador',
            [Rol.DIRECTOR]: 'Director'
        };

        return rolMap[rol] || rol;
    }

    trackByUsuarioId(index: number, usuario: Usuario): number {
        return usuario.id;
    }

    get hayFiltrosActivos(): boolean {
        return !!(
            this.filtros.nombre.trim() ||
            this.filtros.email.trim() ||
            this.filtros.rol ||
            this.filtros.estado !== 'TODOS'
        );
    }

    get paginaActual(): number {
        return this.filtros.page + 1;
    }

    get desde(): number {
        if (this.totalElements === 0) {
            return 0;
        }

        return this.filtros.page * this.filtros.size + 1;
    }

    get hasta(): number {
        return Math.min((this.filtros.page + 1) * this.filtros.size, this.totalElements);
    }

    private construirFiltrosApi(): UsuarioFiltros {
        const filtrosApi: UsuarioFiltros = {
            page: this.filtros.page,
            size: this.filtros.size
        };

        const nombre = this.filtros.nombre.trim();
        const email = this.filtros.email.trim();

        if (this.filtros.rol) {
            filtrosApi.rol = this.filtros.rol;
        }

        if (this.filtros.estado === 'ACTIVOS') {
            filtrosApi.activo = true;
        }

        if (this.filtros.estado === 'INACTIVOS') {
            filtrosApi.activo = false;
        }

        if (nombre) {
            filtrosApi.nombre = nombre;
        }

        if (email) {
            filtrosApi.email = email;
        }

        return filtrosApi;
    }
}