# Plan de Infraestructura — Sistema Fullstack TypeScript
> Arquitectura: Next.js · GitHub · Vercel · JSON como Base de Datos

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Repositorio](#3-estructura-del-repositorio)
4. [Capa de Datos — JSON como Base de Datos](#4-capa-de-datos--json-como-base-de-datos)
5. [Arquitectura de la Aplicación](#5-arquitectura-de-la-aplicación)
6. [Configuración del Entorno](#6-configuración-del-entorno)
7. [Integración GitHub + Vercel](#7-integración-github--vercel)
8. [Implementación del Home — Hola Mundo](#8-implementación-del-home--hola-mundo)
9. [Validación de TypeScript](#9-validación-de-typescript)
10. [Pipeline de Despliegue](#10-pipeline-de-despliegue)
11. [Checklist de Entrega](#11-checklist-de-entrega)

---

## 1. Visión General

Este documento define la infraestructura completa para un sistema **fullstack en TypeScript** que utiliza:

- **Next.js 14 (App Router)** como framework fullstack unificado (frontend + API routes).
- **GitHub** como repositorio de código fuente.
- **Vercel** como plataforma de despliegue continuo, vinculada al repositorio.
- **Archivos JSON** dentro de la carpeta `/data` como sistema de persistencia, sin base de datos convencional.
- **Home page** con el mensaje "Hola Mundo" centrado y un efecto visual elegante para validar el funcionamiento de TypeScript end-to-end.

### Diagrama de flujo general

```
Developer (local)
      │
      │  git push
      ▼
  GitHub Repo
      │
      │  Webhook automático
      ▼
  Vercel CI/CD
      │
      │  Build + Deploy
      ▼
  Vercel Edge Network
      │
      ├──► Frontend (Next.js Pages / Components)
      │
      └──► API Routes (Next.js) ──► /data/*.json
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión recomendada | Rol |
|---|---|---|---|
| Framework | Next.js | 14.x (App Router) | Frontend + Backend unificado |
| Lenguaje | TypeScript | 5.x | Tipado estático end-to-end |
| Runtime | Node.js | 20.x LTS | Entorno de ejecución |
| Estilos | Tailwind CSS | 3.x | Utilidades CSS, animaciones |
| Linting | ESLint + Prettier | Latest | Calidad y formato de código |
| Control de versiones | Git + GitHub | — | Repositorio remoto |
| Plataforma de deploy | Vercel | — | CI/CD y hosting |
| Persistencia | Archivos JSON | — | Capa de datos sin DB convencional |

### Dependencias del proyecto

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 3. Estructura del Repositorio

```
/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: lint + type-check en cada PR
│
├── data/                           # ← BASE DE DATOS JSON
│   ├── config.json                 # Configuración global de la app
│   └── pages/
│       └── home.json               # Datos del Home (título, subtítulo, efecto)
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout raíz (HTML, body, fuentes)
│   │   ├── page.tsx                # Home page (ruta "/")
│   │   ├── globals.css             # Estilos globales + animaciones
│   │   └── api/
│   │       └── home/
│   │           └── route.ts        # API Route: GET /api/home
│   │
│   ├── components/
│   │   └── HolaMundo/
│   │       ├── HolaMundo.tsx       # Componente principal
│   │       └── HolaMundo.types.ts  # Tipos TypeScript del componente
│   │
│   ├── lib/
│   │   └── db/
│   │       ├── reader.ts           # Utilidad para leer archivos JSON
│   │       └── types.ts            # Tipos globales de la capa de datos
│   │
│   └── types/
│       └── global.d.ts             # Declaraciones de tipos globales
│
├── public/                         # Assets estáticos
│
├── .env.local                      # Variables de entorno locales (no commitear)
├── .env.example                    # Plantilla de variables de entorno
├── .eslintrc.json                  # Configuración ESLint
├── .prettierrc                     # Configuración Prettier
├── .gitignore
├── next.config.ts                  # Configuración Next.js en TypeScript
├── tailwind.config.ts              # Configuración Tailwind en TypeScript
├── tsconfig.json                   # Configuración TypeScript
├── postcss.config.js
└── package.json
```

---

## 4. Capa de Datos — JSON como Base de Datos

La carpeta `/data` actúa como sistema de persistencia. Las API Routes de Next.js leen estos archivos en tiempo de build o en runtime usando el módulo `fs` de Node.js.

### 4.1 Archivo `data/config.json`

```json
{
  "app": {
    "name": "Mi App Fullstack TS",
    "version": "1.0.0",
    "locale": "es-CO",
    "theme": "dark"
  }
}
```

### 4.2 Archivo `data/pages/home.json`

```json
{
  "hero": {
    "title": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "description": "Sistema fullstack funcionando correctamente.",
    "effect": "glow-pulse"
  }
}
```

### 4.3 Utilidad de lectura — `src/lib/db/reader.ts`

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON desde la carpeta /data y lo tipifica.
 * @param relativePath - Ruta relativa desde la raíz del proyecto, ej: "pages/home"
 */
export function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), "data", `${relativePath}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
```

### 4.4 Tipos de datos — `src/lib/db/types.ts`

```typescript
export interface AppConfig {
  app: {
    name: string;
    version: string;
    locale: string;
    theme: "light" | "dark";
  };
}

export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    effect: string;
  };
}
```

> **Regla de arquitectura:** Los archivos JSON en `/data` **nunca se escriben desde el cliente**. Son de solo lectura en runtime. Modificaciones al contenido se hacen mediante commit al repositorio, lo que desencadena un nuevo despliegue en Vercel.

---

## 5. Arquitectura de la Aplicación

### 5.1 API Route — `src/app/api/home/route.ts`

```typescript
import { NextResponse } from "next/server";
import { readJson } from "@/lib/db/reader";
import type { HomeData } from "@/lib/db/types";

export async function GET() {
  try {
    const data = readJson<HomeData>("pages/home");
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar la información del Home." },
      { status: 500 }
    );
  }
}
```

### 5.2 Tipos del componente — `src/components/HolaMundo/HolaMundo.types.ts`

```typescript
export interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
  effect?: "glow-pulse" | "fade-in" | "slide-up";
}
```

### 5.3 Componente — `src/components/HolaMundo/HolaMundo.tsx`

```tsx
import type { HolaMundoProps } from "./HolaMundo.types";

export default function HolaMundo({
  title,
  subtitle,
  description,
  effect = "glow-pulse",
}: HolaMundoProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white px-6">
      <div className={`text-center space-y-6 animate-${effect}`}>
        <h1 className="text-7xl font-extrabold tracking-tight glow-text">
          {title}
        </h1>
        <p className="text-xl font-medium text-indigo-400 tracking-widest uppercase">
          {subtitle}
        </p>
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        <span className="inline-block mt-4 text-xs text-gray-600 font-mono">
          ✓ TypeScript · ✓ Next.js · ✓ Vercel · ✓ JSON DB
        </span>
      </div>
    </main>
  );
}
```

### 5.4 Home page — `src/app/page.tsx`

```tsx
import HolaMundo from "@/components/HolaMundo/HolaMundo";
import { readJson } from "@/lib/db/reader";
import type { HomeData } from "@/lib/db/types";

// Server Component: lee el JSON en el servidor, sin llamada HTTP
export default function HomePage() {
  const { hero } = readJson<HomeData>("pages/home");

  return (
    <HolaMundo
      title={hero.title}
      subtitle={hero.subtitle}
      description={hero.description}
      effect={hero.effect as "glow-pulse"}
    />
  );
}
```

---

## 6. Configuración del Entorno

### 6.1 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6.2 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Activa la validación de tipos en el build de producción
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

### 6.3 `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 1.5s ease forwards",
        "slide-up": "slideUp 1s ease forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { textShadow: "0 0 20px #6366f1, 0 0 60px #6366f1" },
          "50%": { textShadow: "0 0 60px #a855f7, 0 0 120px #a855f7" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 6.4 `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glow-text {
    text-shadow: 0 0 30px #6366f1, 0 0 80px #6366f1;
  }
}
```

### 6.5 `.env.example`

```bash
# Copiar como .env.local para desarrollo
NEXT_PUBLIC_APP_ENV=development
```

---

## 7. Integración GitHub + Vercel

### 7.1 Vinculación del repositorio

1. Crear repositorio en GitHub (ej: `mi-app-fullstack-ts`).
2. Ingresar a [vercel.com](https://vercel.com) → **New Project**.
3. Seleccionar **Import from GitHub** y autorizar acceso al repositorio.
4. Vercel detecta automáticamente Next.js y configura el build.
5. Hacer clic en **Deploy**.

### 7.2 Configuración de Vercel (Dashboard)

| Parámetro | Valor |
|---|---|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### 7.3 Variables de entorno en Vercel

Desde **Settings → Environment Variables** agregar:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_APP_ENV` | `preview` | Preview |

### 7.4 Flujo de despliegue automático

```
git push origin main
        │
        ▼
  GitHub Webhook ──► Vercel recibe el evento
        │
        ▼
  Vercel Build:
    npm install
    tsc --noEmit       (type check)
    next build         (build optimizado)
        │
        ▼
  Deploy a producción ──► URL pública activa
```

- **Rama `main`** → Despliegue a producción.
- **Otras ramas / PRs** → Preview URL única por deploy.

---

## 8. Implementación del Home — Hola Mundo

### Resultado esperado en el navegador

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│              ✦ Hola Mundo ✦                         │
│         (texto con efecto glow pulsante)            │
│                                                     │
│         TYPESCRIPT · NEXT.JS · VERCEL               │
│                                                     │
│    Sistema fullstack funcionando correctamente.     │
│                                                     │
│    ✓ TypeScript · ✓ Next.js · ✓ Vercel · ✓ JSON DB │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Fondo: `#030712` (gris oscuro casi negro)
- Texto principal: blanco con glow indigo/violeta pulsante
- Subtítulo: `indigo-400` con letras espaciadas en mayúsculas
- Descripción: `gray-400`
- Badge inferior: `gray-600` en fuente monoespaciada

### Efecto `glow-pulse`

El efecto se logra con `@keyframes` en Tailwind que oscila el `text-shadow` entre índigo y violeta cada 3 segundos, generando un halo luminoso que "respira".

---

## 9. Validación de TypeScript

### 9.1 Scripts en `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

### 9.2 GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI — Type Check & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint
```

### 9.3 Puntos de validación TypeScript

| Punto | Qué valida |
|---|---|
| `tsconfig.json` con `strict: true` | Tipado estricto en toda la base de código |
| `readJson<T>()` con genéricos | La capa de datos devuelve el tipo correcto |
| `HolaMundoProps` como interfaz | El componente recibe solo props válidas |
| `next.config.ts` en TypeScript | La configuración misma está tipada |
| `tailwind.config.ts` en TypeScript | Configuración de estilos tipada |
| `route.ts` con `NextResponse` | Las API Routes tienen tipos correctos |
| CI en GitHub Actions | `tsc --noEmit` bloquea merges con errores de tipos |

---

## 10. Pipeline de Despliegue

### Flujo completo desde desarrollo hasta producción

```
[ Local Dev ]
    ├── npm run dev         → http://localhost:3000
    ├── npm run type-check  → Valida tipos
    └── npm run lint        → Valida estilo de código
          │
          │ git commit + git push
          ▼
[ GitHub ]
    ├── GitHub Actions CI
    │       ├── type-check ✓
    │       └── lint ✓
    └── Rama main → trigger Vercel
          │
          ▼
[ Vercel ]
    ├── npm install
    ├── next build (incluye tsc)
    └── Deploy
          │
          ▼
[ Producción ]
    └── https://mi-app.vercel.app
```

### Ambientes

| Ambiente | Trigger | URL |
|---|---|---|
| Local | `npm run dev` | `http://localhost:3000` |
| Preview | Push a rama feature | `https://mi-app-git-feature.vercel.app` |
| Producción | Push / merge a `main` | `https://mi-app.vercel.app` |

---

## 11. Checklist de Entrega

### Fase 1 — Repositorio y configuración base

- [ ] Repositorio creado en GitHub con rama `main` protegida
- [ ] `package.json` con todas las dependencias
- [ ] `tsconfig.json` con `strict: true`
- [ ] `.eslintrc.json` y `.prettierrc` configurados
- [ ] `.gitignore` que excluye `node_modules`, `.next`, `.env.local`
- [ ] `.env.example` documentado

### Fase 2 — Capa de datos JSON

- [ ] Carpeta `/data` creada en la raíz del proyecto
- [ ] `data/config.json` con configuración global
- [ ] `data/pages/home.json` con datos del Home
- [ ] `src/lib/db/reader.ts` implementado con genéricos TypeScript
- [ ] `src/lib/db/types.ts` con interfaces tipadas

### Fase 3 — Aplicación Next.js

- [ ] `src/app/layout.tsx` con configuración de fuentes y metadatos
- [ ] `src/app/globals.css` con animaciones CSS
- [ ] `tailwind.config.ts` con keyframes personalizados
- [ ] `src/components/HolaMundo/HolaMundo.types.ts` definido
- [ ] `src/components/HolaMundo/HolaMundo.tsx` implementado
- [ ] `src/app/page.tsx` leyendo desde JSON y renderizando el componente
- [ ] `src/app/api/home/route.ts` exponiendo los datos del Home

### Fase 4 — Despliegue

- [ ] Proyecto vinculado a Vercel desde el repositorio GitHub
- [ ] Variables de entorno configuradas en el dashboard de Vercel
- [ ] Primer deploy exitoso en producción
- [ ] URL de producción validada en el navegador

### Fase 5 — CI/CD y validación TypeScript

- [ ] `.github/workflows/ci.yml` creado
- [ ] GitHub Actions ejecuta `type-check` y `lint` en cada PR
- [ ] `npm run build` local sin errores de TypeScript
- [ ] Efecto visual "Hola Mundo" visible y funcionando en producción

---

## Notas finales del arquitecto

> **Escalabilidad de la capa JSON:** Este patrón es ideal para contenido estático o semi-estático (configuración, textos, catálogos pequeños). Si en el futuro se requiere escritura desde el cliente o volúmenes mayores de datos, la migración natural sería hacia **Vercel KV** (Redis), **PlanetScale** (MySQL serverless) o **Supabase** (PostgreSQL), manteniendo la misma estructura de API Routes de Next.js.

> **Seguridad:** Los archivos JSON en `/data` son accesibles desde el servidor únicamente. El cliente nunca lee el filesystem directamente — siempre pasa por una API Route o un Server Component, lo que garantiza control total sobre qué datos se exponen.

> **TypeScript end-to-end:** La combinación de `tsconfig.json` con `strict: true`, tipos explícitos en la capa de datos, props tipadas en componentes y `ignoreBuildErrors: false` en `next.config.ts` garantiza que ningún error de tipos llegue a producción.

---

*Documento generado como plan de infraestructura — Versión 1.0.0*
