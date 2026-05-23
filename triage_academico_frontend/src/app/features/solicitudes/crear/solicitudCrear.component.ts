import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '@core/services/solicitud.service';
import { AuthService } from '@core/auth/auth.service';
import { CrearSolicitudRequest, CanalOrigen, TipoSolicitud } from '@models';

@Component({
    selector: 'app-solicitud-crear',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
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
        this.success = false;

        const user = this.authService.getCurrentUser();
        const formValue = this.solicitudForm.value;

        const request: CrearSolicitudRequest = {
            descripcion: formValue.descripcion,
            tipoSolicitud: formValue.tipoSolicitud,
            canalOrigen: formValue.canalOrigen,
            solicitanteId: user?.id ?? 0,
            // Solo incluir fechaLimite si el usuario ingresó un valor
            ...(formValue.fechaLimite ? { fechaLimite: new Date(formValue.fechaLimite) } : {})
        };

        this.solicitudService.crearSolicitud(request).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
                setTimeout(() => {
                    this.router.navigate(['/app/solicitudes']);
                }, 1500);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage =
                    err.error?.message
                    ?? err.error?.error
                    ?? 'No se pudo crear la solicitud. Verifica tu conexión con el servidor.';
            }
        });
    }
}