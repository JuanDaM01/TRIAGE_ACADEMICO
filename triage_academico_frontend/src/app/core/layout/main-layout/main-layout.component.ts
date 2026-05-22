import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { Usuario, Rol } from '@models';
import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';
import { HeaderComponent } from '@core/layout/header/header.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {

    private readonly destroy$ = new Subject<void>();

    currentUser: Usuario | null = null;
    mobileMenuOpen = false;

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
                this.redirectStudentLanding();
                this.cdr.markForCheck();
            });

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.mobileMenuOpen = false;
                this.redirectStudentLanding();
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        this.cdr.markForCheck();
    }

    closeMobileMenu(): void {
        this.mobileMenuOpen = false;
        this.cdr.markForCheck();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    private redirectStudentLanding(): void {
        if (!this.currentUser || this.currentUser.rol !== Rol.ESTUDIANTE) {
            return;
        }

        const currentPath = this.router.url.split('?')[0];
        if (currentPath === '/app/dashboard' || currentPath === '/app') {
            this.router.navigate(['/app/solicitudes'], { replaceUrl: true });
        }
    }
}
