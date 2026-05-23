import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica, EstadoSolicitud, NivelPrioridad } from '@models';

@Component({
    selector: 'app-solicitudes-lista',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './solicitudesLista.component.html',
    styleUrls: ['./solicitudesLista.component.scss']
})
export class SolicitudesListaComponent implements OnInit, OnDestroy {

    solicitudes: SolicitudAcademica[] = [];
    loading = true;
    errorMessage = '';

    private routerSub?: Subscription;

    constructor(
        private solicitudService: SolicitudService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Carga inicial
        this.cargarSolicitudes();

        // Recarga cada vez que el usuario navega a esta misma ruta
        // (ej: vuelve desde crear/detalle a la lista)
        this.routerSub = this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            filter((e: any) => e.urlAfterRedirects === '/app/solicitudes' || e.url === '/app/solicitudes')
        ).subscribe(() => this.cargarSolicitudes());
    }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }

    cargarSolicitudes(): void {
        this.loading = true;
        this.errorMessage = '';

        this.solicitudService.getAllSolicitudes().subscribe({
            next: (data) => {
                this.solicitudes = data;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudieron cargar las solicitudes.';
                this.loading = false;
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
            BAJA: 'Baja',
            MEDIA: 'Media',
            ALTA: 'Alta',
            CRITICA: 'Crítica'
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
}