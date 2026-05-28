# Cambios Landing - Tema Claro + Glassmorphism

**Fecha:** 28 de mayo de 2026  
**Componente:** `landing.component.html`  
**Objetivo:** Alinear el landing con la paleta de diseño Tailwind + glassmorphism del resto de la aplicación

## Resumen de Cambios

Se transformó el landing de un **tema oscuro puro** a un **tema claro con glassmorphism**, manteniendo consistencia visual con el resto de la plataforma.

---

## Cambios Implementados

### 1. **Background Principal**
- **Antes:** Gradiente oscuro (`from-slate-950 via-[#0f1419] to-[#1a1f2e]`)
- **Ahora:** Gradiente claro (`from-[#f6faf9] via-[#f0f4f3] to-[#ffffff]`)
- **Color de texto base:** `text-[#181c1c]` (on-surface)

### 2. **Navigation Bar**
- **Efecto glassmorphism:** `bg-white/60 backdrop-blur-xl`
- **Modo oscuro:** `dark:bg-slate-950/90` (para usuarios que prefieran dark mode)
- **Borde:** Cambiado a `border-[#bec9c5]/20` (outline-variant claro)
- **Botones:** Con colores primarios `bg-[#004f45]/10` y bordes sutiles

### 3. **Sección Hero**
- **Gradiente de decoración:** Más sutil (`bg-[#004f45]/5` y `bg-[#84d5c5]/5`)
- **Títulos:** Color oscuro principal `text-[#181c1c]`
- **Subtítulos:** Color gris neutral `text-[#3e4946]`
- **Botones:** 
  - Primario: Gradiente de marca (sin cambios)
  - Secundario: `bg-white/50 hover:bg-white/70` con borde claro

### 4. **Feature Cards**
- **Glassmorphism mejorado:**
  ```css
  bg-white/60 dark:bg-white/5 
  border border-white/60 dark:border-white/10 
  backdrop-blur-lg
  ```
- **Hover effect:** Cambia a `bg-white/80` y borde turquesa `border-[#84d5c5]/50`
- **Sombra sutil:** `hover:shadow-md`
- **Textos:** Colores oscuros para mejor legibilidad en fondo claro

### 5. **Role Cards**
- **Glassmorphism:** `bg-white/60 backdrop-blur-lg`
- **Dark mode:** Mantiene gradientes de color por rol
- **Bordes:** Blancos translúcidos `border-white/60`
- **Hover:** `border-[#004f45]/30` para indicar interacción

### 6. **CTA Section (Call-To-Action)**
- **Card:** `bg-white/60 backdrop-blur-xl` con sombra elevada
- **Dark mode:** Gradiente de marca con overlay oscuro
- **Bordes:** `border-white/70` en light mode, variante en dark
- **Botones:** 
  - Primario: Gradiente de marca (sin cambios)
  - Secundario: `bg-[#004f45]/15` con estados hover mejorados

---

## Paleta de Colores Utilizada

| Elemento | Color | Referencia |
|----------|-------|-----------|
| Primary | `#004f45` | Turquesa oscuro (primary) |
| Accent | `#84d5c5` | Turquesa claro (accent) |
| Surface | `#f6faf9` | Fondo claro |
| On-Surface | `#181c1c` | Texto oscuro |
| On-Surface (subdued) | `#3e4946` | Texto gris |
| Outline | `#bec9c5` | Bordes claros |

---

## Soporte Dark Mode

Todos los componentes incluyen clases `dark:` para mantener la experiencia en modo oscuro:
- Fondos adaptativos
- Bordes adaptativos
- Colores de texto adaptativos
- Gradientes adaptados por rol

---

## Características del Glassmorphism

✅ **Backdrop blur:** `backdrop-blur-xl` / `backdrop-blur-lg`  
✅ **Transparencia:** Fondos con opacidad (40-70%)  
✅ **Bordes:** Blancos translúcidos para profundidad  
✅ **Sombras sutiles:** Para elevación visual  
✅ **Consistencia:** Alineado con el resto de componentes (ej: `iaSugerencia`)  

---

## Beneficios

1. **Coherencia visual:** Landing ahora es consistente con el diseño del dashboard
2. **Legibilidad:** Mejor contraste en modo claro para reducir fatiga ocular
3. **Profesionalismo:** Glassmorphism moderno y pulido
4. **Accesibilidad:** Colores con suficiente contraste según WCAG
5. **Versatilidad:** Funciona en modo claro y oscuro

---

## Testing Recomendado

- [ ] Validar en light mode (navegador)
- [ ] Validar en dark mode (ajuste de SO)
- [ ] Verificar contraste en mobile
- [ ] Probar transiciones y hover effects
- [ ] Validar gradientes en diferentes navegadores

