/**
 * Utilidad para lectura de archivos JSON desde la carpeta /data
 *
 * Decisiones de diseño:
 * 1. Función genérica readJson<T>() para type-safety total al parsear JSON
 * 2. Usa fs (File System) de Node.js — SOLO en servidor (API routes, Server Components)
 * 3. Manejo de errores: intenta lectura, si falla lanza Error con contexto
 * 4. No cache: cada lectura es fresca desde disco (útil en desarrollo, considerar cache en producción)
 * 5. path.join() asegura rutas multiplataforma (Windows, Linux, macOS)
 *
 * ¿Por qué readJson<T>() es "solo servidor"?
 * - fs.readFileSync es una API de Node.js que NO existe en navegadores (browsers)
 * - Los Client Components (usados en navegadores) no pueden importar modules que usen fs
 * - Si un Client Component intenta importar este archivo, Next.js lanzará error en build
 * - Solución: acceder a JSON desde:
 *   a) Server Components (componentes default de Next.js)
 *   b) API Routes (next/server)
 *   c) Luego pasar datos vía props o fetch() desde el cliente
 */

import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON desde la carpeta /data y lo tipifica con genéricos
 *
 * @template T - Tipo de la interfaz esperada (ej: AppConfig, HomeData)
 * @param relativePath - Ruta relativa desde /data sin la extensión .json
 *                       Ejemplo: "config" → /data/config.json
 *                       Ejemplo: "pages/home" → /data/pages/home.json
 *
 * @returns Objeto parseado del JSON, tipificado como T
 *
 * @throws Error si el archivo no existe o no puede parsearse como JSON válido
 *
 * @example
 * ```typescript
 * // En un Server Component de Next.js
 * import { readJson } from "@/lib/db/reader";
 * import type { HomeData } from "@/lib/db/types";
 *
 * export default async function HomePage() {
 *   const data = readJson<HomeData>("pages/home");
 *   return <h1>{data.hero.title}</h1>;
 * }
 * ```
 */
export function readJson<T>(relativePath: string): T {
  try {
    // Construir ruta absoluta: /proyecto_1082894414/data/{relativePath}.json
    const filePath = path.join(process.cwd(), "data", `${relativePath}.json`);

    // Leer archivo sincrónico (debe ser en componente servidor o route handler)
    const rawContent = fs.readFileSync(filePath, "utf-8");

    // Parsear JSON y castear al tipo genérico T
    const parsed = JSON.parse(rawContent) as T;

    return parsed;
  } catch (error) {
    // Proporcionar error descriptivo para debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to read JSON from /data/${relativePath}.json: ${errorMessage}`
    );
  }
}
