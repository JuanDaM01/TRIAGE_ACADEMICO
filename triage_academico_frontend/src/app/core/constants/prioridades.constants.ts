import { NivelPrioridad } from '.././models';

export const PRIORIDADES = {
    BAJA: NivelPrioridad.BAJA,
    MEDIA: NivelPrioridad.MEDIA,
    ALTA: NivelPrioridad.ALTA,
    CRITICA: NivelPrioridad.CRITICA,
} as const;

export const PRIORIDAD_LABELS: Record<NivelPrioridad, string> = {
    [NivelPrioridad.BAJA]: 'Baja',
    [NivelPrioridad.MEDIA]: 'Media',
    [NivelPrioridad.ALTA]: 'Alta',
    [NivelPrioridad.CRITICA]: 'Crítica',
};

export const PRIORIDAD_COLORS: Record<NivelPrioridad, string> = {
    [NivelPrioridad.BAJA]: 'blue',
    [NivelPrioridad.MEDIA]: 'yellow',
    [NivelPrioridad.ALTA]: 'orange',
    [NivelPrioridad.CRITICA]: 'red',
};