import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './core/layout/components/main-layout/mainLayout.component';

const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/registro/registro.component').then(m => m.RegistroComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
                title: 'Dashboard'
            },
            {
                path: 'solicitudes',
                loadChildren: () => import('./features/solicitudes/solicitudes.routes').then(m => m.SOLICITUDES_ROUTES)
            },
            {
                path: 'usuarios',
                canActivate: [roleGuard(['COORDINADOR', 'DIRECTOR'])],
                loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
                title: 'Gestión de Usuarios'
            },
            {
                path: 'ia',
                loadComponent: () => import('./features/ia/ia.component').then(m => m.IaComponent),
                title: 'Asistencia IA'
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }