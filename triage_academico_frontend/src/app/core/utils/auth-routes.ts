import { Rol } from '@models';

export function getDefaultAppRoute(rol?: Rol | string | null): string {
    if (rol === Rol.ESTUDIANTE) {
        return '/app/solicitudes';
    }
    return '/app/dashboard';
}
