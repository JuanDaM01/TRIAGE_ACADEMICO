import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SolicitudService } from '@core/services/solicitud.service';
import { AuthService } from '@core/auth/auth.service';
import { SolicitudAcademica, EstadoSolicitud, NivelPrioridad, Rol } from '@models';

@Component({
    selector: 'app-solicitudes-lista',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './solicitudesLista.component.html',
    styleUrls: ['./solicitudesLista.component.scss']
})
export class SolicitudesListaComponent implements OnInit {

    solicitudes: SolicitudAcademica[] = [];
    solicitudesOriginales: SolicitudAcademica[] = [];
    readonly EstadoSolicitud = EstadoSolicitud;
    loading = true;
    terminoBusqueda = '';
    errorMessage = '';

    private readonly destroy$ = new Subject<void>();

    // Estado para el modal de confirmación
    solicitudAEliminar: SolicitudAcademica | null = null;
    eliminando = false;

    constructor(
        private solicitudService: SolicitudService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.terminoBusqueda = params.get('q') ?? '';
                this.aplicarBusquedaGlobal();
                this.cdr.detectChanges();
            });

        this.cargarSolicitudes();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarSolicitudes(): void {
        this.loading = true;
        this.errorMessage = '';

        this.solicitudService.getAllSolicitudes().subscribe({
            next: (data) => {
                this.solicitudesOriginales = data ?? [];
                this.aplicarBusquedaGlobal();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.errorMessage = 'No se pudieron cargar las solicitudes.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // Determina si el usuario actual puede eliminar una solicitud
    puedeEliminar(sol: SolicitudAcademica): boolean {
        if (sol.estado !== EstadoSolicitud.REGISTRADA) return false;
        const usuario = this.authService.getCurrentUser();
        if (!usuario) return false;
        const esSolicitante = sol.solicitanteId === usuario.id;
        const esAdmin = usuario.rol === Rol.ADMINISTRATIVO;
        return esSolicitante || esAdmin;
    }

    // Abre el modal de confirmación
    confirmarEliminar(sol: SolicitudAcademica): void {
        this.solicitudAEliminar = sol;
        this.cdr.detectChanges();
    }

    // Cancela la eliminación
    cancelarEliminar(): void {
        this.solicitudAEliminar = null;
        this.eliminando = false;
        this.cdr.detectChanges();
    }

    // Ejecuta la eliminación
    ejecutarEliminar(): void {
        if (!this.solicitudAEliminar?.id) return;

        this.eliminando = true;

        this.solicitudService.eliminarSolicitud(this.solicitudAEliminar.id).subscribe({
            next: () => {
                this.solicitudesOriginales = this.solicitudesOriginales.filter(s => s.id !== this.solicitudAEliminar!.id);
                this.aplicarBusquedaGlobal();
                this.solicitudAEliminar = null;
                this.eliminando = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage =
                    err.error?.mensaje ??
                    err.error?.message ??
                    err.error?.error ??
                    'No se pudo eliminar la solicitud.';
                this.solicitudAEliminar = null;
                this.eliminando = false;
                this.cdr.detectChanges();
            }
        });
    }

    getEstadoLabel(estado: EstadoSolicitud): string {
        const map: Record<string, string> = {
            REGISTRADA: 'Registrada',
            CLASIFICADA: 'Clasificada',
            EN_ATENCION: 'En Atención',
            ATENDIDA: 'Atendida',
            CERRADA: 'Cerrada'
        };
        return map[estado] ?? estado;
    }

    getPrioridadLabel(p?: NivelPrioridad): string {
        if (!p) return '—';
        const map: Record<string, string> = {
            BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica'
        };
        return map[p] ?? p;
    }

    getProgressPercentage(estado: EstadoSolicitud): number {
        switch (estado) {
            case EstadoSolicitud.REGISTRADA: return 20;
            case EstadoSolicitud.CLASIFICADA: return 40;
            case EstadoSolicitud.EN_ATENCION: return 65;
            case EstadoSolicitud.ATENDIDA: return 85;
            case EstadoSolicitud.CERRADA: return 100;
            default: return 0;
        }
    }

    getProgressColorClass(estado: EstadoSolicitud): string {
        switch (estado) {
            case EstadoSolicitud.REGISTRADA: return 'bg-[#6e7976]';
            case EstadoSolicitud.CLASIFICADA: return 'bg-[#745900]';
            case EstadoSolicitud.EN_ATENCION: return 'bg-[#0369a1]';
            case EstadoSolicitud.ATENDIDA: return 'bg-[#004f45]';
            case EstadoSolicitud.CERRADA: return 'bg-[#2c3131]';
            default: return 'bg-gray-400';
        }
    }

    private aplicarBusquedaGlobal(): void {
        const termino = this.normalizarTexto(this.terminoBusqueda);

        if (!termino) {
            this.solicitudes = [...this.solicitudesOriginales];
            return;
        }

        this.solicitudes = this.solicitudesOriginales.filter(sol =>
            this.solicitudCoincideConBusqueda(sol, termino)
        );
    }

    private solicitudCoincideConBusqueda(sol: SolicitudAcademica, termino: string): boolean {
        const campos = [
            sol.id,
            sol.descripcion,
            sol.tipoSolicitud,
            this.getEstadoLabel(sol.estado),
            sol.estado,
            sol.nivelPrioridad,
            sol.nivelPrioridad ? this.getPrioridadLabel(sol.nivelPrioridad) : '',
            sol.canalOrigen,
            sol.solicitanteId,
            sol.responsableId,
            sol.justificacionPrioridad
        ];

        return campos.some(valor =>
            this.normalizarTexto(valor).includes(termino)
        );
    }

    private normalizarTexto(valor: unknown): string {
        return String(valor ?? '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    puedeEditar(): boolean {
        return this.authService.hasRole('ADMINISTRATIVO') ||
            this.authService.hasRole('DOCENTE') ||
            this.authService.hasRole('ESTUDIANTE');
    }
}