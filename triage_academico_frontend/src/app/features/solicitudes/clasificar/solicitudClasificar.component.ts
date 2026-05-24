import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { SolicitudAcademica, TipoSolicitud, NivelPrioridad } from '@models';

@Component({
    selector: 'app-solicitud-clasificar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './solicitudClasificar.component.html',
    styleUrls: ['./solicitudClasificar.component.scss']
})
export class SolicitudClasificarComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;
    id: number = 0;
    loadingDetalle = true;
    loadingClasificar = false;
    errorMessage = '';

    clasificarForm: FormGroup;

    readonly tiposSolicitud = Object.values(TipoSolicitud);
    readonly nivelesPrioridad = Object.values(NivelPrioridad);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.clasificarForm = this.fb.group({
            tipoSolicitud: ['', Validators.required],
            nivelPrioridad: ['', Validators.required],
            fechaLimite: ['']
        });
    }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarDetalle();
    }

    cargarDetalle(): void {
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                this.clasificarForm.patchValue({ tipoSolicitud: data.tipoSolicitud });
                this.loadingDetalle = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingDetalle = false;
                this.router.navigate(['/app/solicitudes']);
            }
        });
    }

    clasificarManual(): void {
        if (this.clasificarForm.invalid || !this.solicitud) return;
        this.loadingClasificar = true;
        this.errorMessage = '';

        const { tipoSolicitud, nivelPrioridad, fechaLimite } = this.clasificarForm.value;

        // Obtener la última versión desde el backend antes de enviar la clasificación
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (latest) => {
                const version = latest.version ?? 0;
                this.solicitudService.clasificarSolicitud(this.id, {
                    tipoSolicitud,
                    nivelPrioridad,
                    fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
                    version
                }).subscribe({
                    next: () => {
                        this.loadingClasificar = false;
                        this.router.navigate(['/app/solicitudes', this.id]);
                    },
                    error: (err) => {
                        this.loadingClasificar = false;
                        this.errorMessage = err.error?.message ?? 'No se pudo clasificar la solicitud.';
                        this.cdr.detectChanges();
                    }
                });
            },
            error: () => {
                this.loadingClasificar = false;
                this.errorMessage = 'No se pudo obtener el estado actual de la solicitud. Recarga e intenta de nuevo.';
                this.cdr.detectChanges();
            }
        });
    }

    getNivelColor(nivel: string): string {
        const map: Record<string, string> = {
            CRITICA: 'text-[#93000a] bg-[#fee2e2]',
            ALTA:    'text-[#9a3412] bg-[#ffedd5]',
            MEDIA:   'text-[#0369a1] bg-[#e0f2fe]',
            BAJA:    'text-[#166534] bg-[#dcfce7]'
        };
        return map[nivel] ?? '';
    }

    volver(): void {
        this.router.navigate(['/app/solicitudes', this.id]);
    }
}