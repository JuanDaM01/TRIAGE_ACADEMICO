import { AccionHistorial } from './enums/accionHistorial.enum';

export interface HistorialSolicitud {
    id?: number;
    fechaHoraAccion: Date | string;
    accion: AccionHistorial;
    usuarioId?: number;
    observacion?: string;
}