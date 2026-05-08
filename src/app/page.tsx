/**
 * Home Page — Server Component
 *
 * Este componente ejecuta en el servidor durante renderizado.
 * Lee los datos JSON desde /data/pages/home.json usando readJson<T>()
 * y pasa props tipadas al componente HolaMundo.
 *
 * Ventajas de este patrón:
 * 1. Sin llamada HTTP innecesaria (mejora performance)
 * 2. Datos disponibles en el primer render (SSR)
 * 3. TypeScript valida en compilación que HomeData cumple el contrato
 * 4. El cliente solo recibe HTML renderizado + CSS/JS mínimo
 */

import HolaMundo from "@/components/HolaMundo/HolaMundo";
import { readJson } from "@/lib/db/reader";
import type { HomeData } from "@/lib/db/types";
import type { EffectType } from "@/components/HolaMundo/HolaMundo.types";

// Server Component: lee el JSON en el servidor sin llamada HTTP
export default function HomePage() {
  const { hero } = readJson<HomeData>("pages/home");

  return (
    <HolaMundo
      title={hero.title}
      subtitle={hero.subtitle}
      description={hero.description}
      effect={hero.effect as EffectType}
    />
  );
}

