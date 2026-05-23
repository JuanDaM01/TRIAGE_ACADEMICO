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
    },
    {
        path: ':id/clasificar',
        loadComponent: () => import('./clasificar/solicitudClasificar.component').then(m => m.SolicitudClasificarComponent),
        title: 'Clasificar Solicitud'
    },
    {
        path: ':id/clasificar-ia',
        loadComponent: () => import('./clasificarIA/solicitudClasificarIA.component').then(m => m.SolicitudClasificarIAComponent),
        title: 'Clasificar Solicitud'
    },
    {
        path: ':id/historial',
        loadComponent: () => import('./historial/historialSolicitud.component').then(m => m.HistorialSolicitudComponent),
        title: 'Historial de Solicitud'
    }
];