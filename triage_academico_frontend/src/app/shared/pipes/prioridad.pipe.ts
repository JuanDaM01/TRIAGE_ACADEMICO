import { Pipe, PipeTransform } from '@angular/core';
import { NivelPrioridad } from '../../core/models';

@Pipe({
    name: 'prioridad',
    standalone: true
})
export class PrioridadPipe implements PipeTransform {

    transform(prioridad: NivelPrioridad | undefined): string {
        if (!prioridad) return '—';

        const labels: Record<NivelPrioridad, string> = {
            [NivelPrioridad.BAJA]: 'Baja',
            [NivelPrioridad.MEDIA]: 'Media',
            [NivelPrioridad.ALTA]: 'Alta',
            [NivelPrioridad.CRITICA]: 'Crítica'
        };

        return labels[prioridad];
    }
}