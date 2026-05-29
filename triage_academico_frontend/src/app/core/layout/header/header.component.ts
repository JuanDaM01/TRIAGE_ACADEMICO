import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';

import { Usuario } from '@models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

    @Input() currentUser: Usuario | null = null;

    @Output() menuToggle = new EventEmitter<void>();

    searchTerm = '';

    private readonly search$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.searchTerm = params.get('q') ?? '';
            });

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.searchTerm = this.route.snapshot.queryParamMap.get('q') ?? '';
            });

        this.search$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe(term => this.aplicarBusqueda(term));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.searchTerm = value;
        this.search$.next(value.trim());
    }

    private aplicarBusqueda(term: string): void {
        const currentPath = this.router.url.split('?')[0];
        const queryParams = {
            q: term || null
        };

        if (currentPath.startsWith('/app/solicitudes') || currentPath.startsWith('/app/usuarios')) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams,
                queryParamsHandling: 'merge'
            });
            return;
        }

        this.router.navigate(['/app/solicitudes'], {
            queryParams
        });
    }

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