import { Routes } from '@angular/router';

export const SOLICITUDES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./lista/solicitudesLista.component').then(m => m.SolicitudesListaComponent),
        title: 'Lista de Solicitudes'
    },
    {
        path: 'crear',
        loadComponent: () => import('./crear/solicitudCrear.component').then(m => m.SolicitudCrearComponent),
        title: 'Nueva Solicitud'
    },
    {
        path: ':id',
        loadComponent: () => import('./detalle/solicitudDetalle.component').then(m => m.SolicitudDetalleComponent),
        title: 'Detalle de Solicitud'
    }
];