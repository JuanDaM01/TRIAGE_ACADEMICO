import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    ResumenIA,
    SugerenciaClasificacionResponse,
    SugerenciaIA
} from '@models';

import { environment } from '@env';

export interface SugerenciaRequest {
    solicitudId?: number;
    descripcion: string;
}

export interface ResumenResponse extends ResumenIA {
    solicitudId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class IAService {

    private readonly API_URL = `${environment.apiUrl}/api/ia`;

    constructor(private readonly http: HttpClient) { }

    sugerirClasificacion(
        solicitudId: number,
        descripcion: string
    ): Observable<SugerenciaClasificacionResponse> {
        return this.http.post<SugerenciaClasificacionResponse>(
            `${this.API_URL}/sugerir-clasificacion`,
            {
                solicitudId,
                descripcion
            }
        );
    }

    obtenerSugerencia(request: SugerenciaRequest): Observable<SugerenciaIA> {
        return this.http.post<SugerenciaIA>(
            `${this.API_URL}/sugerir-clasificacion`,
            {
                solicitudId: request.solicitudId,
                descripcion: request.descripcion
            }
        );
    }

    generarResumen(solicitudId: number): Observable<ResumenResponse> {
        return this.http.get<ResumenResponse>(
            `${this.API_URL}/resumen/${solicitudId}`
        );
    }
}