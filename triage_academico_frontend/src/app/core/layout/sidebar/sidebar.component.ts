import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/auth/auth.service';
import { Usuario, Rol } from '@models';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {

    @Input() mobileMenuOpen = false;
    @Input() currentUser: Usuario | null = null;

    @Output() menuClose = new EventEmitter<void>();
    @Output() logoutClick = new EventEmitter<void>();

    constructor(public authService: AuthService) { }

    isStudentRole(): boolean {
        return this.currentUser?.rol === Rol.ESTUDIANTE;
    }

    isAdminRole(): boolean {
        if (!this.currentUser) {
            return false;
        }

        return [
            Rol.ADMINISTRATIVO,
            Rol.COORDINADOR,
            Rol.DIRECTOR
        ].includes(this.currentUser.rol);
    }

    getRolLabel(): string {
        if (!this.currentUser) {
            return '';
        }
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
        if (!this.currentUser) {
            return '';
        }
        switch (this.currentUser.rol) {
            case Rol.ESTUDIANTE: return '🎓';
            case Rol.DOCENTE: return '👨‍🏫';
            case Rol.ADMINISTRATIVO: return '💼';
            case Rol.COORDINADOR: return '📋';
            case Rol.DIRECTOR: return '🏛️';
            default: return '👤';
        }
    }

    onNavClick(): void {
        this.menuClose.emit();
    }

    onLogout(): void {
        this.logoutClick.emit();
    }
}
