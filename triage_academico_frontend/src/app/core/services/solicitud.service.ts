import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAcademica, CrearSolicitudRequest, ClasificarSolicitudRequest } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {

    private readonly API_URL = `${environment.apiUrl}/solicitudes`;

    constructor(private http: HttpClient) { }

    crearSolicitud(request: CrearSolicitudRequest): Observable<SolicitudAcademica> {
        return this.http.post<SolicitudAcademica>(this.API_URL, request);
    }

    getAllSolicitudes(): Observable<SolicitudAcademica[]> {
        return this.http.get<SolicitudAcademica[]>(this.API_URL);
    }

    getSolicitudById(id: number): Observable<SolicitudAcademica> {
        return this.http.get<SolicitudAcademica>(`${this.API_URL}/${id}`);
    }

    clasificarSolicitud(id: number, request: ClasificarSolicitudRequest): Observable<SolicitudAcademica> {
        return this.http.patch<SolicitudAcademica>(`${this.API_URL}/${id}/clasificar`, request);
    }

    asignarResponsable(id: number, responsableId: number): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}/asignar`, { responsableId });
    }

    atenderSolicitud(id: number, observaciones: string): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}/atender`, { observaciones });
    }

    cerrarSolicitud(id: number, observaciones: string): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}/cerrar`, { observaciones });
    }
}