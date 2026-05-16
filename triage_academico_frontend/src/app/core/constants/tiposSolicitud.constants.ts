import { TipoSolicitud } from '.././models';

export const TIPOS_SOLICITUD = {
    REGISTRO_ASIGNATURAS: TipoSolicitud.REGISTRO_ASIGNATURAS,
    HOMOLOGACION: TipoSolicitud.HOMOLOGACION,
    CANCELACION: TipoSolicitud.CANCELACION,
    CUPOS: TipoSolicitud.CUPOS,
    CONSULTA: TipoSolicitud.CONSULTA,
    OTRO: TipoSolicitud.OTRO,
} as const;

export const TIPO_SOLICITUD_LABELS: Record<TipoSolicitud, string> = {
    [TipoSolicitud.REGISTRO_ASIGNATURAS]: 'Registro de Asignaturas',
    [TipoSolicitud.HOMOLOGACION]: 'Homologación',
    [TipoSolicitud.CANCELACION]: 'Cancelación',
    [TipoSolicitud.CUPOS]: 'Solicitud de Cupos',
    [TipoSolicitud.CONSULTA]: 'Consulta',
    [TipoSolicitud.OTRO]: 'Otro',
};