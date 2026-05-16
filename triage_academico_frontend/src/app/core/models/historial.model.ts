import { EstadoSolicitud } from './enums/estadoSolicitud.enum';
import { AccionHistorial } from './enums/accionHistorial.enum';
import { MotivoRechazo } from './enums/motivoRechazo.enum';
import { Usuario } from './usuario.model';

export interface HistorialSolicitud {
    id?: number;
    solicitudId: number;
    fecha: Date;
    accion: AccionHistorial;
    usuario: Usuario;
    observaciones?: string;
    estadoAnterior?: EstadoSolicitud;
    estadoNuevo?: EstadoSolicitud;
    motivoRechazo?: MotivoRechazo;
}