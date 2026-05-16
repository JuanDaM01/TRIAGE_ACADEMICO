import { EstadoSolicitud } from './enums/estadoSolicitud.enum';
import { TipoSolicitud } from './enums/tipoSolicitud.enum';
import { NivelPrioridad } from './enums/nivelPrioridad.enum';
import { CanalOrigen } from './enums/canalOrigen.enum';
import { Usuario } from './usuario.model';
import { SugerenciaIA } from './ia.model';

export interface SolicitudAcademica {
    id?: number;
    descripcion: string;
    estado: EstadoSolicitud;
    tipoSolicitud: TipoSolicitud;
    nivelPrioridad?: NivelPrioridad;
    solicitanteId: number;
    solicitante?: Usuario;
    responsableId?: number;
    responsable?: Usuario;
    canalOrigen: CanalOrigen;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
    fechaLimite?: Date;
    version?: number;

    justificacionPrioridad?: string;
    sugerenciaIA?: SugerenciaIA;
}

export interface CrearSolicitudRequest {
    descripcion: string;
    tipoSolicitud?: TipoSolicitud;
    canalOrigen: CanalOrigen;
    solicitanteId: number;
    fechaLimite?: Date;
}

export interface ClasificarSolicitudRequest {
    tipoSolicitud: TipoSolicitud;
    nivelPrioridad?: NivelPrioridad;
    fechaLimite?: Date;
    justificacion?: string;
    version: number;
}