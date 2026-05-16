import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Usuario, EstadoSolicitud, NivelPrioridad } from '../../core/models';
import { SolicitudService } from '../../core/services/solicitud.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    currentUser: Usuario | null = null;
    stats = {
        totalSolicitudes: 0,
        pendientes: 0,
        enAtencion: 0,
        criticas: 0
    };
    loadingStats = true;

    constructor(
        private authService: AuthService,
        private solicitudService: SolicitudService
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.cargarEstadisticas();
    }

    cargarEstadisticas(): void {
        this.solicitudService.getAllSolicitudes().subscribe({
            next: (solicitudes) => {
                this.stats = {
                    totalSolicitudes: solicitudes.length,
                    pendientes: solicitudes.filter(s =>
                        s.estado === EstadoSolicitud.REGISTRADA
                        || s.estado === EstadoSolicitud.CLASIFICADA
                    ).length,
                    enAtencion: solicitudes.filter(s =>
                        s.estado === EstadoSolicitud.EN_ATENCION
                    ).length,
                    criticas: solicitudes.filter(s =>
                        s.nivelPrioridad === NivelPrioridad.CRITICA
                    ).length
                };
                this.loadingStats = false;
            },
            error: () => {
                this.loadingStats = false;
            }
        });
    }

    getRolNombre(): string {
        return this.currentUser?.rol || 'Usuario';
    }
}
