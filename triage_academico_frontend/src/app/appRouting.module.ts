import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { roleGuard } from '@core/guards/role.guard';

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
                path: 'ia/sugerencia',
                loadComponent: () => import('./features/ia/sugerencia/iaSugerencia.component').then(m => m.IASugerenciaComponent)
            },
            {
                path: 'ia/resumen',
                loadComponent: () => import('./features/ia/resumen/iaResumen.component').then(m => m.IAResumenComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' }
];