/**
 * Componente HolaMundo — Página principal elegante con efecto visual
 *
 * Decisiones de diseño UX/UI:
 *
 * 1. FONDO: bg-gray-950 (gris muy oscuro #030712)
 *    Razón: Proporciona contraste máximo para el glow del título.
 *    En paletas oscuras, el fondo casi negro es estándar para efectos luminosos
 *    (ej: landing pages tecnológicas, portafolios dev). Evita cansancio visual.
 *
 * 2. GLOW PRINCIPAL: Tonos indigo/violeta (#6366f1 a #a855f7)
 *    Razón: El gradiente indigo→violeta es psicológicamente asociado con
 *    innovación, tecnología y modernidad. La transición de colores en glowPulse
 *    (3s) crea movimiento sutil sin ser distractor. Hex: convención web estándar.
 *
 * 3. TÍTULO: text-7xl (56px), font-extrabold, tracking-tight
 *    Razón: Tipografía de impacto. Tamaño monumental atrae atención inmediata.
 *    font-extrabold (900) maximiza legibilidad sobre glow. tracking-tight
 *    compacta letras, refuerza sensación de fuerza y urgencia.
 *    La clase glow-text aplica textShadow dinámico (animado por Tailwind).
 *
 * 4. SUBTÍTULO: text-indigo-400, uppercase, tracking-widest
 *    Razón: Indigo-400 (#818cf8) es más claro que título, crea jerarquía.
 *    UPPERCASE + tracking-widest (0.2em) transmite profesionalismo.
 *    Similar a botones "CTA" en landing pages modernas. Espaciado visual
 *    distancia del título, demanda lectura pausada.
 *
 * 5. DESCRIPCIÓN: text-gray-400, max-w-md, leading-relaxed
 *    Razón: Gris más claro para legibilidad en cuerpo de texto.
 *    max-w-md (28rem) limita ancho para lectura cómoda (UX: 60-80 caracteres/línea).
 *    leading-relaxed (1.75) incrementa espacio interlineal, mejora legibilidad
 *    en pantallas pequeñas.
 *
 * 6. BADGE: font-mono, text-xs, text-gray-600, border-top
 *    Razón: Fuente monoespaciada es estándar en tech/dev UI para datos
 *    (ej: código, validaciones). text-xs y gray-600 lo posicionan como
 *    "metadata" / footer. border-top lo aísla visualmente.
 *
 * 7. ANIMACIÓN: animate-{effect} aplicada al <h1>
 *    Razón: El efecto glowPulse (3s infinite) pulsa sutilmente sin bloquear lectura.
 *    fadeIn/slideUp proporcionan variantes para UX más dinámica en futuro.
 *    Las transiciones de keyframes están en tailwind.config.ts.
 *
 * 8. ESPACIADO: space-y-6 distribuye verticalemente componentes
 *    Razón: 24px (space-6) es ritmo vertical en Material Design y Tailwind.
 *    Mantiene proporción aurea y balance visual. Responsive via Tailwind.
 */

import type { HolaMundoProps } from "./HolaMundo.types";

/**
 * Mapa de clases Tailwind para efectos de animación
 * Permite seleccionar dinámicamente la animación al renderizar
 */
const effectClasses: Record<string, string> = {
  "glow-pulse": "animate-glow-pulse",
  "fade-in": "animate-fade-in",
  "slide-up": "animate-slide-up",
};

export default function HolaMundo({
  title,
  subtitle,
  description,
  effect = "glow-pulse",
}: HolaMundoProps) {
  const animationClass = effectClasses[effect] ?? "animate-glow-pulse";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white px-6">
      <div className="text-center space-y-6">
        {/* Título principal con efecto de glow pulsante */}
        <h1 className={`text-7xl font-extrabold tracking-tight glow-text ${animationClass}`}>
          {title}
        </h1>

        {/* Subtítulo: tecnologías y branding */}
        <p className="text-xl font-medium text-indigo-400 tracking-widest uppercase">
          {subtitle}
        </p>

        {/* Descripción: contexto y valor */}
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        {/* Badge: validación técnica */}
        <div className="pt-4 border-t border-gray-800">
          <span className="inline-block text-xs text-gray-600 font-mono tracking-wide">
            ✓ TypeScript &nbsp;·&nbsp; ✓ Next.js &nbsp;·&nbsp; ✓ Vercel &nbsp;·&nbsp; ✓ JSON DB
          </span>
        </div>
      </div>
    </main>
  );
}
