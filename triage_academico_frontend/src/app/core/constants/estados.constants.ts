import { EstadoSolicitud } from '.././models';

export const ESTADOS_SOLICITUD = {
    REGISTRADA: EstadoSolicitud.REGISTRADA,
    CLASIFICADA: EstadoSolicitud.CLASIFICADA,
    EN_ATENCION: EstadoSolicitud.EN_ATENCION,
    ATENDIDA: EstadoSolicitud.ATENDIDA,
    CERRADA: EstadoSolicitud.CERRADA,
} as const;

export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
    [EstadoSolicitud.REGISTRADA]: 'Registrada',
    [EstadoSolicitud.CLASIFICADA]: 'Clasificada',
    [EstadoSolicitud.EN_ATENCION]: 'En Atención',
    [EstadoSolicitud.ATENDIDA]: 'Atendida',
    [EstadoSolicitud.CERRADA]: 'Cerrada',
};

export const ESTADO_COLORS: Record<EstadoSolicitud, string> = {
    [EstadoSolicitud.REGISTRADA]: 'gray',
    [EstadoSolicitud.CLASIFICADA]: 'blue',
    [EstadoSolicitud.EN_ATENCION]: 'orange',
    [EstadoSolicitud.ATENDIDA]: 'green',
    [EstadoSolicitud.CERRADA]: 'purple',
};