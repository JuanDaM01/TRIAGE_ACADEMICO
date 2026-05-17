import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IAService, SugerenciaRequest } from '../../../core/services/ia.service';
import { SugerenciaIA } from '../../../core/models';

@Component({
    selector: 'app-ia-sugerencia',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './iaSugerencia.component.html',
    styleUrls: ['./iaSugerencia.component.scss']
})
export class IASugerenciaComponent {

    sugerenciaForm: FormGroup;
    loading = false;
    sugerencia: SugerenciaIA | null = null;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private iaService: IAService
    ) {
        this.sugerenciaForm = this.fb.group({
            descripcion: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    obtenerSugerencia(): void {
        if (this.sugerenciaForm.invalid) return;

        this.loading = true;
        this.errorMessage = '';
        this.sugerencia = null;

        const request: SugerenciaRequest = {
            descripcion: this.sugerenciaForm.value.descripcion
        };

        this.iaService.obtenerSugerencia(request).subscribe({
            next: (data) => {
                this.sugerencia = data;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'No se pudo obtener la sugerencia de IA.';
                this.loading = false;
            }
        });
    }

    limpiar(): void {
        this.sugerenciaForm.reset();
        this.sugerencia = null;
        this.errorMessage = '';
    }

    getConfianzaColor(): string {
        if (!this.sugerencia) return '#666';
        if (this.sugerencia.confianza >= 0.8) return '#2e7d32';
        if (this.sugerencia.confianza >= 0.6) return '#f57c00';
        return '#d32f2f';
    }
}
