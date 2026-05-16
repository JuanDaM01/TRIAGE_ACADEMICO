import { Pipe, PipeTransform } from '@angular/core';
import { EstadoSolicitud } from '../../core/models';

@Pipe({
    name: 'estado',
    standalone: true
})
export class EstadoPipe implements PipeTransform {

    transform(estado: EstadoSolicitud | undefined): string {
        if (!estado) return 'Desconocido';

        const labels: Record<EstadoSolicitud, string> = {
            [EstadoSolicitud.REGISTRADA]: 'Registrada',
            [EstadoSolicitud.CLASIFICADA]: 'Clasificada',
            [EstadoSolicitud.EN_ATENCION]: 'En Atención',
            [EstadoSolicitud.ATENDIDA]: 'Atendida',
            [EstadoSolicitud.CERRADA]: 'Cerrada'
        };

        return labels[estado];
    }
}