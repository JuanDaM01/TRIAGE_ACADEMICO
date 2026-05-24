import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UsuarioService, UsuarioFiltros } from '@core/services/usuario.service';
import { Usuario, Rol } from '@models';

type EstadoUsuarioFiltro = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

interface FiltrosUsuariosVista {
    nombre: string;
    email: string;
    rol: Rol | '';
    estado: EstadoUsuarioFiltro;
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
export class UsuariosListaComponent implements OnInit, OnDestroy {

    usuarios: Usuario[] = [];
    loading = false;
    errorMessage = '';
    totalElements = 0;
    totalPages = 0;
    accionEnProcesoId: number | null = null;
    filtros: FiltrosUsuariosVista = this.crearFiltrosIniciales();
    readonly roles: Rol[] = Object.values(Rol) as Rol[];

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarUsuarios(): void {
        this.loading = true;
        this.errorMessage = '';
        this.cdr.detectChanges();

        const filtrosApi = this.construirFiltrosApi();

        this.usuarioService.consultarUsuarios(filtrosApi)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: (page) => {
                    this.usuarios = page.content ?? [];
                    this.totalElements = page.totalElements ?? this.usuarios.length;
                    this.totalPages = page.totalPages ?? 0;
                    this.filtros.page = page.number ?? this.filtros.page;
                    // FIX: detectChanges aquí para que la vista se actualice
                    // inmediatamente al recibir los datos, sin esperar al finalize
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.usuarios = [];
                    this.totalElements = 0;
                    this.totalPages = 0;
                    this.errorMessage =
                        error?.error?.message ??
                        error?.message ??
                        'No se pudieron cargar los usuarios.';
                    this.cdr.detectChanges();
                }
            });
    }

    aplicarFiltros(): void {
        this.filtros.page = 0;
        this.cargarUsuarios();
    }

    limpiarFiltros(): void {
        this.filtros = this.crearFiltrosIniciales();
        this.cargarUsuarios();
    }

    cambiarPagina(delta: number): void {
        const nuevaPagina = this.filtros.page + delta;
        if (nuevaPagina < 0 || nuevaPagina >= this.totalPages) return;
        this.filtros.page = nuevaPagina;
        this.cargarUsuarios();
    }

    toggleActivo(usuario: Usuario): void {
        this.errorMessage = '';
        this.accionEnProcesoId = usuario.id;
        this.cdr.detectChanges();

        const accion = usuario.activo
            ? this.usuarioService.desactivarUsuario(usuario.id)
            : this.usuarioService.activarUsuario(usuario.id);

        accion.pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.accionEnProcesoId = null;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => this.cargarUsuarios(),
            error: (error) => {
                this.errorMessage = error?.error?.message ?? 'No se pudo actualizar el estado del usuario.';
                this.cdr.detectChanges();
            }
        });
    }

    eliminarUsuario(id: number): void {
        if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

        this.errorMessage = '';
        this.accionEnProcesoId = id;
        this.cdr.detectChanges();

        this.usuarioService.eliminarUsuario(id).pipe(
            takeUntil(this.destroy$),
            finalize(() => {
                this.accionEnProcesoId = null;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => this.cargarUsuarios(),
            error: (error) => {
                this.errorMessage = error?.error?.message ?? 'No se pudo eliminar el usuario.';
                this.cdr.detectChanges();
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

    trackByUsuarioId(_: number, usuario: Usuario): number {
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

    get paginaActual(): number { return this.filtros.page + 1; }
    get desde(): number {
        return this.totalElements === 0 ? 0 : this.filtros.page * this.filtros.size + 1;
    }
    get hasta(): number {
        return Math.min((this.filtros.page + 1) * this.filtros.size, this.totalElements);
    }

    private crearFiltrosIniciales(): FiltrosUsuariosVista {
        return { nombre: '', email: '', rol: '', estado: 'TODOS', page: 0, size: 20 };
    }

    private construirFiltrosApi(): UsuarioFiltros {
        const filtrosApi: UsuarioFiltros = {
            page: this.filtros.page,
            size: this.filtros.size
        };

        const nombre = this.filtros.nombre.trim();
        const email = this.filtros.email.trim();

        if (nombre) filtrosApi.nombre = nombre;
        if (email) filtrosApi.email = email;
        if (this.filtros.rol) filtrosApi.rol = this.filtros.rol;
        if (this.filtros.estado === 'ACTIVOS') filtrosApi.activo = true;
        if (this.filtros.estado === 'INACTIVOS') filtrosApi.activo = false;

        return filtrosApi;
    }
}