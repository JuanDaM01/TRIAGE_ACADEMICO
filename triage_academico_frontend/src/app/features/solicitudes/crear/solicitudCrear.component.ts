import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { CrearSolicitudRequest, CanalOrigen, TipoSolicitud } from '../../../core/models';

@Component({
    selector: 'app-solicitud-crear',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './solicitudCrear.component.html',
    styleUrls: ['./solicitudCrear.component.scss']
})
export class SolicitudCrearComponent {

    solicitudForm: FormGroup;
    loading = false;
    success = false;

    readonly canalesOrigen = Object.values(CanalOrigen);
    readonly tiposSolicitud = Object.values(TipoSolicitud);

    constructor(
        private fb: FormBuilder,
        private solicitudService: SolicitudService,
        private router: Router
    ) {
        this.solicitudForm = this.fb.group({
            descripcion: ['', [Validators.required, Validators.minLength(10)]],
            tipoSolicitud: [TipoSolicitud.CONSULTA, Validators.required],
            canalOrigen: [CanalOrigen.SISTEMA, Validators.required],
            fechaLimite: ['']
        });
    }

    onSubmit(): void {
        if (this.solicitudForm.invalid) return;

        this.loading = true;

        const request: CrearSolicitudRequest = {
            ...this.solicitudForm.value,
            solicitanteId: 1 // Temporal - luego vendrá del usuario logueado
        };

        this.solicitudService.crearSolicitud(request).subscribe({
            next: () => {
                this.success = true;
                setTimeout(() => {
                    this.router.navigate(['/solicitudes']);
                }, 2000);
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }
}