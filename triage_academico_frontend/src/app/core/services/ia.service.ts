import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SugerenciaIA, SugerenciaClasificacionResponse, ResumenIA } from '@models';
import { environment } from '@env';

export interface SugerenciaRequest {
    solicitudId?: number;
    descripcion: string;
}

export interface ResumenRequest {
    solicitudId: number;
}

@Injectable({ providedIn: 'root' })
export class IAService {

    private readonly API_URL = `${environment.apiUrl}/api/ia`;

    constructor(private http: HttpClient) { }

    // POST /api/ia/sugerir-clasificacion
    sugerirClasificacion(solicitudId: number, descripcion: string): Observable<SugerenciaClasificacionResponse> {
        return this.http.post<SugerenciaClasificacionResponse>(`${this.API_URL}/sugerir-clasificacion`, {
            solicitudId,
            descripcion
        });
    }

    obtenerSugerencia(request: SugerenciaRequest): Observable<SugerenciaClasificacionResponse> {
        return this.http.post<SugerenciaClasificacionResponse>(`${this.API_URL}/sugerir-clasificacion`, {
            solicitudId: request.solicitudId,
            descripcion: request.descripcion
        });
    }

    // GET /api/ia/resumen/:solicitudId
    generarResumen(solicitudId: number): Observable<ResumenIA> {
        return this.http.get<ResumenIA>(`${this.API_URL}/resumen/${solicitudId}`);
    }
}
