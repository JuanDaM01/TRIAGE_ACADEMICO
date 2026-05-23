import { TipoSolicitud } from './enums/tipoSolicitud.enum';
import { NivelPrioridad } from './enums/nivelPrioridad.enum';

export interface SugerenciaClasificacionResponse {
    tipoSugerido: TipoSolicitud;
    prioridadSugerida: NivelPrioridad;
    explicacion: string;
    confianza: number;
    requiereConfirmacion: boolean;
    fechaSugerencia: Date;
}

export interface ResumenIA {
    resumen: string;
    puntosClave: string[];
    recomendaciones?: string[];
    fechaGeneracion: Date;
}

export interface SugerenciaIA extends SugerenciaClasificacionResponse {}