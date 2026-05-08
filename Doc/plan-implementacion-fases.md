# Plan de Implementación por Fases
> Sistema Fullstack TypeScript · Next.js · GitHub · Vercel · JSON DB

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Fase 0 — Prerrequisitos](#2-fase-0--prerrequisitos)
3. [Fase 1 — Repositorio y Configuración Base](#3-fase-1--repositorio-y-configuración-base)
4. [Fase 2 — Capa de Datos JSON](#4-fase-2--capa-de-datos-json)
5. [Fase 3 — Aplicación Next.js](#5-fase-3--aplicación-nextjs)
6. [Fase 4 — Despliegue GitHub + Vercel](#6-fase-4--despliegue-github--vercel)
7. [Fase 5 — CI/CD y Validación TypeScript](#7-fase-5--cicd-y-validación-typescript)
8. [Cronograma Estimado](#8-cronograma-estimado)
9. [Criterios de Éxito por Fase](#9-criterios-de-éxito-por-fase)
10. [Gestión de Riesgos](#10-gestión-de-riesgos)

---

## 1. Resumen Ejecutivo

Este documento detalla los pasos de implementación ordenados en **5 fases progresivas**, cada una con instrucciones de consola, código concreto y criterio de validación antes de avanzar a la siguiente.

```
Fase 0 ──► Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5
Prereqs    Repo/Config  JSON DB    Next.js    Deploy     CI/CD
  ~30m       ~45m        ~30m       ~60m       ~30m      ~30m
                                                       Total: ~3.5h
```

> **Regla de oro:** No avanzar a la siguiente fase hasta que todos los criterios de validación de la fase actual estén cumplidos.

---

## 2. Fase 0 — Prerrequisitos

**Objetivo:** Tener el entorno local y las cuentas necesarias listas antes de escribir una sola línea de código.

**Duración estimada:** 30 minutos

---

### 2.1 Cuentas requeridas

| Servicio | URL | Acción |
|---|---|---|
| GitHub | https://github.com | Crear cuenta o iniciar sesión |
| Vercel | https://vercel.com | Crear cuenta vinculada a GitHub |
| Node.js | https://nodejs.org | Descargar versión 20 LTS |

### 2.2 Verificar instalaciones locales

Ejecutar en la terminal:

```bash
# Verificar Node.js (debe ser 20.x o superior)
node --version

# Verificar npm (debe ser 9.x o superior)
npm --version

# Verificar Git
git --version
```

Salida esperada:
```
v20.x.x
9.x.x
git version 2.x.x
```

### 2.3 Configurar Git local (si no está configurado)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 2.4 Vincular Vercel con GitHub

1. Ingresar a [vercel.com](https://vercel.com) → **Sign Up with GitHub**.
2. Autorizar a Vercel a acceder a los repositorios de la cuenta.
3. Confirmar que el dashboard de Vercel muestra la cuenta de GitHub vinculada.

### 2.5 Instalar Vercel CLI (opcional pero recomendado)

```bash
npm install -g vercel

# Autenticar
vercel login
```

---

### ✅ Criterio de validación — Fase 0

- [ ] `node --version` devuelve `v20.x.x`
- [ ] `git --version` devuelve una versión válida
- [ ] Cuenta de Vercel vinculada a GitHub (visible en el dashboard)
- [ ] `vercel whoami` devuelve el nombre de usuario (si se instaló el CLI)

---

## 3. Fase 1 — Repositorio y Configuración Base

**Objetivo:** Crear el repositorio en GitHub, inicializar el proyecto Next.js con TypeScript y confirmar que el entorno local funciona.

**Duración estimada:** 45 minutos

---

### 3.1 Crear el repositorio en GitHub

1. Ir a [github.com/new](https://github.com/new).
2. Configurar el repositorio:
   - **Repository name:** `mi-app-fullstack-ts`
   - **Visibility:** Public o Private (a elección)
   - **Initialize:** sin README (se generará desde local)
3. Copiar la URL SSH o HTTPS del repositorio recién creado.

### 3.2 Inicializar el proyecto Next.js

```bash
# Crear el proyecto con el asistente oficial de Next.js
npx create-next-app@latest mi-app-fullstack-ts

# El asistente preguntará — responder así:
# ✓ Would you like to use TypeScript? → Yes
# ✓ Would you like to use ESLint? → Yes
# ✓ Would you like to use Tailwind CSS? → Yes
# ✓ Would you like to use the `src/` directory? → Yes
# ✓ Would you like to use App Router? → Yes
# ✓ Would you like to customize the default import alias? → Yes (@/*)

cd mi-app-fullstack-ts
```

### 3.3 Vincular con el repositorio GitHub

```bash
# Reemplazar la URL con la del repositorio creado en el paso 3.1
git remote set-url origin https://github.com/TU_USUARIO/mi-app-fullstack-ts.git

# Verificar el remoto
git remote -v

# Primer commit y push
git add .
git commit -m "feat: inicialización del proyecto Next.js con TypeScript"
git push -u origin main
```

### 3.4 Verificar la estructura generada

```bash
# La estructura debe verse así
ls src/app/
# layout.tsx  page.tsx  globals.css  favicon.ico
```

### 3.5 Configurar `tsconfig.json`

Abrir `tsconfig.json` y verificar / agregar estas opciones:

```json
{
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3.6 Configurar `next.config.ts`

Renombrar `next.config.mjs` a `next.config.ts` y reemplazar su contenido:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

### 3.7 Agregar scripts al `package.json`

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

### 3.8 Instalar Prettier

```bash
npm install --save-dev prettier

# Crear archivo de configuración
echo '{ "semi": true, "singleQuote": false, "trailingComma": "es5" }' > .prettierrc
```

### 3.9 Validar que el servidor local arranca

```bash
npm run dev
# Abrir http://localhost:3000 en el navegador
# Debe mostrar la página de bienvenida de Next.js
```

### 3.10 Actualizar `.gitignore`

Verificar que el archivo incluye:

```
node_modules/
.next/
.env.local
*.log
```

### 3.11 Commit de la configuración

```bash
git add .
git commit -m "config: tsconfig strict, next.config.ts, prettier"
git push
```

---

### ✅ Criterio de validación — Fase 1

- [ ] `npm run dev` levanta sin errores en `http://localhost:3000`
- [ ] `npm run type-check` no devuelve errores
- [ ] `npm run lint` no devuelve errores críticos
- [ ] El repositorio en GitHub tiene los archivos del proyecto
- [ ] `tsconfig.json` tiene `"strict": true`

---

## 4. Fase 2 — Capa de Datos JSON

**Objetivo:** Crear la carpeta `/data` con los archivos JSON y la utilidad de lectura tipada en TypeScript.

**Duración estimada:** 30 minutos

---

### 4.1 Crear la estructura de la carpeta `/data`

```bash
# Desde la raíz del proyecto
mkdir -p data/pages
```

### 4.2 Crear `data/config.json`

```bash
cat > data/config.json << 'EOF'
{
  "app": {
    "name": "Mi App Fullstack TS",
    "version": "1.0.0",
    "locale": "es-CO",
    "theme": "dark"
  }
}
EOF
```

### 4.3 Crear `data/pages/home.json`

```bash
cat > data/pages/home.json << 'EOF'
{
  "hero": {
    "title": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "description": "Sistema fullstack funcionando correctamente.",
    "effect": "glow-pulse"
  }
}
EOF
```

### 4.4 Crear la capa de tipos — `src/lib/db/types.ts`

```bash
mkdir -p src/lib/db
```

Crear el archivo `src/lib/db/types.ts`:

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

### 4.5 Crear la utilidad de lectura — `src/lib/db/reader.ts`

Crear el archivo `src/lib/db/reader.ts`:

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON desde /data y lo tipifica con el genérico T.
 * Solo ejecutable en el servidor (Server Components o API Routes).
 * @param relativePath - Ruta sin extensión, relativa a /data. Ej: "pages/home"
 */
export function readJson<T>(relativePath: string): T {
  const filePath = path.join(process.cwd(), "data", `${relativePath}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Archivo JSON no encontrado: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Error al parsear JSON: ${filePath}`);
  }
}
```

### 4.6 Verificar que TypeScript resuelve los tipos

```bash
npm run type-check
# Debe terminar sin errores
```

### 4.7 Commit de la capa de datos

```bash
git add .
git commit -m "feat(db): capa de datos JSON con tipos TypeScript y utilidad readJson"
git push
```

---

### ✅ Criterio de validación — Fase 2

- [ ] Carpeta `/data` existe con `config.json` y `pages/home.json`
- [ ] `src/lib/db/types.ts` define `AppConfig` y `HomeData`
- [ ] `src/lib/db/reader.ts` está implementado con genéricos
- [ ] `npm run type-check` pasa sin errores

---

## 5. Fase 3 — Aplicación Next.js

**Objetivo:** Construir el componente `HolaMundo`, la API Route y la Home page, conectando todo con la capa de datos JSON.

**Duración estimada:** 60 minutos

---

### 5.1 Configurar Tailwind con animaciones personalizadas

Reemplazar el contenido de `tailwind.config.ts`:

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
          "0%, 100%": {
            textShadow: "0 0 20px #6366f1, 0 0 60px #6366f1",
          },
          "50%": {
            textShadow: "0 0 60px #a855f7, 0 0 120px #a855f7",
          },
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

### 5.2 Actualizar `src/app/globals.css`

Reemplazar el contenido con:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glow-text {
    text-shadow: 0 0 30px #6366f1, 0 0 80px #6366f1;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
}
```

### 5.3 Actualizar `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi App Fullstack TS",
  description: "Sistema fullstack con TypeScript, Next.js y Vercel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 5.4 Crear los tipos del componente — `src/components/HolaMundo/HolaMundo.types.ts`

```bash
mkdir -p src/components/HolaMundo
```

Crear `src/components/HolaMundo/HolaMundo.types.ts`:

```typescript
export type EffectType = "glow-pulse" | "fade-in" | "slide-up";

export interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
  effect?: EffectType;
}
```

### 5.5 Crear el componente — `src/components/HolaMundo/HolaMundo.tsx`

Crear `src/components/HolaMundo/HolaMundo.tsx`:

```tsx
import type { HolaMundoProps } from "./HolaMundo.types";

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

        {/* Título principal con efecto */}
        <h1
          className={`text-7xl font-extrabold tracking-tight glow-text ${animationClass}`}
        >
          {title}
        </h1>

        {/* Subtítulo */}
        <p className="text-xl font-medium text-indigo-400 tracking-widest uppercase">
          {subtitle}
        </p>

        {/* Descripción */}
        <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        {/* Badge de validación */}
        <div className="pt-4 border-t border-gray-800">
          <span className="inline-block text-xs text-gray-600 font-mono tracking-wide">
            ✓ TypeScript &nbsp;·&nbsp; ✓ Next.js &nbsp;·&nbsp; ✓ Vercel &nbsp;·&nbsp; ✓ JSON DB
          </span>
        </div>

      </div>
    </main>
  );
}
```

### 5.6 Crear la API Route — `src/app/api/home/route.ts`

```bash
mkdir -p src/app/api/home
```

Crear `src/app/api/home/route.ts`:

```typescript
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
```

### 5.7 Actualizar la Home page — `src/app/page.tsx`

Reemplazar el contenido de `src/app/page.tsx`:

```tsx
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
```

### 5.8 Validar el funcionamiento completo en local

```bash
# Verificar tipos
npm run type-check

# Verificar lint
npm run lint

# Levantar en desarrollo
npm run dev
```

Verificar en el navegador:
- `http://localhost:3000` → Muestra "Hola Mundo" con efecto glow pulsante
- `http://localhost:3000/api/home` → Devuelve el JSON del Home

Respuesta esperada de la API:
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

### 5.9 Build de producción local

```bash
npm run build
# Debe completar sin errores de TypeScript ni de build
```

### 5.10 Commit de la aplicación

```bash
git add .
git commit -m "feat: Home page con componente HolaMundo, API Route y efecto glow-pulse"
git push
```

---

### ✅ Criterio de validación — Fase 3

- [ ] `http://localhost:3000` muestra "Hola Mundo" centrado con efecto visual
- [ ] `http://localhost:3000/api/home` devuelve el JSON correcto
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run build` completa sin errores
- [ ] El componente recibe props tipadas y el efecto es correcto

---

## 6. Fase 4 — Despliegue GitHub + Vercel

**Objetivo:** Vincular el repositorio a Vercel y hacer el primer despliegue a producción.

**Duración estimada:** 30 minutos

---

### 6.1 Importar el proyecto en Vercel

1. Ir a [vercel.com/new](https://vercel.com/new).
2. Seleccionar **Import Git Repository**.
3. Buscar y seleccionar `mi-app-fullstack-ts`.
4. Vercel detecta automáticamente **Next.js** como framework.

### 6.2 Configurar el proyecto en Vercel

En la pantalla de configuración antes de hacer deploy:

| Campo | Valor |
|---|---|
| Project Name | `mi-app-fullstack-ts` |
| Framework Preset | Next.js (autodetectado) |
| Root Directory | `.` (raíz del repo) |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### 6.3 Configurar variables de entorno

En la sección **Environment Variables** antes de hacer deploy:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `production` | Production |
| `NEXT_PUBLIC_APP_ENV` | `preview` | Preview |
| `NEXT_PUBLIC_APP_ENV` | `development` | Development |

### 6.4 Ejecutar el primer deploy

Hacer clic en **Deploy** y esperar la finalización (entre 1 y 3 minutos).

Vercel ejecutará internamente:
```
npm install
npm run build   ← incluye tsc automáticamente
```

### 6.5 Verificar el deploy en producción

Una vez finalizado el deploy, Vercel proporciona una URL del tipo:
```
https://mi-app-fullstack-ts.vercel.app
```

Verificar en el navegador:
- `/` → "Hola Mundo" con efecto glow
- `/api/home` → JSON con los datos del Home

### 6.6 Crear el archivo `.env.example` y commit

```bash
cat > .env.example << 'EOF'
# Copiar como .env.local para desarrollo local
NEXT_PUBLIC_APP_ENV=development
EOF

git add .env.example
git commit -m "config: agregar .env.example con variables de entorno documentadas"
git push
```

### 6.7 Verificar el despliegue automático

Hacer un cambio menor y verificar que Vercel despliega automáticamente:

```bash
# Cambiar el subtítulo en el JSON de datos
# data/pages/home.json → "subtitle": "TypeScript · Next.js · Vercel ✓"

git add data/pages/home.json
git commit -m "content: actualizar subtítulo del Home para verificar deploy automático"
git push

# En 1-2 minutos la URL de producción debe reflejar el cambio
```

---

### ✅ Criterio de validación — Fase 4

- [ ] Primer deploy completado sin errores en Vercel
- [ ] URL de producción muestra "Hola Mundo" con el efecto visual
- [ ] `/api/home` en producción devuelve el JSON correcto
- [ ] Push a `main` desencadena un nuevo deploy automáticamente
- [ ] El cambio en el JSON se refleja en producción tras el deploy

---

## 7. Fase 5 — CI/CD y Validación TypeScript

**Objetivo:** Implementar GitHub Actions para ejecutar type-check y lint en cada PR, asegurando que ningún error llegue a producción.

**Duración estimada:** 30 minutos

---

### 7.1 Crear el directorio de workflows

```bash
mkdir -p .github/workflows
```

### 7.2 Crear el workflow de CI — `.github/workflows/ci.yml`

```yaml
name: CI — Type Check & Lint

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: Validar TypeScript y ESLint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Instalar dependencias
        run: npm ci

      - name: Verificar tipos TypeScript
        run: npm run type-check

      - name: Ejecutar ESLint
        run: npm run lint

      - name: Build de producción
        run: npm run build
```

### 7.3 Proteger la rama `main` en GitHub

1. Ir al repositorio en GitHub → **Settings → Branches**.
2. Hacer clic en **Add branch protection rule**.
3. Configurar:
   - **Branch name pattern:** `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Seleccionar el check: `Validar TypeScript y ESLint`
   - ✅ Require branches to be up to date before merging

### 7.4 Commit y push del workflow

```bash
git add .github/workflows/ci.yml
git commit -m "ci: agregar GitHub Actions para type-check, lint y build"
git push
```

### 7.5 Verificar que el workflow se ejecuta

1. Ir al repositorio en GitHub → pestaña **Actions**.
2. El workflow `CI — Type Check & Lint` debe aparecer en ejecución.
3. Verificar que todos los pasos pasan con ✅.

### 7.6 Probar el CI con un error intencional

Para confirmar que el sistema bloquea errores de TypeScript:

```bash
# Crear una rama de prueba
git checkout -b test/ts-error

# Introducir un error de tipos en src/app/page.tsx
# Por ejemplo, pasar un número donde se espera string:
# title={123}  ← esto debe fallar el type-check

git add .
git commit -m "test: error de TypeScript intencional para validar CI"
git push origin test/ts-error

# Crear un Pull Request en GitHub hacia main
# El CI debe fallar con el error de tipos ✗
```

Verificar que el PR muestra el check fallido y no permite hacer merge.

Luego revertir el cambio:

```bash
git checkout main
git branch -D test/ts-error
git push origin --delete test/ts-error
```

### 7.7 Agregar badge del CI al README

Crear o actualizar `README.md`:

```markdown
# Mi App Fullstack TS

![CI](https://github.com/TU_USUARIO/mi-app-fullstack-ts/actions/workflows/ci.yml/badge.svg)

Sistema fullstack con TypeScript, Next.js, Vercel y JSON como base de datos.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel (CD automático desde GitHub)
- **Persistencia:** Archivos JSON en `/data`

## Desarrollo local

\`\`\`bash
npm install
npm run dev
# http://localhost:3000
\`\`\`

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Ejecutar ESLint |
| `npm run format` | Formatear con Prettier |
```

```bash
git add README.md
git commit -m "docs: README con badge de CI y documentación del proyecto"
git push
```

---

### ✅ Criterio de validación — Fase 5

- [ ] Workflow de GitHub Actions visible en la pestaña Actions del repositorio
- [ ] Todos los checks pasan (✅) en la rama `main`
- [ ] La rama `main` está protegida y requiere checks antes de merge
- [ ] Un PR con error de TypeScript falla el CI y no permite merge
- [ ] Badge del CI visible en el README
- [ ] URL de producción en Vercel sigue funcionando tras toda la configuración

---

## 8. Cronograma Estimado

```
DÍA 1
  ├── 09:00 – 09:30  Fase 0: Prerrequisitos y cuentas         (30 min)
  ├── 09:30 – 10:15  Fase 1: Repositorio y configuración base (45 min)
  ├── 10:15 – 10:45  Fase 2: Capa de datos JSON               (30 min)
  ├── 10:45 – 12:00  Fase 3: Aplicación Next.js               (75 min)  ← incluye pruebas
  ├── 14:00 – 14:30  Fase 4: Despliegue GitHub + Vercel       (30 min)
  └── 14:30 – 15:00  Fase 5: CI/CD y validación TypeScript    (30 min)

TOTAL: ~3.5 horas de implementación activa
```

> Las fases 3 y 5 pueden extenderse si se profundiza en ajustes visuales o en la configuración del CI. El cronograma asume un desarrollador familiarizado con el stack.

---

## 9. Criterios de Éxito por Fase

| Fase | Criterio principal | Cómo verificarlo |
|---|---|---|
| 0 | Entorno listo | `node --version` → 20.x, Vercel vinculado a GitHub |
| 1 | Proyecto corriendo local | `npm run dev` → `localhost:3000` sin errores |
| 2 | Datos JSON legibles con tipos | `npm run type-check` pasa tras crear `readJson<T>()` |
| 3 | Home funcional end-to-end | "Hola Mundo" con efecto glow + API `/api/home` responde |
| 4 | En producción | URL de Vercel muestra la app, deploy automático funciona |
| 5 | CI bloqueando errores | PR con error de TS falla el check y no permite merge |

---

## 10. Gestión de Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Error de versión de Node.js | Media | Alto | Usar `nvm` para gestionar versiones; fijar versión en `.nvmrc` |
| Vercel no detecta Next.js | Baja | Medio | Verificar que `package.json` tiene `next` como dependencia principal |
| Tailwind no aplica animaciones personalizadas | Media | Bajo | Verificar que el `content` en `tailwind.config.ts` apunta a `./src/**/*.{ts,tsx}` |
| `readJson` falla en producción | Baja | Alto | Vercel incluye la carpeta `/data` en el build; verificar que no está en `.gitignore` |
| GitHub Actions falla por cache | Baja | Bajo | Usar `npm ci` en lugar de `npm install` para instalaciones reproducibles |
| Variables de entorno no disponibles | Media | Medio | Configurar todas las variables en el dashboard de Vercel antes del primer deploy |

### Solución rápida: `readJson` falla en Vercel

Si la API Route devuelve 500 en producción pero funciona local, verificar que `/data` está siendo trackeado por Git:

```bash
# Verificar que /data no está en .gitignore
cat .gitignore | grep data

# Si está excluido, remover la línea y hacer commit
git add data/
git commit -m "fix: incluir carpeta /data en el repositorio"
git push
```

---

*Plan de Implementación por Fases — Versión 1.0.0*
*Basado en el Plan de Infraestructura Fullstack TypeScript*
