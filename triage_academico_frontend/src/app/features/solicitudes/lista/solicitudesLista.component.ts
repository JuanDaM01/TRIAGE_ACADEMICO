import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { SolicitudAcademica } from '../../../core/models';
import { EstadoPipe } from '../../../shared/pipes/estado.pipe';
import { PrioridadPipe } from '../../../shared/pipes/prioridad.pipe';

@Component({
    selector: 'app-solicitudes-lista',
    standalone: true,
    imports: [CommonModule, RouterLink, EstadoPipe, PrioridadPipe],
    templateUrl: './solicitudesLista.component.html',
    styleUrls: ['./solicitudesLista.component.scss']
})
export class SolicitudesListaComponent implements OnInit {

    solicitudes: SolicitudAcademica[] = [];
    loading = true;
    errorMessage = '';

    constructor(private solicitudService: SolicitudService) { }

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
            },
            error: () => {
                this.errorMessage = 'No se pudieron cargar las solicitudes.';
                this.loading = false;
            }
        });
    }
}
