import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Usuario, UsuarioRegistro, PageResponse } from '@models';
import { environment } from '@env';

export interface UsuarioFiltros {
    rol?: string;
    activo?: boolean;
    nombre?: string;
    email?: string;
    page?: number;
    size?: number;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private readonly API_URL = `${environment.apiUrl}/api/usuarios`;

    constructor(private http: HttpClient) { }

    crearUsuario(usuario: UsuarioRegistro): Observable<Usuario> {
        return this.http.post<Usuario>(this.API_URL, usuario);
    }

    consultarUsuarios(filtros: UsuarioFiltros = {}): Observable<PageResponse<Usuario>> {
        let params = new HttpParams();

        if (filtros.rol) params = params.set('rol', filtros.rol);
        if (filtros.activo != null) params = params.set('activo', String(filtros.activo));
        if (filtros.nombre) params = params.set('nombre', filtros.nombre);
        if (filtros.email) params = params.set('email', filtros.email);
        params = params.set('page', String(filtros.page ?? 0));
        params = params.set('size', String(filtros.size ?? 20));

        return this.http.get<PageResponse<Usuario>>(this.API_URL, { params });
    }

    getAllUsuarios(): Observable<Usuario[]> {
        return this.consultarUsuarios({ size: 100 }).pipe(
            map(page => page.content)
        );
    }

    getUsuarioById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.API_URL}/${id}`);
    }

    actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.API_URL}/${id}`, usuario);
    }

    desactivarUsuario(id: number): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.API_URL}/${id}/desactivar`, {});
    }

    activarUsuario(id: number): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.API_URL}/${id}/activar`, {});
    }

    eliminarUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }
}
