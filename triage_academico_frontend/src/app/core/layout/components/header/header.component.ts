import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { Usuario } from '../../../models';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [NgIf],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    currentUser: Usuario | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}