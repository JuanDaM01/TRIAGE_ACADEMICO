import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica, EstadoSolicitud, NivelPrioridad } from '@models';

@Component({
    selector: 'app-solicitudes-lista',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './solicitudesLista.component.html',
    styleUrls: ['./solicitudesLista.component.scss']
})
export class SolicitudesListaComponent implements OnInit {

    solicitudes: SolicitudAcademica[] = [];
    loading = true;
    errorMessage = '';

    constructor(
        private solicitudService: SolicitudService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarSolicitudes();
    }

    cargarSolicitudes(): void {
        this.loading = true;
        this.errorMessage = '';

        this.solicitudService.getAllSolicitudes().subscribe({
            next: (data) => {
                this.solicitudes = data;
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
            case EstadoSolicitud.REGISTRADA:  return 20;
            case EstadoSolicitud.CLASIFICADA: return 40;
            case EstadoSolicitud.EN_ATENCION: return 65;
            case EstadoSolicitud.ATENDIDA:    return 85;
            case EstadoSolicitud.CERRADA:     return 100;
            default: return 0;
        }
    }

    getProgressColorClass(estado: EstadoSolicitud): string {
        switch (estado) {
            case EstadoSolicitud.REGISTRADA:  return 'bg-[#6e7976]';
            case EstadoSolicitud.CLASIFICADA: return 'bg-[#745900]';
            case EstadoSolicitud.EN_ATENCION: return 'bg-[#0369a1]';
            case EstadoSolicitud.ATENDIDA:    return 'bg-[#004f45]';
            case EstadoSolicitud.CERRADA:     return 'bg-[#2c3131]';
            default: return 'bg-gray-400';
        }
    }
}