import { Rol } from '.././models';

export const ROLES = {
    ESTUDIANTE: Rol.ESTUDIANTE,
    DOCENTE: Rol.DOCENTE,
    ADMINISTRATIVO: Rol.ADMINISTRATIVO,
    COORDINADOR: Rol.COORDINADOR,
    DIRECTOR: Rol.DIRECTOR,
} as const;

export const ROLES_ARRAY = Object.values(ROLES);

export const ROLE_LABELS: Record<Rol, string> = {
    [Rol.ESTUDIANTE]: 'Estudiante',
    [Rol.DOCENTE]: 'Docente',
    [Rol.ADMINISTRATIVO]: 'Administrativo',
    [Rol.COORDINADOR]: 'Coordinador',
    [Rol.DIRECTOR]: 'Director',
};