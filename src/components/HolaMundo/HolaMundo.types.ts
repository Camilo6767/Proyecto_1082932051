/**
 * Tipos para el componente HolaMundo
 *
 * EffectType: Union type de animaciones CSS disponibles
 * HolaMundoProps: Props del componente con tipado estricto
 */

export type EffectType = "glow-pulse" | "fade-in" | "slide-up";

export interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
  effect?: EffectType;
}
