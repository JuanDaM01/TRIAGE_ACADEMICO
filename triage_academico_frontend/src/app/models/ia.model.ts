import { TipoSolicitud } from './enums/tipoSolicitud.enum';
import { NivelPrioridad } from './enums/nivelPrioridad.enum';

export interface SugerenciaIA {
    tipoSugerido: TipoSolicitud;
    prioridadSugerida: NivelPrioridad;
    explicacion: string;
    confianza: number;
    fechaSugerencia: Date;
}

export interface ResumenIA {
    resumen: string;
    puntosClave: string[];
    recomendaciones?: string[];
    fechaGeneracion: Date;
}