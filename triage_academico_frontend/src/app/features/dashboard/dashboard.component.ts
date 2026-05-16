import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Usuario } from '../../core/models';
import { SolicitudService } from '../solicitudes/services/solicitud.service'; // Lo crearemos pronto

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
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

    constructor(
        private authService: AuthService,
        // private solicitudService: SolicitudService  → lo activaremos después
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.cargarEstadisticas();
    }

    cargarEstadisticas(): void {
        // Por ahora datos mock. Luego conectaremos con el backend.
        this.stats = {
            totalSolicitudes: 24,
            pendientes: 8,
            enAtencion: 11,
            criticas: 3
        };
    }

    getRolNombre(): string {
        return this.currentUser?.rol || 'Usuario';
    }
}