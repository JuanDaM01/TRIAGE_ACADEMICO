import { Rol } from './enums/rol.enum';

export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: Rol;
    activo: boolean;
    fechaCreacion?: Date;
}

export interface UsuarioRegistro {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: Rol;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: Usuario;
}