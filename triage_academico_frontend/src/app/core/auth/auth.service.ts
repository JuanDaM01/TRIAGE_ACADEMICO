import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Usuario, UsuarioRegistro } from '.././models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly API_URL = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('usuario', JSON.stringify(response.usuario));
                this.currentUserSubject.next(response.usuario);
            })
        );
    }

    registro(usuario: UsuarioRegistro): Observable<any> {
        return this.http.post(`${this.API_URL}/registro`, usuario);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.currentUserSubject.next(null);
    }

    private loadUserFromStorage(): void {
        const usuarioStr = localStorage.getItem('usuario');
        if (usuarioStr) {
            this.currentUserSubject.next(JSON.parse(usuarioStr));
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): Usuario | null {
        return this.currentUserSubject.value;
    }

    hasRole(rol: string): boolean {
        const user = this.getCurrentUser();
        return user?.rol === rol;
    }
}