import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
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
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'solicitudes',
        loadChildren: () => import('./features/solicitudes/solicitudes.routes').then(m => m.SOLICITUDES_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/lista/usuariosLista.component').then(m => m.UsuariosListaComponent),
        canActivate: [authGuard, roleGuard(['COORDINADOR', 'DIRECTOR'])]
    },
    {
        path: 'usuarios/gestion',
        loadComponent: () => import('./features/usuarios/gestion/usuarioGestion.component').then(m => m.UsuarioGestionComponent),
        canActivate: [authGuard, roleGuard(['COORDINADOR', 'DIRECTOR'])]
    },
    {
        path: 'usuarios/gestion/:id',
        loadComponent: () => import('./features/usuarios/gestion/usuarioGestion.component').then(m => m.UsuarioGestionComponent),
        canActivate: [authGuard, roleGuard(['COORDINADOR', 'DIRECTOR'])]
    },
    {
        path: 'ia/sugerencia',
        loadComponent: () => import('./features/ia/sugerencia/iaSugerencia.component').then(m => m.IASugerenciaComponent),
        canActivate: [authGuard]
    },
    {
        path: 'ia/resumen',
        loadComponent: () => import('./features/ia/resumen/iaResumen.component').then(m => m.IAResumenComponent),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
