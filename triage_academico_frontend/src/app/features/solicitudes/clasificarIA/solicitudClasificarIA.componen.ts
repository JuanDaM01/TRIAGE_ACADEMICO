import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '@core/services/solicitud.service';
import { IAService } from '@core/services/ia.service';
import { SolicitudAcademica } from '@models';
import { SugerenciaClasificacionResponse } from '@models/ia.model';

@Component({
    selector: 'app-solicitud-clasificar-ia',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './solicitudClasificarIA.component.html',
    styleUrls: ['./solicitudClasificarIA.component.scss']
})
export class SolicitudClasificarIAComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;
    id: number = 0;

    loadingDetalle = true;
    loadingIA = false;
    loadingAplicar = false;
    errorMessage = '';

    sugerencia: SugerenciaClasificacionResponse | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        private iaService: IAService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarDetalle();
    }

    cargarDetalle(): void {
        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                this.loadingDetalle = false;
                this.cdr.detectChanges();
                // Solicitar sugerencia de IA automáticamente al cargar
                this.pedirSugerencia();
            },
            error: () => {
                this.loadingDetalle = false;
                this.router.navigate(['/app/solicitudes']);
            }
        });
    }

    pedirSugerencia(): void {
        if (!this.solicitud) return;
        this.loadingIA = true;
        this.sugerencia = null;
        this.errorMessage = '';

        this.iaService.sugerirClasificacion(this.solicitud.id, this.solicitud.descripcion).subscribe({
            next: (s) => {
                this.sugerencia = s;
                this.loadingIA = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingIA = false;
                this.errorMessage = 'No se pudo obtener la sugerencia de la IA.';
                this.cdr.detectChanges();
            }
        });
    }

    aceptar(): void {
        this.loadingAplicar = true;
        this.errorMessage = '';

        this.solicitudService.aplicarSugerencia(this.id).subscribe({
            next: () => {
                this.loadingAplicar = false;
                this.router.navigate(['/app/solicitudes', this.id]);
            },
            error: (err) => {
                this.loadingAplicar = false;
                this.errorMessage = err.error?.message ?? 'No se pudo aplicar la sugerencia.';
                this.cdr.detectChanges();
            }
        });
    }

    rechazar(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar']);
    }

    volver(): void {
        this.router.navigate(['/app/solicitudes', this.id]);
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

    getConfianzaLabel(c: number): string {
        if (c >= 0.8) return 'Alta';
        if (c >= 0.5) return 'Media';
        return 'Baja';
    }

    getConfianzaBarColor(c: number): string {
        if (c >= 0.8) return 'bg-[#004f45]';
        if (c >= 0.5) return 'bg-[#dded49]';
        return 'bg-[#fca5a5]';
    }
}