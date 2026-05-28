import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SolicitudService } from '@core/services/solicitud.service';
import { EditarSolicitudRequest, CanalOrigen, TipoSolicitud, EstadoSolicitud } from '@models';

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
        if (this.solicitudForm.invalid || !this.editable) {
            return;
        }

        this.errorMessage = '';
        this.success = false;
        this.saving = true;

        this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
            next: (solicitud) => {
                const version = solicitud.version;

                if (version === null || version === undefined) {
                    this.errorMessage = 'No fue posible validar la versión de la solicitud. Intenta nuevamente.';
                    this.saving = false;
                    this.cdr.detectChanges();
                    return;
                }

                const formValue = this.solicitudForm.value;
                const request: EditarSolicitudRequest = {
                    descripcion: formValue.descripcion,
                    tipoSolicitud: formValue.tipoSolicitud,
                    canalOrigen: formValue.canalOrigen,
                    version: version
                };

                this.solicitudService.editarSolicitud(this.solicitudId, request).subscribe({
                    next: () => {
                        this.saving = false;
                        this.success = true;
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                        setTimeout(() => {
                            this.router.navigate(['/app/solicitudes', this.solicitudId]);
                        }, 1200);
                    },
                    error: (err) => {
                        this.saving = false;
                        this.errorMessage =
                            err.error?.message ||
                            err.error?.error ||
                            'No se pudo actualizar la solicitud. Intenta nuevamente.';
                        this.cdr.detectChanges();
                    }
                });
            },
            error: () => {
                this.saving = false;
                this.errorMessage = 'No se pudo validar el estado de la solicitud. Intenta nuevamente.';
                this.cdr.detectChanges();
            }
        });
    }

    cancelar(): void {
        this.router.navigate(['/app/solicitudes', this.solicitudId]);
    }
}
