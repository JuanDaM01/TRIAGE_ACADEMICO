import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, TokenResponse, Usuario, UsuarioRegistro } from '@models';
import { environment } from '@env';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private readonly API_URL = `${environment.apiUrl}/api/auth`;

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
    }

    login(credentials: LoginRequest): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap(response => this.persistSession(response))
        );
    }

    registro(usuario: UsuarioRegistro): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/registro`, usuario).pipe(
            tap(response => this.persistSession(response))
        );
    }

    private persistSession(response: TokenResponse): void {
        localStorage.setItem('token', response.token);

        const usuario: Usuario = {
            id: response.id,
            nombre: response.nombre,
            apellido: response.apellido ?? '',
            email: response.email,
            rol: response.rol,
            activo: true
        };

        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.currentUserSubject.next(usuario);
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