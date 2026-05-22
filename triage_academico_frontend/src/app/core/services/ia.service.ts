import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SugerenciaIA, ResumenIA } from '@models';
import { environment } from '@env';

export interface SugerenciaRequest {
    descripcion: string;
}

export interface ResumenRequest {
    solicitudId: number;
}

@Injectable({
    providedIn: 'root'
})
export class IAService {

    private readonly API_URL = `${environment.apiUrl}/api/ia`;

    constructor(private http: HttpClient) { }

    obtenerSugerencia(request: SugerenciaRequest): Observable<SugerenciaIA> {
        return this.http.post<SugerenciaIA>(`${this.API_URL}/sugerir`, request);
    }

    generarResumen(request: ResumenRequest): Observable<ResumenIA> {
        return this.http.post<ResumenIA>(`${this.API_URL}/resumen`, request);
    }

    obtenerResumenSolicitud(solicitudId: number): Observable<ResumenIA> {
        return this.generarResumen({ solicitudId });
    }
}
