import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SolicitudService, EditarSolicitudRequest } from '@core/services/solicitud.service';
import { CanalOrigen, TipoSolicitud, EstadoSolicitud } from '@models';

@Component({
    selector: 'app-solicitud-editar',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    templateUrl: './solicitudEditar.component.html',
    styleUrls: ['./solicitudEditar.component.scss']
})
export class SolicitudEditarComponent implements OnInit {

    solicitudForm: FormGroup;
    solicitudId = 0;
    loading = true;
    saving = false;
    errorMessage = '';
    success = false;
    editable = false;

    readonly canalesOrigen = Object.values(CanalOrigen);
    readonly tiposSolicitud = Object.values(TipoSolicitud);
    readonly EstadoSolicitud = EstadoSolicitud;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        private cdr: ChangeDetectorRef
    ) {
        this.solicitudForm = this.fb.group({
            descripcion: ['', [Validators.required, Validators.minLength(10)]],
            tipoSolicitud: [TipoSolicitud.CONSULTA, Validators.required],
            canalOrigen: [CanalOrigen.PRESENCIAL, Validators.required]
        });
    }

    ngOnInit(): void {
        this.solicitudId = Number(this.route.snapshot.paramMap.get('id'));

        if (!this.solicitudId || Number.isNaN(this.solicitudId)) {
            this.router.navigate(['/app/solicitudes']);
            return;
        }

        this.cargarSolicitud();
    }

    cargarSolicitud(): void {
        this.loading = true;
        this.errorMessage = '';
        this.success = false;
        this.editable = false;

        this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
            next: (solicitud) => {
                this.loading = false;
                this.editable = solicitud.estado === EstadoSolicitud.REGISTRADA;

                if (!this.editable) {
                    this.errorMessage = 'Solo se pueden editar solicitudes en estado Registrada.';
                    this.solicitudForm.disable({ emitEvent: false });
                }

                this.solicitudForm.patchValue({
                    descripcion: solicitud.descripcion,
                    tipoSolicitud: solicitud.tipoSolicitud,
                    canalOrigen: solicitud.canalOrigen
                });

                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'No se pudo cargar la solicitud. Intenta nuevamente.';
                this.cdr.detectChanges();
            }
        });
    }

    onSubmit(): void {
        if (this.solicitudForm.invalid || !this.editable || this.saving) {
            this.solicitudForm.markAllAsTouched();
            return;
        }

        this.errorMessage = '';
        this.success = false;
        this.saving = true;

        this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
            next: (solicitud) => {
                const version = solicitud.version;

                if (version === null || version === undefined) {
                    this.errorMessage = 'No fue posible validar la versión de la solicitud. Actualiza la página e intenta nuevamente.';
                    this.saving = false;
                    this.cdr.detectChanges();
                    return;
                }

                const formValue = this.solicitudForm.getRawValue();

                const request: EditarSolicitudRequest = {
                    descripcion: String(formValue.descripcion || '').trim(),
                    tipoSolicitud: formValue.tipoSolicitud,
                    canalOrigen: formValue.canalOrigen,
                    version: Number(version)
                };

                this.solicitudService.editarSolicitud(this.solicitudId, request).subscribe({ //REQUEST ME MARCA ERROR
                    next: () => {
                        this.saving = false;
                        this.success = true;
                        this.errorMessage = '';
                        this.cdr.detectChanges();

                        setTimeout(() => {
                            this.router.navigate(['/app/solicitudes', this.solicitudId]);
                        }, 1000);
                    },
                    error: (err) => {
                        this.saving = false;
                        this.success = false;
                        this.errorMessage = this.obtenerMensajeErrorEdicion(err);
                        this.cdr.detectChanges();
                    }
                });
            },
            error: (err) => {
                this.saving = false;
                this.success = false;
                this.errorMessage = this.obtenerMensajeErrorEdicion(err) || 'No se pudo validar el estado de la solicitud. Intenta nuevamente.';
                this.cdr.detectChanges();
            }
        });
    }

    private obtenerMensajeErrorEdicion(err: any): string {
        const erroresValidacion = err?.error?.errores;

        if (erroresValidacion && typeof erroresValidacion === 'object') {
            const mensajes = Object.values(erroresValidacion);
            if (mensajes.length > 0) {
                return String(mensajes[0]);
            }
        }

        const mensajeBackend =
            err?.error?.mensaje ||
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '');

        if (err?.status === 400) {
            return mensajeBackend || 'La información enviada no es válida. Revisa los campos del formulario.';
        }

        if (err?.status === 403) {
            return 'No tienes permisos para editar esta solicitud.';
        }

        if (err?.status === 404) {
            return 'La solicitud no fue encontrada.';
        }

        if (err?.status === 409) {
            return mensajeBackend || 'La solicitud fue modificada por otro usuario. Actualiza la página e intenta nuevamente.';
        }

        if (err?.status === 500) {
            return mensajeBackend || 'El servidor no pudo actualizar la solicitud. Revisa la consola del backend.';
        }

        return mensajeBackend || 'No se pudo actualizar la solicitud. Intenta nuevamente.';
    }

    cancelar(): void {
        this.router.navigate(['/app/solicitudes', this.solicitudId]);
    }
}
