import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/components/main-layout/mainLayout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
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
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            {
                path: 'solicitudes',
                loadChildren: () => import('./features/solicitudes/solicitudes.routes').then(m => m.SOLICITUDES_ROUTES)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
                canActivate: [roleGuard(['COORDINADOR', 'DIRECTOR'])]
            },
            {
                path: 'ia',
                loadComponent: () => import('./features/ia/ia.component').then(m => m.IaComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];