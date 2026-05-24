import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { IAService } from '@core/services/ia.service';
import {
    SolicitudAcademica,
    ClasificarSolicitudRequest,
    TipoSolicitud,
    NivelPrioridad,
    SugerenciaIA
} from '@models';

type Paso = 'elegir' | 'ia-cargando' | 'ia-revision' | 'manual' | 'confirmando';

@Component({
    selector: 'app-solicitud-clasificar-ia',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './solicitudClasificarIA.component.html',
    styleUrls: ['./solicitudClasificarIA.component.scss']
})
export class SolicitudClasificarIAComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;
    loading = true;
    id: number = 0;

    /** Controla en qué paso del flujo estamos */
    paso: Paso = 'elegir';

    /** Sugerencia retornada por la IA */
    sugerenciaIA: SugerenciaIA | null = null;
    errorIA = '';

    /** Error al confirmar la clasificación */
    errorClasificar = '';

    readonly today = new Date().toISOString().split('T')[0];
    readonly tiposSolicitud = Object.values(TipoSolicitud);
    readonly nivelesPrioridad = Object.values(NivelPrioridad);

    /** Formulario unificado — se usa tanto para manual como para editar la sugerencia IA */
    form = {
        tipoSolicitud: '' as TipoSolicitud,
        nivelPrioridad: '' as NivelPrioridad,
        justificacion: '',
        fechaLimite: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        private iaService: IAService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarSolicitud();
    }

    // ─── Carga inicial ───────────────────────────────────────────────────────

    cargarSolicitud(): void {
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                // Pre-cargar valores existentes si ya había clasificación parcial
                this.form.tipoSolicitud = data.tipoSolicitud;
                this.form.nivelPrioridad = data.nivelPrioridad ?? '' as NivelPrioridad;
                this.form.fechaLimite = data.fechaLimite
                    ? new Date(data.fechaLimite).toISOString().split('T')[0]
                    : '';
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.router.navigate(['/app/solicitudes']);
            }
        });
    }

    // ─── Paso 1: elegir método ────────────────────────────────────────────────

    elegirIA(): void {
        if (!this.solicitud?.descripcion) {
            this.errorIA = 'La solicitud no tiene descripción para analizar.';
            return;
        }
        this.paso = 'ia-cargando';
        this.errorIA = '';
        this.sugerenciaIA = null;
        this.llamarIA();
    }

    elegirManual(): void {
        this.paso = 'manual';
    }

    // ─── Paso 2-IA: llamar a la IA ───────────────────────────────────────────

    private llamarIA(): void {
        this.iaService.obtenerSugerencia({
            solicitudId: this.solicitud!.id!,
            descripcion: this.solicitud!.descripcion
        }).subscribe({
            next: (sugerencia) => {
                this.sugerenciaIA = sugerencia;

                // Aplicar sugerencia al formulario si los valores son válidos
                if (sugerencia.tipoSugerido && this.tiposSolicitud.includes(sugerencia.tipoSugerido)) {
                    this.form.tipoSolicitud = sugerencia.tipoSugerido;
                }
                if (sugerencia.prioridadSugerida && this.nivelesPrioridad.includes(sugerencia.prioridadSugerida)) {
                    this.form.nivelPrioridad = sugerencia.prioridadSugerida;
                }
                if (sugerencia.explicacion) {
                    this.form.justificacion = sugerencia.explicacion;
                }

                this.paso = 'ia-revision';
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al obtener sugerencia IA:', err);
                if (err.status === 403) {
                    this.errorIA = 'No tienes permisos para usar la clasificación con IA.';
                } else if (err.status === 404) {
                    this.errorIA = 'No se encontró la solicitud para analizar.';
                } else {
                    this.errorIA = 'El servicio de IA no está disponible en este momento. Puedes clasificar manualmente.';
                }
                // Volvemos al paso de elección mostrando el error
                this.paso = 'elegir';
                this.cdr.detectChanges();
            }
        });
    }

    /** Reintentar llamada a IA desde la pantalla de revisión (botón "Regenerar") */
    regenerarSugerencia(): void {
        this.paso = 'ia-cargando';
        this.sugerenciaIA = null;
        this.llamarIA();
    }

    /** El humano acepta la sugerencia tal cual — avanza a confirmar */
    aceptarSugerencia(): void {
        // El formulario ya tiene los valores de la sugerencia aplicados
        this.confirmar();
    }

    /** El humano rechaza la IA y prefiere hacerlo manualmente */
    rechazarSugerenciaIrManual(): void {
        this.paso = 'manual';
    }

    // ─── Confirmación final ───────────────────────────────────────────────────

    get formularioValido(): boolean {
        return !!this.form.tipoSolicitud && !!this.form.nivelPrioridad;
    }

    confirmar(): void {
        if (!this.formularioValido || !this.solicitud?.id) return;

        this.errorClasificar = '';
        this.paso = 'confirmando';

        // Re-obtener la última versión antes de intentar clasificar
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (latest) => {
                const request: ClasificarSolicitudRequest = {
                    tipoSolicitud: this.form.tipoSolicitud,
                    nivelPrioridad: this.form.nivelPrioridad,
                    justificacion: this.form.justificacion || undefined,
                    fechaLimite: this.form.fechaLimite ? new Date(this.form.fechaLimite) : undefined,
                    version: latest.version ?? 0
                };

                this.solicitudService.clasificarSolicitud(this.solicitud!.id!, request).subscribe({
                    next: () => this.router.navigate(['/app/solicitudes', this.id]),
                    error: (err) => {
                        console.error('Error al clasificar solicitud:', err);
                        this.errorClasificar = err.error?.mensaje
                            ?? 'Error al clasificar la solicitud. Inténtalo de nuevo.';
                        // Volver al paso correcto según el método usado
                        this.paso = this.sugerenciaIA ? 'ia-revision' : 'manual';
                        this.cdr.detectChanges();
                    }
                });
            },
            error: () => {
                this.errorClasificar = 'No se pudo obtener la versión actual de la solicitud. Recarga e intenta de nuevo.';
                this.paso = this.sugerenciaIA ? 'ia-revision' : 'manual';
                this.cdr.detectChanges();
            }
        });
    }

    // ─── Utilidades de confianza IA ───────────────────────────────────────────

    get confianzaPorcentaje(): number {
        if (!this.sugerenciaIA) return 0;
        const val = Number(this.sugerenciaIA.confianza);
        return isNaN(val) ? 0 : Math.round(val * 100);
    }

    get confianzaLabel(): string {
        const pct = this.confianzaPorcentaje;
        if (pct >= 80) return 'Alta confianza';
        if (pct >= 60) return 'Confianza media';
        return 'Confianza baja';
    }

    get confianzaColor(): 'green' | 'amber' | 'red' {
        const pct = this.confianzaPorcentaje;
        if (pct >= 80) return 'green';
        if (pct >= 60) return 'amber';
        return 'red';
    }

    // ─── Navegación ───────────────────────────────────────────────────────────

    volver(): void {
        if (this.paso === 'manual' || this.paso === 'ia-revision') {
            this.paso = 'elegir';
            this.sugerenciaIA = null;
            this.errorIA = '';
            this.errorClasificar = '';
        } else {
            this.router.navigate(['/app/solicitudes', this.id]);
        }
    }

    volverADetalle(): void {
        this.router.navigate(['/app/solicitudes', this.id]);
    }
}