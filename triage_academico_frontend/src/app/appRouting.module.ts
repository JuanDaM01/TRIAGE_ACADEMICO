import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { roleGuard } from '@core/guards/role.guard';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

const homeRedirectGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getCurrentUser();
    const staffRoles = ['DOCENTE', 'ADMINISTRATIVO', 'COORDINADOR', 'DIRECTOR'];
    if (user && staffRoles.includes(user.rol)) {
        return router.createUrlTree(['/app/dashboard']);
    }
    return router.createUrlTree(['/app/solicitudes']);
};

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/registro/registro.component').then(m => m.RegistroComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'app',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
                canActivate: [roleGuard(['DOCENTE', 'ADMINISTRATIVO', 'COORDINADOR', 'DIRECTOR'])]
            },
            {
                path: 'solicitudes',
                loadChildren: () => import('./features/solicitudes/solicitudes.routes').then(m => m.SOLICITUDES_ROUTES)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/usuarios/lista/usuariosLista.component').then(m => m.UsuariosListaComponent),
                canActivate: [roleGuard(['COORDINADOR', 'DIRECTOR'])]
            },
            {
                path: 'usuarios/gestion',
                loadComponent: () => import('./features/usuarios/gestion/usuarioGestion.component').then(m => m.UsuarioGestionComponent),
                canActivate: [roleGuard(['COORDINADOR', 'DIRECTOR'])]
            },
            {
                path: 'usuarios/gestion/:id',
                loadComponent: () => import('./features/usuarios/gestion/usuarioGestion.component').then(m => m.UsuarioGestionComponent),
                canActivate: [roleGuard(['COORDINADOR', 'DIRECTOR'])]
            },

            {
                path: 'ia',
                loadComponent: () => import('./features/ia/sugerencia/iaSugerencia.component')
                    .then(m => m.IASugerenciaComponent),
                canActivate: [roleGuard(['ADMINISTRATIVO', 'COORDINADOR', 'DIRECTOR'])]
            },

            {
                path: 'ia/sugerencia',
                redirectTo: 'ia',
                pathMatch: 'full'
            },
            {
                path: 'ia/resumen',
                redirectTo: 'ia',
                pathMatch: 'full'
            },

            { path: '', canActivate: [homeRedirectGuard], component: MainLayoutComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];