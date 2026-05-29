import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, take, timeout } from 'rxjs';
import { SolicitudService } from '@core/services/solicitud.service';
import { HistorialSolicitud } from '@models';
import { AccionPipe } from '@shared/pipes/accion.pipe';

@Component({
    selector: 'app-historial-solicitud',
    standalone: true,
    imports: [CommonModule, RouterLink, AccionPipe],
    templateUrl: './historialSolicitud.component.html',
    styleUrls: ['./historialSolicitud.component.scss']
})
export class HistorialSolicitudComponent implements OnInit {

    solicitudId: number = 0;
    historial: HistorialSolicitud[] = [];
    loading = true;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private solicitudService: SolicitudService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.route.paramMap.pipe(
            take(1),
            switchMap(params => {
                const id = Number(params.get('id'));
                if (!id || id <= 0) {
                    this.errorMessage = 'ID de solicitud no válido';
                    this.loading = false;
                    this.cdr.detectChanges();
                    return of([] as HistorialSolicitud[]);
                }
                this.solicitudId = id;
                return this.solicitudService.getHistorialSolicitud(id);
            }),
            timeout(15000),
            catchError(() => {
                this.errorMessage = 'No se pudo cargar el historial.';
                return of([] as HistorialSolicitud[]);
            }),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe(data => {
            this.historial = data;
            this.cdr.detectChanges();
        });
    }

    formatearFecha(fecha: Date | string): string {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    getAccionColor(accion: string): string {
        const map: Record<string, string> = {
            REGISTRO:              'bg-[#e0f4f1] text-[#004f45]',
            CLASIFICACION:         'bg-[#fff8e1] text-[#594400]',
            ASIGNACION_RESPONSABLE:'bg-[#e0f2fe] text-[#0369a1]',
            EDICION:               'bg-[#f3f4f6] text-[#374151]',
            ATENCION:              'bg-[#dcfce7] text-[#166534]',
            CIERRE:                'bg-[#f3f4f6] text-[#374151]',
        };
        return map[accion] ?? 'bg-[#ebefee] text-[#3e4946]';
    }

    getAccionIcon(accion: string): string {
        const map: Record<string, string> = {
            REGISTRO:              'edit_note',
            CLASIFICACION:         'category',
            ASIGNACION_RESPONSABLE:'person_add',
            EDICION:               'edit',
            ATENCION:              'task_alt',
            CIERRE:                'lock',
        };
        return map[accion] ?? 'history';
    }
}