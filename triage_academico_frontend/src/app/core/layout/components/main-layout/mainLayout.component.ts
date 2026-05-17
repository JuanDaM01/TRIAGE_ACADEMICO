import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { Usuario } from '../../../models';
import { Rol } from '../../../models/enums/rol.enum';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './mainLayout.component.html',
    styleUrls: ['./mainLayout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    currentUser: Usuario | null = null;
    sidebarCollapsed = false;
    mobileMenuOpen = false;
    pageTitle = 'Dashboard';
    readonly today = new Date();

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
                this.redirectStudentLanding();
                this.cdr.markForCheck();
            });

        // Set initial page title and track changes
        this.updatePageTitle(this.router.url);
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event: any) => {
                this.updatePageTitle(event.urlAfterRedirects || event.url);
                this.mobileMenuOpen = false;
                this.redirectStudentLanding();
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        this.cdr.markForCheck();
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        this.cdr.markForCheck();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    isStudentRole(): boolean {
        return this.currentUser?.rol === Rol.ESTUDIANTE;
    }

    private redirectStudentLanding(): void {
        if (!this.currentUser) {
            return;
        }

        const isStudent = this.currentUser.rol === Rol.ESTUDIANTE;
        const currentPath = this.router.url.split('?')[0];

        // Redirect students from dashboard to solicitudes
        if (isStudent && (currentPath === '/app/dashboard' || currentPath === '/app')) {
            this.router.navigate(['/app/solicitudes'], { replaceUrl: true });
        }
    }

    getRolLabel(): string {
        if (!this.currentUser) return '';
        switch (this.currentUser.rol) {
            case Rol.ESTUDIANTE: return 'Estudiante';
            case Rol.DOCENTE: return 'Docente';
            case Rol.ADMINISTRATIVO: return 'Administrativo';
            case Rol.COORDINADOR: return 'Coordinador';
            case Rol.DIRECTOR: return 'Director';
            default: return this.currentUser.rol;
        }
    }

    getRolEmoji(): string {
        if (!this.currentUser) return '';
        switch (this.currentUser.rol) {
            case Rol.ESTUDIANTE: return '🎓';
            case Rol.DOCENTE: return '👨‍🏫';
            case Rol.ADMINISTRATIVO: return '💼';
            case Rol.COORDINADOR: return '📋';
            case Rol.DIRECTOR: return '🏛️';
            default: return '👤';
        }
    }

    isAdminRole(): boolean {
        if (!this.currentUser) return false;
        return [Rol.COORDINADOR, Rol.DIRECTOR].includes(this.currentUser.rol);
    }

    private updatePageTitle(url: string): void {
        if (url.includes('/dashboard')) {
            this.pageTitle = 'Dashboard';
        } else if (url.includes('/solicitudes/crear')) {
            this.pageTitle = 'Nueva Solicitud';
        } else if (url.includes('/solicitudes/historial')) {
            this.pageTitle = 'Mi Historial';
        } else if (url.includes('/solicitudes/')) {
            this.pageTitle = 'Detalle de Solicitud';
        } else if (url.includes('/solicitudes')) {
            this.pageTitle = 'Lista de Solicitudes';
        } else if (url.includes('/usuarios')) {
            this.pageTitle = 'Gestión de Usuarios';
        } else if (url.includes('/ia/sugerencia')) {
            this.pageTitle = 'Sugerencias IA';
        } else if (url.includes('/ia/resumen')) {
            this.pageTitle = 'Resúmenes IA';
        } else {
            this.pageTitle = 'Triage Académico';
        }
    }
}