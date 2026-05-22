import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const user = authService.getCurrentUser();

        if (user && allowedRoles.includes(user.rol)) {
            return true;
        }

        // Redirigir a solicitudes si el usuario no tiene el rol requerido
        router.navigate(['/app/solicitudes']);
        return false;
    };
};