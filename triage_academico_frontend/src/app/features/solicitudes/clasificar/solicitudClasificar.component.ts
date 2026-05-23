import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica, ClasificarSolicitudRequest, TipoSolicitud, NivelPrioridad } from '@models';
import { EstadoPipe } from '@shared/pipes/estado.pipe';
import { PrioridadPipe } from '@shared/pipes/prioridad.pipe';

@Component({
    selector: 'app-solicitud-clasificar',
    standalone: true,
    imports: [CommonModule, FormsModule, EstadoPipe, PrioridadPipe],
    templateUrl: './solicitudClasificar.component.html',
    styleUrls: ['./solicitudClasificar.component.scss']
})
export class SolicitudClasificarComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;
    loading = true;
    clasificando = false;
    id: number = 0;

    readonly today = new Date().toISOString().split('T')[0];
    readonly tiposSolicitud = Object.values(TipoSolicitud);
    readonly nivelesPrioridad = Object.values(NivelPrioridad);

    form = {
        tipoSolicitud: '' as TipoSolicitud,
        nivelPrioridad: '' as NivelPrioridad,
        justificacion: '',
        fechaLimite: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarSolicitud();
    }

    cargarSolicitud(): void {
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                this.form.tipoSolicitud = data.tipoSolicitud;
                this.form.nivelPrioridad = data.nivelPrioridad ?? '' as NivelPrioridad;
                this.form.fechaLimite = data.fechaLimite
                    ? new Date(data.fechaLimite).toISOString().split('T')[0]
                    : '';
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.router.navigate(['/app/solicitudes']);
            }
        });
    }

    get formularioValido(): boolean {
        return !!this.form.tipoSolicitud && !!this.form.nivelPrioridad && !!this.form.fechaLimite;
    }

    volver(): void {
        this.router.navigate(['/app/solicitudes', this.id]);
    }

    confirmar(): void {
        if (!this.formularioValido || !this.solicitud?.id) return;

        this.clasificando = true;
        const request: ClasificarSolicitudRequest = {
            tipoSolicitud: this.form.tipoSolicitud,
            nivelPrioridad: this.form.nivelPrioridad,
            justificacion: this.form.justificacion || undefined,
            fechaLimite: new Date(this.form.fechaLimite),
            version: this.solicitud.version ?? 0
        };

        this.solicitudService.clasificarSolicitud(this.solicitud.id, request).subscribe({
            next: () => this.router.navigate(['/app/solicitudes', this.id]),
            error: (err) => {
                console.error(err);
                this.clasificando = false;
            }
        });
    }
}