import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica, EstadoSolicitud } from '@models';
import { AuthService } from '@core/auth/auth.service';
import { EstadoPipe } from '@shared/pipes/estado.pipe';
import { PrioridadPipe } from '@shared/pipes/prioridad.pipe';

@Component({
    selector: 'app-solicitud-detalle',
    standalone: true,
    imports: [CommonModule, EstadoPipe, PrioridadPipe],
    templateUrl: './solicitudDetalle.component.html',
    styleUrls: ['./solicitudDetalle.component.scss']
})
export class SolicitudDetalleComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;
    loading = true;
    id: number = 0;

    private readonly ORDEN_ESTADOS = [
        EstadoSolicitud.REGISTRADA,
        EstadoSolicitud.CLASIFICADA,
        EstadoSolicitud.EN_ATENCION,
        EstadoSolicitud.ATENDIDA,
        EstadoSolicitud.CERRADA
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarDetalle();
    }

    cargarDetalle(): void {
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
                this.router.navigate(['/app/solicitudes']);
            }
        });
    }

    esEstadoAlcanzado(estadoKey: string): boolean {
        if (!this.solicitud) return false;
        const idxActual = this.ORDEN_ESTADOS.indexOf(this.solicitud.estado as EstadoSolicitud);
        const idxPaso   = this.ORDEN_ESTADOS.indexOf(estadoKey as EstadoSolicitud);
        return idxPaso <= idxActual;
    }

    volverALaLista(): void {
        this.router.navigate(['/app/solicitudes']);
    }

    irAClasificar(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar-ia']);
    }

    irAClasificarIA(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar-ia']);
    }

    irAClasificarManual(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar']);
    }

    asignarResponsableActual(): void {
        const responsableId = this.authService.getCurrentUser()?.id;
        if (!responsableId || !this.solicitud?.id || this.solicitud.version == null) {
            return;
        }

        this.solicitudService.asignarResponsable(this.solicitud.id, responsableId, this.solicitud.version).subscribe({
            next: () => this.cargarDetalle(),
            error: (err) => console.error(err)
        });
    }

    atender(): void {
        const obs = prompt('Ingrese observaciones de atención:');
        if (obs && this.solicitud?.id) {
            this.solicitudService.atenderSolicitud(this.solicitud.id, obs).subscribe({
                next: () => this.cargarDetalle(),
                error: (err) => console.error(err)
            });
        }
    }
}