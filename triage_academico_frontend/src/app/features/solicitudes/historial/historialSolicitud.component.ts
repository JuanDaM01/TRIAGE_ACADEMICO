import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, take, timeout } from 'rxjs';
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
        this.route.paramMap.pipe(
            take(1),
            switchMap(params => {
                const idParam = params.get('id');
                const id = Number(idParam);
                if (!idParam || Number.isNaN(id) || id <= 0) {
                    this.errorMessage = 'ID de solicitud no válido';
                    this.loading = false;
                    return of([] as HistorialSolicitud[]);
                }

                this.solicitudId = id;
                this.loading = true;
                this.errorMessage = '';
                return this.solicitudService.getHistorialSolicitud(id);
            }),
            timeout(15000),
            catchError((error) => {
                console.error('Error al cargar historial', error);
                this.errorMessage = 'No se pudo cargar el historial de la solicitud.';
                return of([] as HistorialSolicitud[]);
            }),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe((data) => {
            this.historial = data;
        });
    }

    cargarHistorial(): void {
        // Mantener compatibilidad con llamadas directas si se necesita reutilizar este método
        this.loading = true;
        this.errorMessage = '';

        this.solicitudService.getHistorialSolicitud(this.solicitudId)
            .pipe(
                timeout(15000),
                catchError((error) => {
                    console.error('Error al cargar historial', error);
                    this.errorMessage = 'No se pudo cargar el historial de la solicitud.';
                    return of([] as HistorialSolicitud[]);
                }),
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe((data) => {
                this.historial = data;
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
