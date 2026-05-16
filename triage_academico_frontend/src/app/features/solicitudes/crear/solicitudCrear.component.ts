import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { AuthService } from '../../../core/auth/auth.service';
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
    errorMessage = '';

    readonly canalesOrigen = Object.values(CanalOrigen);
    readonly tiposSolicitud = Object.values(TipoSolicitud);

    constructor(
        private fb: FormBuilder,
        private solicitudService: SolicitudService,
        private authService: AuthService,
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
        this.errorMessage = '';

        const user = this.authService.getCurrentUser();
        const request: CrearSolicitudRequest = {
            ...this.solicitudForm.value,
            solicitanteId: user?.id ?? 0
        };

        this.solicitudService.crearSolicitud(request).subscribe({
            next: () => {
                this.success = true;
                setTimeout(() => {
                    this.router.navigate(['/solicitudes']);
                }, 1500);
            },
            error: (err) => {
                this.errorMessage =
                    err.error?.message
                    ?? 'No se pudo crear la solicitud.';
                this.loading = false;
            }
        });
    }
}