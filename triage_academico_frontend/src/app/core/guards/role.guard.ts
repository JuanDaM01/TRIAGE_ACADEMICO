import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const user = authService.getCurrentUser();

        if (user && allowedRoles.includes(user.rol)) {
            return true;
        }

        router.navigate(['/dashboard']);
        return false;
    };
};