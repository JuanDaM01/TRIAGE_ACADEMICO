import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { HistorialSolicitud } from '@models';
import { AccionPipe } from '@shared/pipes/accion.pipe';

@Component({
    selector: 'app-historial-solicitud',
    standalone: true,
    imports: [CommonModule, RouterLink, AccionPipe],
    templateUrl: './historialSolicitud.component.html',
    styleUrls: ['./historialSolicitud.component.scss']
})
export class HistorialSolicitudComponent implements OnInit {

    solicitudId: number = 0;
    historial: HistorialSolicitud[] = [];
    loading = true;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private solicitudService: SolicitudService
    ) {}

    ngOnInit(): void {
        this.solicitudId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.solicitudId) {
            this.cargarHistorial();
        } else {
            this.errorMessage = 'ID de solicitud no válido';
            this.loading = false;
        }
    }

    cargarHistorial(): void {
        this.loading = true;
        this.errorMessage = '';

        this.solicitudService.getHistorialSolicitud(this.solicitudId).subscribe({
            next: (data) => {
                this.historial = data;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudo cargar el historial de la solicitud.';
                this.loading = false;
            }
        });
    }

    formatearFecha(fecha: Date | string): string {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
