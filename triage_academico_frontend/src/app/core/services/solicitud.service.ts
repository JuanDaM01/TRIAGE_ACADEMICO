import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    SolicitudAcademica,
    CrearSolicitudRequest,
    ClasificarSolicitudRequest,
    PageResponse,
    HistorialSolicitud
} from '@models';
import { environment } from '@env';

export interface SolicitudFiltros {
    estado?: string;
    tipoSolicitud?: string;
    nivelPrioridad?: string;
    responsableId?: number;
    page?: number;
    size?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {

    private readonly API_URL = `${environment.apiUrl}/api/solicitudes`;

    constructor(private http: HttpClient) { }

    crearSolicitud(request: CrearSolicitudRequest): Observable<SolicitudAcademica> {
        return this.http.post<SolicitudAcademica>(this.API_URL, request);
    }

    consultarSolicitudes(filtros: SolicitudFiltros = {}): Observable<PageResponse<SolicitudAcademica>> {
        let params = new HttpParams();

        if (filtros.estado) params = params.set('estado', filtros.estado);
        if (filtros.tipoSolicitud) params = params.set('tipoSolicitud', filtros.tipoSolicitud);
        if (filtros.nivelPrioridad) params = params.set('nivelPrioridad', filtros.nivelPrioridad);
        if (filtros.responsableId != null) params = params.set('responsableId', filtros.responsableId);
        params = params.set('page', String(filtros.page ?? 0));
        params = params.set('size', String(filtros.size ?? 20));

        return this.http.get<PageResponse<SolicitudAcademica>>(this.API_URL, { params });
    }

    getAllSolicitudes(): Observable<SolicitudAcademica[]> {
        return this.consultarSolicitudes({ size: 100 }).pipe(
            map(page => page.content)
        );
    }

    getSolicitudById(id: number): Observable<SolicitudAcademica> {
        return this.http.get<SolicitudAcademica>(`${this.API_URL}/${id}`);
    }

    clasificarSolicitud(id: number, request: ClasificarSolicitudRequest): Observable<SolicitudAcademica> {
        return this.http.patch<SolicitudAcademica>(`${this.API_URL}/${id}/clasificar`, request);
    }

    asignarResponsable(id: number, responsableId: number, version: number): Observable<SolicitudAcademica> {
        return this.http.patch<SolicitudAcademica>(`${this.API_URL}/${id}/asignar`, { responsableId: Number(responsableId), version: Number(version) });
    }

    atenderSolicitud(id: number, observacion: string, version: number): Observable<SolicitudAcademica> {
        return this.http.patch<SolicitudAcademica>(`${this.API_URL}/${id}/atender`, { observacion: observacion.trim(), version: Number(version) });
    }

    cerrarSolicitud(id: number, observacionCierre: string, version: number): Observable<SolicitudAcademica> {
        return this.http.patch<SolicitudAcademica>(`${this.API_URL}/${id}/cerrar`, { observacionCierre: observacionCierre.trim(), version: Number(version) });
    }

    getHistorialSolicitud(id: number): Observable<HistorialSolicitud[]> {
        return this.http.get<HistorialSolicitud[]>(`${this.API_URL}/${id}/historial`);
    }
}
