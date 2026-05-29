import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Usuario } from '@models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

    @Input() currentUser: Usuario | null = null;

    @Output() menuToggle = new EventEmitter<void>();

    getRolLabel(): string {
        if (!this.currentUser) {
            return '';
        }
        const labels: Record<string, string> = {
            ESTUDIANTE: 'Estudiante',
            DOCENTE: 'Docente',
            ADMINISTRATIVO: 'Administrativo'
        };
        return labels[this.currentUser.rol] ?? this.currentUser.rol;
    }
}
