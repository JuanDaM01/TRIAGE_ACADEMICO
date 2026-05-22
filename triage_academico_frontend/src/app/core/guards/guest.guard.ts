import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { getDefaultAppRoute } from '@core/utils/auth-routes';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        router.navigate([getDefaultAppRoute(authService.getCurrentUser()?.rol)]);
        return false;
    }

    return true;
};
