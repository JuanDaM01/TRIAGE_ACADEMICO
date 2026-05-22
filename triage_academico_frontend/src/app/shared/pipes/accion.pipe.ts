import { Pipe, PipeTransform } from '@angular/core';
import { AccionHistorial } from '@models';

@Pipe({
    name: 'accion',
    standalone: true
})
export class AccionPipe implements PipeTransform {
    transform(value: AccionHistorial): string {
        const accionMap: Record<AccionHistorial, string> = {
            [AccionHistorial.REGISTRO]: 'Registro',
            [AccionHistorial.CLASIFICACION]: 'Clasificación',
            [AccionHistorial.ASIGNACION_RESPONSABLE]: 'Asignación de Responsable',
            [AccionHistorial.ATENCION]: 'Atención',
            [AccionHistorial.CIERRE]: 'Cierre',
            [AccionHistorial.EDICION]: 'Edición'
        };
        return accionMap[value] || value;
    }
}
