import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { IAService, ResumenResponse, SugerenciaRequest } from '@core/services/ia.service';
import { NivelPrioridad, SugerenciaIA, TipoSolicitud } from '@models';

type TabIA = 'sugerencia' | 'resumen';

@Component({
    selector: 'app-ia-sugerencia',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './iaSugerencia.component.html',
    styleUrls: ['./iaSugerencia.component.scss']
})
export class IASugerenciaComponent {

    private readonly fb = inject(FormBuilder);
    private readonly iaService = inject(IAService);
    private readonly cdr = inject(ChangeDetectorRef);

    tabActiva: TabIA = 'sugerencia';

    loadingSugerencia = false;
    loadingResumen = false;

    errorSugerencia = '';
    errorResumen = '';

    sugerencia: SugerenciaIA | null = null;
    resumen: ResumenResponse | null = null;

    copiado = false;

    // FIX: solicitudId ahora es obligatorio
    sugerenciaForm = this.fb.group({
        solicitudId: ['', [Validators.required, Validators.min(1)]],
        descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });

    resumenForm = this.fb.group({
        solicitudId: ['', [Validators.required, Validators.min(1)]]
    });

    ejemplos: string[] = [
        'Necesito cancelar una asignatura porque tengo cruce de horario con otra materia obligatoria.',
        'Solicito homologación de asignaturas cursadas en otra universidad con sus respectivos contenidos.',
        'No pude registrar una asignatura porque el sistema indica que no hay cupos disponibles.',
        'Requiero respuesta urgente porque debo resolver mi matrícula antes del cierre académico.'
    ];

    cambiarTab(tab: TabIA): void {
        this.tabActiva = tab;
        this.errorSugerencia = '';
        this.errorResumen = '';
        this.copiado = false;
    }

    usarEjemplo(texto: string): void {
        this.tabActiva = 'sugerencia';
        this.sugerenciaForm.patchValue({ descripcion: texto });
        this.errorSugerencia = '';
        this.sugerencia = null;
    }

    obtenerSugerencia(): void {
        if (this.sugerenciaForm.invalid || this.loadingSugerencia) {
            this.sugerenciaForm.markAllAsTouched();
            return;
        }

        this.loadingSugerencia = true;
        this.errorSugerencia = '';
        this.sugerencia = null;
        this.copiado = false;

        const request: SugerenciaRequest = {
            solicitudId: Number(this.sugerenciaForm.value.solicitudId),
            descripcion: String(this.sugerenciaForm.value.descripcion ?? '').trim()
        };

        this.iaService.obtenerSugerencia(request)
            .pipe(finalize(() => { this.loadingSugerencia = false; this.cdr.detectChanges(); }))
            .subscribe({
                next: (respuesta) => { this.sugerencia = respuesta; },
                error: (error) => {
                    this.errorSugerencia = error?.error?.message ?? error?.message ?? 'No se pudo obtener la sugerencia de IA.';
                }
            });
    }

    generarResumen(): void {
        if (this.resumenForm.invalid || this.loadingResumen) {
            this.resumenForm.markAllAsTouched();
            return;
        }

        this.loadingResumen = true;
        this.errorResumen = '';
        this.resumen = null;
        this.copiado = false;

        this.iaService.generarResumen(Number(this.resumenForm.value.solicitudId))
            .pipe(finalize(() => { this.loadingResumen = false; this.cdr.detectChanges(); }))
            .subscribe({
                next: (respuesta) => { this.resumen = respuesta; },
                error: (error) => {
                    this.errorResumen = error?.error?.message ?? error?.message ?? 'No se pudo generar el resumen.';
                }
            });
    }

    limpiarSugerencia(): void {
        this.sugerenciaForm.reset({ solicitudId: '', descripcion: '' });
        this.sugerencia = null;
        this.errorSugerencia = '';
        this.copiado = false;
    }

    limpiarResumen(): void {
        this.resumenForm.reset({ solicitudId: '' });
        this.resumen = null;
        this.errorResumen = '';
        this.copiado = false;
    }

    copiarResultado(): void {
        const texto = this.textoResultadoActual();
        if (!texto || !navigator.clipboard) return;

        navigator.clipboard.writeText(texto).then(() => {
            this.copiado = true;
            this.cdr.detectChanges();
            setTimeout(() => { this.copiado = false; this.cdr.detectChanges(); }, 1600);
        });
    }

    textoResultadoActual(): string {
        if (this.tabActiva === 'sugerencia' && this.sugerencia) {
            return [
                `Tipo sugerido: ${this.getTipoLabel(this.sugerencia.tipoSugerido)}`,
                `Prioridad sugerida: ${this.getPrioridadLabel(this.sugerencia.prioridadSugerida)}`,
                `Confianza: ${this.confianzaPorcentaje}%`,
                `Explicación: ${this.sugerencia.explicacion}`
            ].join('\n');
        }
        if (this.tabActiva === 'resumen' && this.resumen) return this.resumen.resumen;
        return '';
    }

    get descripcionInvalida(): boolean {
        const c = this.sugerenciaForm.get('descripcion');
        return !!c && c.invalid && (c.dirty || c.touched);
    }

    get solicitudSugerenciaInvalida(): boolean {
        const c = this.sugerenciaForm.get('solicitudId');
        return !!c && c.invalid && (c.dirty || c.touched);
    }

    get solicitudResumenInvalida(): boolean {
        const c = this.resumenForm.get('solicitudId');
        return !!c && c.invalid && (c.dirty || c.touched);
    }

    get confianzaPorcentaje(): number {
        return Math.round((this.sugerencia?.confianza ?? 0) * 100);
    }

    get nivelConfianza(): string {
        if (this.confianzaPorcentaje >= 80) return 'Alta';
        if (this.confianzaPorcentaje >= 60) return 'Media';
        return 'Baja';
    }

    getTipoLabel(tipo?: TipoSolicitud | string): string {
        const labels: Record<string, string> = {
            REGISTRO_ASIGNATURAS: 'Registro de asignaturas',
            HOMOLOGACION: 'Homologación',
            CANCELACION: 'Cancelación',
            CUPOS: 'Solicitud de cupos',
            CONSULTA: 'Consulta académica',
            OTRO: 'Otro'
        };
        return tipo ? labels[String(tipo)] ?? String(tipo) : 'Sin tipo';
    }

    getPrioridadLabel(prioridad?: NivelPrioridad | string): string {
        const labels: Record<string, string> = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', CRITICA: 'Crítica' };
        return prioridad ? labels[String(prioridad)] ?? String(prioridad) : 'Sin prioridad';
    }

    getPrioridadClasses(prioridad?: NivelPrioridad | string): string {
        switch (String(prioridad ?? '')) {
            case 'CRITICA': return 'bg-[#fee2e2] text-[#93000a]';
            case 'ALTA':    return 'bg-[#fff4c7] text-[#745900]';
            case 'MEDIA':   return 'bg-[#e0f2fe] text-[#0369a1]';
            case 'BAJA':    return 'bg-[#dcfce7] text-[#166534]';
            default:        return 'bg-[#ebefee] text-[#3e4946]/70';
        }
    }

    getConfianzaClasses(): string {
        if (this.confianzaPorcentaje >= 80) return 'bg-[#dcfce7] text-[#166534]';
        if (this.confianzaPorcentaje >= 60) return 'bg-[#fff4c7] text-[#745900]';
        return 'bg-[#fee2e2] text-[#93000a]';
    }
}