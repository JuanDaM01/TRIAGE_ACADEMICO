# Arquitectura de Vistas por Rol - Triage Académico

## 🎯 Definición Clara de Roles y Responsabilidades

### 1️⃣ ESTUDIANTE
**Propósito**: Crear solicitudes académicas, consultar su estado y ver historial.

| Acción | Permitido |
|--------|-----------|
| Crear solicitud | ✅ |
| Ver sus solicitudes | ✅ |
| Atender solicitudes | ❌ |
| Clasificar | ❌ |
| Gestionar usuarios | ❌ |

**Navegación Permitida**:
- `/solicitudes` - Lista de solicitudes propias
- `/solicitudes/crear` - Formulario para crear
- `/solicitudes/:id` - Detalle de su solicitud
- `/solicitudes/historial/:id` - Historial de su solicitud

**Landing Page**: `/solicitudes` (NO dashboard)
**Menú Principal**:
  - Mis Solicitudes
  - Nueva Solicitud
  - Historial
  - Asistencia IA (solo lectura/sugerencias)

---

### 2️⃣ DOCENTE
**Propósito**: Consultar solicitudes de su área, atender las que correspondan.

| Acción | Permitido |
|--------|-----------|
| Crear solicitud | ✅ |
| Ver todas las solicitudes | ✅ |
| Atender solicitudes (asignadas) | ✅ |
| Clasificar | ❌ |
| Gestionar usuarios | ❌ |

**Navegación Permitida**:
- `/dashboard` - Vista resumida con solicitudes asignadas
- `/solicitudes` - Lista de todas
- `/solicitudes/:id` - Detalle con opción de atender
- `/solicitudes/crear` - Crear una solicitud

**Landing Page**: `/dashboard`
**Menú Principal**:
  - Dashboard
  - Solicitudes
  - Crear Solicitud
  - Asistencia IA

---

### 3️⃣ ADMINISTRATIVO
**Propósito**: Clasificar, priorizar, atender y cerrar solicitudes.

| Acción | Permitido |
|--------|-----------|
| Ver todas las solicitudes | ✅ |
| Clasificar solicitud | ✅ |
| Priorizar solicitud | ✅ |
| Atender | ✅ |
| Cerrar | ✅ |
| Gestionar usuarios | ❌ |

**Navegación Permitida**:
- `/dashboard` - Panel de control
- `/solicitudes` - Lista con filtros
- `/solicitudes/:id` - Detalle con acciones de triage
- `/solicitudes/crear` - Crear solicitud

**Landing Page**: `/dashboard`
**Menú Principal**:
  - Dashboard
  - Solicitudes
  - Crear Solicitud
  - Asistencia IA

---

### 4️⃣ COORDINADOR
**Propósito**: Supervisar, asignar responsables, ver estadísticas.

| Acción | Permitido |
|--------|-----------|
| Ver todas las solicitudes | ✅ |
| Asignar responsables | ✅ |
| Ver estadísticas | ✅ |
| Gestionar usuarios | ✅ |
| Atender | ✅ |

**Navegación Permitida**:
- `/dashboard` - Panel con estadísticas
- `/solicitudes` - Lista con filtros avanzados
- `/solicitudes/:id` - Detalle con todas las opciones
- `/usuarios` - Gestión de usuarios
- `/solicitudes/crear` - Crear solicitud

**Landing Page**: `/dashboard`
**Menú Principal**:
  - Dashboard
  - Solicitudes
  - Crear Solicitud
  - Administración → Gestión de Usuarios
  - Asistencia IA

---

### 5️⃣ DIRECTOR
**Propósito**: Acceso total, supervisión completa, gestión del sistema.

| Acción | Permitido |
|--------|-----------|
| Todo | ✅ |

**Navegación Permitida**:
- Todas las vistas

**Landing Page**: `/dashboard`
**Menú Principal**:
  - Dashboard
  - Solicitudes
  - Crear Solicitud
  - Administración → Gestión de Usuarios
  - Asistencia IA

---

## 📋 Componentes y Rutas Coherentes

### Rutas Base
```
/dashboard
  ├─ DOCENTE: ✅ (mis solicitudes asignadas + resumen)
  ├─ ESTUDIANTE: ❌ → Redirige a /solicitudes
  ├─ ADMINISTRATIVO: ✅
  ├─ COORDINADOR: ✅
  └─ DIRECTOR: ✅

/solicitudes
  ├─ Lista: ✅ TODOS
  ├─ Crear: ✅ TODOS (pero vuelve al lugar correcto)
  ├─ Detalle: ✅ TODOS
  ├─ Historial: ✅ TODOS

/solicitudes/crear
  → Botón "Volver" = Vuelve a /solicitudes (NO hardcoded a /dashboard)

/usuarios
  ├─ COORDINADOR: ✅
  ├─ DIRECTOR: ✅
  └─ OTROS: ❌

/ia/sugerencia
  ├─ TODOS: ✅ (lectura)
```

---

## 🔄 Cambios Necesarios

### 1. Componente: `solicitud-crear`
**Actual**: Botón "Volver al Dashboard" (⚠️ INCORRECTO)
**Debe ser**: Botón "Volver a Solicitudes" → navega a `/solicitudes`

### 2. Componente: `main-layout`
**Actual**: Menú genérico con Dashboard para todos
**Debe ser**: Menú contextual por rol
- ESTUDIANTE: Ocultar Dashboard, mostrar solo Solicitudes e IA
- DOCENTE/ADMINISTRATIVO/COORDINADOR/DIRECTOR: Mostrar Dashboard
- COORDINADOR/DIRECTOR: Mostrar Administración

### 3. Componente: `dashboard`
**Actual**: Usa Vista "Glassmorphism" compleja
**Debe ser**: 
- **DOCENTE**: Vista ligera con mis solicitudes asignadas
- **ADMINISTRATIVO**: Vista de triaging con solicitudes pendientes
- **COORDINADOR**: Vista con estadísticas + asignaciones
- **DIRECTOR**: Vista completa con todo

### 4. Componente: `solicitudes/lista`
**Actual**: Lista genérica
**Debe tener**:
- ESTUDIANTE: Filtro automático a sus solicitudes
- DOCENTE: Opciones de atender
- ADMINISTRATIVO: Opciones de clasificar/priorizar/cerrar
- COORDINADOR/DIRECTOR: Todas las opciones

---

## ✅ Checklist de Coherencia

- [ ] Botones de "Volver" van al lugar correcto
- [ ] ESTUDIANTE no ve referencias a Dashboard
- [ ] Dashboard solo en rutas de DOCENTE, ADMINISTRATIVO, COORDINADOR, DIRECTOR
- [ ] Menú se adapta al rol del usuario
- [ ] Rutas protegidas con roleGuard correcto
- [ ] No hay funcionalidades ocultas en UI (si no puedes ver, no accedes)
