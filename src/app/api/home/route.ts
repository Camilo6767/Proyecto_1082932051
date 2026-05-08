/**
 * API Route: GET /api/home
 *
 * Endpoint que expone los datos de la página Home desde /data/pages/home.json
 * Tipado con TypeScript para garantizar que la respuesta cumple HomeData
 *
 * Manejo de errores:
 * - Si readJson() lanza excepción (archivo no encontrado, JSON inválido)
 * - Captura el error y retorna HTTP 500 con mensaje
 */

import { NextResponse } from "next/server";
import { readJson } from "@/lib/db/reader";
import type { HomeData } from "@/lib/db/types";

export async function GET() {
  try {
    const data = readJson<HomeData>("pages/home");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
