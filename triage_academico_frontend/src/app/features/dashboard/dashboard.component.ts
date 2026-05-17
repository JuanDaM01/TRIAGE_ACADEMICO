import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { Usuario, SolicitudAcademica, EstadoSolicitud, NivelPrioridad, Rol } from '../../core/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    currentUser: Usuario | null = null;
    solicitudesRecientes: SolicitudAcademica[] = [];
    rol: Rol | null = null;

    stats = {
        totalSolicitudes: 0,
        pendientes: 0,
        enAtencion: 0,
        criticas: 0,
        completadas: 0,
        promedioDias: 0
    };

    loadingStats = true;
    sidebarCollapsed = false;
    mobileMenuOpen = false;

    readonly today = new Date();

    readonly navItems = [
        { icon: '⬡', label: 'Dashboard', route: '/app/dashboard', roles: [] },
        { icon: '📋', label: 'Solicitudes', route: '/app/solicitudes', roles: [] },
        { icon: '➕', label: 'Nueva Solicitud', route: '/app/solicitudes/crear', roles: [] },
        { icon: '🕒', label: 'Mi Historial', route: '/app/solicitudes/historial', roles: [] },
    ];

    constructor(
        private authService: AuthService,
        private solicitudService: SolicitudService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
                this.rol = user?.rol || null;
                this.cdr.markForCheck();
            });

        this.cargarDatos();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarDatos(): void {
        this.loadingStats = true;
        this.solicitudService.getAllSolicitudes()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (solicitudes) => {
                    this.stats = {
                        totalSolicitudes: solicitudes.length,
                        pendientes: solicitudes.filter(s =>
                            s.estado === EstadoSolicitud.REGISTRADA ||
                            s.estado === EstadoSolicitud.CLASIFICADA
                        ).length,
                        enAtencion: solicitudes.filter(s =>
                            s.estado === EstadoSolicitud.EN_ATENCION
                        ).length,
                        criticas: solicitudes.filter(s =>
                            s.nivelPrioridad === NivelPrioridad.CRITICA
                        ).length,
                        completadas: solicitudes.filter(s =>
                            s.estado === EstadoSolicitud.CERRADA
                        ).length,
                        promedioDias: this.calcularPromedioDias(solicitudes)
                    };
                    // Últimas 5 solicitudes
                    this.solicitudesRecientes = [...solicitudes]
                        .sort((a, b) => {
                            const da = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
                            const db = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
                            return db - da;
                        })
                        .slice(0, 5);
                    this.loadingStats = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.loadingStats = false;
                    this.cdr.markForCheck();
                }
            });
    }

    private calcularPromedioDias(solicitudes: SolicitudAcademica[]): number {
        if (solicitudes.length === 0) return 0;
        const totalDias = solicitudes.reduce((sum, s) => {
            if (s.fechaCreacion && s.fechaActualizacion) {
                const inicio = new Date(s.fechaCreacion).getTime();
                const fin = new Date(s.fechaActualizacion).getTime();
                return sum + (fin - inicio) / (1000 * 60 * 60 * 24);
            }
            return sum;
        }, 0);
        return Math.round(totalDias / solicitudes.length);
    }

    isStudentRole(): boolean {
        return this.rol === Rol.ESTUDIANTE;
    }

    isTeacherRole(): boolean {
        return this.rol === Rol.DOCENTE;
    }

    isAdminRole(): boolean {
        return [Rol.ADMINISTRATIVO, Rol.COORDINADOR, Rol.DIRECTOR].includes(this.rol!);
    }

    isCoordinatorOrDirector(): boolean {
        return [Rol.COORDINADOR, Rol.DIRECTOR].includes(this.rol!);
    }

    getRolEmoji(): string {
        switch (this.rol) {
            case Rol.ESTUDIANTE: return '🎓';
            case Rol.DOCENTE: return '👨‍🏫';
            case Rol.ADMINISTRATIVO: return '💼';
            case Rol.COORDINADOR: return '📋';
            case Rol.DIRECTOR: return '🏛️';
            default: return '👤';
        }
    }

    getRolLabel(): string {
        switch (this.rol) {
            case Rol.ESTUDIANTE: return 'Estudiante';
            case Rol.DOCENTE: return 'Docente';
            case Rol.ADMINISTRATIVO: return 'Administrativo';
            case Rol.COORDINADOR: return 'Coordinador';
            case Rol.DIRECTOR: return 'Director';
            default: return 'Usuario';
        }
    }
}
                }
            });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    getRolLabel(): string {
        const rolMap: Record<string, string> = {
            'ESTUDIANTE': 'Estudiante',
            'DOCENTE': 'Docente',
            'ADMINISTRATIVO': 'Administrativo',
            'COORDINADOR': 'Coordinador',
            'DIRECTOR': 'Director'
        };
        return rolMap[this.currentUser?.rol ?? ''] ?? (this.currentUser?.rol ?? 'Usuario');
    }

    getRolEmoji(): string {
        const emojiMap: Record<string, string> = {
            'ESTUDIANTE': '🎓',
            'DOCENTE': '📚',
            'ADMINISTRATIVO': '🏛️',
            'COORDINADOR': '🗂️',
            'DIRECTOR': '🏅'
        };
        return emojiMap[this.currentUser?.rol ?? ''] ?? '👤';
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

    isAdmin(): boolean {
        const adminRoles = ['ADMINISTRATIVO', 'COORDINADOR', 'DIRECTOR'];
        return adminRoles.includes(this.currentUser?.rol ?? '');
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
