# Estructura del frontend — Triage Académico

```
src/app/
├── core/                    # Infraestructura transversal (singletons, layout, seguridad)
│   ├── auth/                # AuthService + barrel
│   ├── guards/              # auth, guest, role
│   ├── interceptors/        # JWT HTTP
│   ├── layout/
│   │   ├── header/          # Barra superior (SRP)
│   │   ├── sidebar/         # Navegación lateral (SRP)
│   │   └── main-layout/     # Shell: compone header + sidebar + outlet
│   ├── constants/           # Constantes de dominio
│   ├── utils/               # Helpers (ej. auth-routes)
│   └── services/            # API HTTP (DIP: features dependen de abstracciones)
├── shared/
│   ├── components/          # UI reutilizable (vacío hasta nuevos widgets)
│   ├── ui/                  # auth-landing-bg, etc.
│   ├── pipes/
│   └── directives/
├── models/                    # Contratos de dominio + enums/
│   └── enums/
└── features/                  # Módulos por pantalla (vertical slices)
    ├── landing/
    ├── login/
    ├── registro/
    ├── dashboard/
    ├── solicitudes/
    │   ├── lista/
    │   ├── crear/
    │   ├── detalle/
    │   └── historial/
    ├── usuarios/
    │   ├── lista/
    │   └── gestion/
    └── ia/
        ├── sugerencia/
        └── resumen/
```

## Alias de importación (`tsconfig.json`)

| Alias | Uso |
|-------|-----|
| `@core/*` | Auth, guards, services, layout |
| `@shared/*` | Pipes, UI compartida |
| `@models` | Interfaces y enums |
| `@features/*` | Pantallas lazy-loaded |
| `@env` | `environment.ts` |

## Principios aplicados

- **SRP**: Header, sidebar y main-layout con responsabilidades separadas.
- **DIP**: Features consumen `AuthService` / `SolicitudService` desde `@core`, no HTTP directo.
- **OCP**: Nuevas features en `features/` sin tocar core.
- **Rutas**: Área autenticada bajo `/app/*` con `MainLayoutComponent`.
