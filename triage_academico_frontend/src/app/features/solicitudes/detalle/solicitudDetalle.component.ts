import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica } from '@models';
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

    volverALaLista(): void {
        this.router.navigate(['/app/solicitudes']);
    }

    clasificar(): void {
        alert('Funcionalidad de Clasificar en desarrollo');
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