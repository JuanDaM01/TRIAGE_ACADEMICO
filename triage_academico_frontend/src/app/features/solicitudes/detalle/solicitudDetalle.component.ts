import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { SolicitudService } from '@core/services/solicitud.service';
import { AuthService } from '@core/auth/auth.service';
import { SolicitudAcademica, EstadoSolicitud } from '@models';

import { EstadoPipe } from '@shared/pipes/estado.pipe';
import { PrioridadPipe } from '@shared/pipes/prioridad.pipe';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-solicitud-detalle',
    standalone: true,
    imports: [CommonModule, FormsModule, EstadoPipe, PrioridadPipe],
    templateUrl: './solicitudDetalle.component.html',
    styleUrls: ['./solicitudDetalle.component.scss']
})
export class SolicitudDetalleComponent implements OnInit {

    solicitud: SolicitudAcademica | null = null;

    loading = true;
    accionEnProceso = false;

    mensajeExito = '';
    mensajeError = '';

    modalAtenderVisible = false;
    observacionAtencion = '';

    modalEnviarAtencionVisible = false;

    modalCerrarVisible = false;
    observacionCierre = '';

    id = 0;

    readonly EstadoSolicitud = EstadoSolicitud;

    readonly pasosTriage = [
        { key: EstadoSolicitud.REGISTRADA, label: 'Registrada', icon: 'edit_note' },
        { key: EstadoSolicitud.CLASIFICADA, label: 'Clasificada', icon: 'category' },
        { key: EstadoSolicitud.EN_ATENCION, label: 'En atención', icon: 'support_agent' },
        { key: EstadoSolicitud.ATENDIDA, label: 'Atendida', icon: 'task_alt' },
        { key: EstadoSolicitud.CERRADA, label: 'Cerrada', icon: 'lock' }
    ];

    private readonly ORDEN_ESTADOS: EstadoSolicitud[] = [
        EstadoSolicitud.REGISTRADA,
        EstadoSolicitud.CLASIFICADA,
        EstadoSolicitud.EN_ATENCION,
        EstadoSolicitud.ATENDIDA,
        EstadoSolicitud.CERRADA
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private solicitudService: SolicitudService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));

        if (!this.id || Number.isNaN(this.id)) {
            this.router.navigate(['/app/solicitudes']);
            return;
        }

        this.cargarDetalle();
    }

    cargarDetalle(): void {
        this.loading = true;
        this.limpiarMensajes();

        this.solicitudService.getSolicitudById(this.id).subscribe({
            next: (data) => {
                this.solicitud = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.router.navigate(['/app/solicitudes']);
                this.cdr.detectChanges();
            }
        });
    }

    volverALaLista(): void {
        this.router.navigate(['/app/solicitudes']);
    }

    irAClasificarIA(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar-ia']);
    }

    irAClasificarManual(): void {
        this.router.navigate(['/app/solicitudes', this.id, 'clasificar']);
    }

    puedeVerAcciones(): boolean {
        return this.authService.hasRole('ADMINISTRATIVO') ||
            this.authService.hasRole('COORDINADOR') ||
            this.authService.hasRole('DIRECTOR') ||
            this.authService.hasRole('DOCENTE');
    }

    puedeClasificar(): boolean {
        return !!this.solicitud &&
            this.solicitud.estado === EstadoSolicitud.REGISTRADA &&
            (
                this.authService.hasRole('ADMINISTRATIVO') ||
                this.authService.hasRole('COORDINADOR') ||
                this.authService.hasRole('DIRECTOR')
            );
    }

    puedeEnviarAAtencion(): boolean {
        return !!this.solicitud &&
            this.solicitud.estado === EstadoSolicitud.CLASIFICADA &&
            (
                this.authService.hasRole('COORDINADOR') ||
                this.authService.hasRole('DIRECTOR')
            );
    }

    puedeAtender(): boolean {
        return !!this.solicitud &&
            this.solicitud.estado === EstadoSolicitud.EN_ATENCION &&
            (
                this.authService.hasRole('ADMINISTRATIVO') ||
                this.authService.hasRole('COORDINADOR') ||
                this.authService.hasRole('DIRECTOR')
            );
    }

    abrirConfirmacionEnviarAAtencion(): void {
        this.limpiarMensajes();

        if (!this.solicitud?.id) {
            this.mensajeError = 'No fue posible identificar la solicitud seleccionada.';
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.CLASIFICADA) {
            this.mensajeError = 'La solicitud solo puede enviarse a atención cuando está clasificada.';
            return;
        }

        if (!this.authService.getCurrentUser()?.id) {
            this.mensajeError = 'No fue posible identificar el usuario autenticado.';
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'No fue posible validar la versión de la solicitud. Se actualizará la información.';
            this.cargarDetalle();
            return;
        }

        this.modalEnviarAtencionVisible = true;
    }

    cancelarEnvioAAtencion(): void {
        if (this.accionEnProceso) {
            return;
        }

        this.modalEnviarAtencionVisible = false;
    }

    confirmarEnviarAAtencion(): void {
        this.limpiarMensajes();

        const usuarioActual = this.authService.getCurrentUser();

        if (!this.solicitud?.id || !usuarioActual?.id) {
            this.mensajeError = 'No fue posible preparar la asignación de la solicitud.';
            this.modalEnviarAtencionVisible = false;
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.CLASIFICADA) {
            this.mensajeError = 'La solicitud ya no se encuentra en estado clasificada.';
            this.modalEnviarAtencionVisible = false;
            this.cargarDetalle();
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'La solicitud no tiene versión válida para controlar concurrencia.';
            this.modalEnviarAtencionVisible = false;
            this.cargarDetalle();
            return;
        }

        const solicitudId = Number(this.solicitud.id);
        const responsableId = Number(usuarioActual.id);
        const version = Number(this.solicitud.version);

        this.accionEnProceso = true;

        this.solicitudService.asignarResponsable(solicitudId, responsableId, version).subscribe({
            next: (solicitudActualizada) => {
                this.solicitud = solicitudActualizada;
                this.accionEnProceso = false;
                this.modalEnviarAtencionVisible = false;
                this.mensajeExito = 'La solicitud fue enviada a atención correctamente.';
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.accionEnProceso = false;
                this.modalEnviarAtencionVisible = false;
                this.mensajeError = this.obtenerMensajeErrorAsignacion(error);
                this.cdr.detectChanges();
            }
        });
    }

    abrirModalAtender(): void {
        this.limpiarMensajes();

        if (!this.solicitud?.id) {
            this.mensajeError = 'No fue posible identificar la solicitud.';
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.EN_ATENCION) {
            this.mensajeError = 'La solicitud solo puede atenderse cuando está en estado En Atención.';
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'No fue posible validar la versión de la solicitud. Se actualizará la información.';
            this.cargarDetalle();
            return;
        }

        this.observacionAtencion = '';
        this.modalAtenderVisible = true;
    }

    cancelarAtencion(): void {
        if (this.accionEnProceso) {
            return;
        }

        this.modalAtenderVisible = false;
        this.observacionAtencion = '';
    }

    confirmarAtencion(): void {
        this.limpiarMensajes();

        const observacion = this.observacionAtencion.trim();

        if (!observacion) {
            this.mensajeError = 'La observación de atención es obligatoria.';
            return;
        }

        if (!this.solicitud?.id) {
            this.mensajeError = 'No fue posible identificar la solicitud.';
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.EN_ATENCION) {
            this.mensajeError = 'La solicitud ya no se encuentra en estado En Atención.';
            this.modalAtenderVisible = false;
            this.cargarDetalle();
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'No fue posible validar la versión de la solicitud. Se actualizará la información.';
            this.modalAtenderVisible = false;
            this.cargarDetalle();
            return;
        }

        this.accionEnProceso = true;

        this.solicitudService
            .atenderSolicitud(
                Number(this.solicitud.id),
                observacion,
                Number(this.solicitud.version)
            )
            .subscribe({
                next: (solicitudActualizada) => {
                    this.solicitud = solicitudActualizada;
                    this.accionEnProceso = false;
                    this.modalAtenderVisible = false;
                    this.observacionAtencion = '';
                    this.mensajeExito = 'La solicitud fue atendida correctamente.';
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.accionEnProceso = false;
                    this.mensajeError = this.obtenerMensajeErrorProceso(
                        error,
                        'No fue posible atender la solicitud.'
                    );
                    this.cdr.detectChanges();
                }
            });
    }

    puedeCerrar(): boolean {
        return !!this.solicitud &&
            this.solicitud.estado === EstadoSolicitud.ATENDIDA &&
            (
                this.authService.hasRole('ADMINISTRATIVO') ||
                this.authService.hasRole('COORDINADOR') ||
                this.authService.hasRole('DIRECTOR')
            );
    }

    abrirModalCerrar(): void {
        this.limpiarMensajes();

        if (!this.solicitud?.id) {
            this.mensajeError = 'No fue posible identificar la solicitud.';
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.ATENDIDA) {
            this.mensajeError = 'La solicitud solo puede cerrarse cuando está en estado Atendida.';
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'No fue posible validar la versión de la solicitud. Se actualizará la información.';
            this.cargarDetalle();
            return;
        }

        this.observacionCierre = '';
        this.modalCerrarVisible = true;
    }

    cancelarCierre(): void {
        if (this.accionEnProceso) {
            return;
        }

        this.modalCerrarVisible = false;
        this.observacionCierre = '';
    }

    confirmarCierre(): void {
        this.limpiarMensajes();

        const observacion = this.observacionCierre.trim();

        if (!observacion) {
            this.mensajeError = 'La observación de cierre es obligatoria.';
            return;
        }

        if (!this.solicitud?.id) {
            this.mensajeError = 'No fue posible identificar la solicitud.';
            return;
        }

        if (this.solicitud.estado !== EstadoSolicitud.ATENDIDA) {
            this.mensajeError = 'La solicitud ya no se encuentra en estado Atendida.';
            this.modalCerrarVisible = false;
            this.cargarDetalle();
            return;
        }

        if (this.solicitud.version === null || this.solicitud.version === undefined) {
            this.mensajeError = 'No fue posible validar la versión de la solicitud. Se actualizará la información.';
            this.modalCerrarVisible = false;
            this.cargarDetalle();
            return;
        }

        this.accionEnProceso = true;

        this.solicitudService
            .cerrarSolicitud(
                Number(this.solicitud.id),
                observacion,
                Number(this.solicitud.version)
            )
            .subscribe({
                next: (solicitudActualizada) => {
                    this.solicitud = solicitudActualizada;
                    this.accionEnProceso = false;
                    this.modalCerrarVisible = false;
                    this.observacionCierre = '';
                    this.mensajeExito = 'La solicitud fue cerrada correctamente.';
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.accionEnProceso = false;
                    this.mensajeError = this.obtenerMensajeErrorProceso(
                        error,
                        'No fue posible cerrar la solicitud.'
                    );
                    this.cdr.detectChanges();
                }
            });
    }

    private obtenerMensajeErrorProceso(error: any, mensajePorDefecto: string): string {
        const mensajeBackend =
            error?.error?.mensaje ||
            error?.error?.message ||
            error?.error?.error ||
            (typeof error?.error === 'string' ? error.error : '');

        if (error?.status === 400 && error?.error?.errores) {
            const errores = Object.values(error.error.errores);
            return errores.length > 0 ? String(errores[0]) : mensajePorDefecto;
        }

        if (error?.status === 403) {
            return 'No tiene permisos para realizar esta acción.';
        }

        if (error?.status === 409) {
            return 'La solicitud fue modificada por otro usuario. Actualice la página e intente nuevamente.';
        }

        if (error?.status === 500) {
            return 'El servidor no pudo completar la operación. Revise la consola del backend.';
        }

        return mensajeBackend || mensajePorDefecto;
    }

    esEstadoAlcanzado(estadoKey: EstadoSolicitud | string): boolean {
        if (!this.solicitud) {
            return false;
        }

        const idxActual = this.ORDEN_ESTADOS.indexOf(this.solicitud.estado as EstadoSolicitud);
        const idxPaso = this.ORDEN_ESTADOS.indexOf(estadoKey as EstadoSolicitud);

        return idxActual >= 0 && idxPaso >= 0 && idxPaso <= idxActual;
    }

    estadoClass(estado: EstadoSolicitud | string): string {
        return `estado-${String(estado).toLowerCase().replace('_', '-')}`;
    }

    prioridadClass(prioridad: string | undefined): string {
        return prioridad ? `prioridad-${prioridad.toLowerCase()}` : '';
    }

    obtenerResponsableTexto(): string {
        const solicitudExtendida = this.solicitud as any;

        if (solicitudExtendida?.responsableNombre) {
            return `${solicitudExtendida.responsableNombre} ${solicitudExtendida.responsableApellido ?? ''}`.trim();
        }

        if (this.solicitud?.responsable?.nombre) {
            return `${this.solicitud.responsable.nombre} ${this.solicitud.responsable.apellido ?? ''}`.trim();
        }

        return 'Sin responsable asignado';
    }

    obtenerResponsableActualTexto(): string {
        const usuario = this.authService.getCurrentUser();

        if (!usuario) {
            return 'usuario actual';
        }

        return `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() || 'usuario actual';
    }

    trackByPaso(index: number, paso: { key: EstadoSolicitud }): EstadoSolicitud {
        return paso.key;
    }

    private limpiarMensajes(): void {
        this.mensajeExito = '';
        this.mensajeError = '';
    }

    private obtenerMensajeErrorAsignacion(error: any): string {
        const mensajeBackend =
            error?.error?.mensaje ||
            error?.error?.message ||
            error?.error?.error ||
            (typeof error?.error === 'string' ? error.error : '');

        if (error?.status === 403) {
            return 'No tiene permisos para enviar esta solicitud a atención.';
        }

        if (error?.status === 409) {
            return 'La solicitud fue modificada por otro usuario. Actualice la página e intente nuevamente.';
        }

        if (error?.status === 400 && mensajeBackend) {
            return mensajeBackend;
        }

        if (error?.status === 500) {
            return 'El servidor no pudo completar la asignación. Revise el backend: probablemente ocurrió un error interno al guardar la asignación.';
        }

        return mensajeBackend || 'No fue posible enviar la solicitud a atención. Intente nuevamente.';
    }
}