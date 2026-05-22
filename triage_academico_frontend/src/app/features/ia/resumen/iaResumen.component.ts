import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IAService, ResumenRequest } from '@core/services/ia.service';
import { ResumenIA } from '@models';

@Component({
    selector: 'app-ia-resumen',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './iaResumen.component.html',
    styleUrls: ['./iaResumen.component.scss']
})
export class IAResumenComponent {

    resumenForm: FormGroup;
    loading = false;
    resumen: ResumenIA | null = null;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private iaService: IAService
    ) {
        this.resumenForm = this.fb.group({
            solicitudId: ['', [Validators.required, Validators.min(1)]]
        });
    }

    generarResumen(): void {
        if (this.resumenForm.invalid) return;

        this.loading = true;
        this.errorMessage = '';
        this.resumen = null;

        const request: ResumenRequest = {
            solicitudId: Number(this.resumenForm.value.solicitudId)
        };

        this.iaService.generarResumen(request).subscribe({
            next: (data) => {
                this.resumen = data;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudo generar el resumen de IA.';
                this.loading = false;
            }
        });
    }

    limpiar(): void {
        this.resumenForm.reset();
        this.resumen = null;
        this.errorMessage = '';
    }
}
