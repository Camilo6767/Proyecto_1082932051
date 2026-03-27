# 🚀 Plan de Implementación por Fases
## Fullstack TypeScript — Next.js 14 + GitHub + Vercel + JSON como BD

> **Documento:** Plan de Implementación  
> **Referencia:** Plan de Infraestructura Fullstack TypeScript v1.0  
> **Fecha:** Marzo 2026  
> **Metodología:** Iteración incremental — cada fase produce un entregable funcional y verificable  
> **Tiempo total estimado:** 3–5 horas (primera puesta en producción)

---

## 📊 Resumen de Fases

| # | Fase | Entregable | Tiempo Est. | Dependencia |
|---|------|-----------|-------------|-------------|
| **0** | Preparación del entorno | Herramientas instaladas y cuentas listas | 20 min | Ninguna |
| **1** | Repositorio y scaffold inicial | Proyecto Next.js en GitHub | 30 min | Fase 0 |
| **2** | Configuración TypeScript estricto | TS compilando sin errores en modo strict | 15 min | Fase 1 |
| **3** | Capa de datos JSON | Helper `jsonDb.ts` tipado y funcional | 20 min | Fase 2 |
| **4** | Componente Home "Hola Mundo" | Página visual con efecto elegante | 30 min | Fase 3 |
| **5** | API Route de validación | Endpoint `/api/config` respondiendo | 15 min | Fase 3 |
| **6** | Vinculación Vercel | Deploy automático desde GitHub | 20 min | Fase 1 |
| **7** | Primer deploy a producción | URL pública funcionando en Vercel | 15 min | Fases 4, 5, 6 |
| **8** | Validación end-to-end | Checklist completo verificado | 20 min | Fase 7 |

---

## 🔁 Flujo General de Implementación

```
[FASE 0]              [FASE 1]              [FASE 2]
Preparar entorno  →   Crear repo + scaffold → Configurar TypeScript
(local + cuentas)     (Next.js en GitHub)    (strict mode)
       │
       ▼
[FASE 3]              [FASE 4]              [FASE 5]
Capa datos JSON   →   Home "Hola Mundo"  →  API Route /api/config
(jsonDb.ts)           (Framer Motion)        (GET → JSON)
       │
       ▼
[FASE 6]              [FASE 7]              [FASE 8]
Vincular Vercel   →   Deploy producción  →  Validación final
(GitHub ↔ Vercel)     (URL pública)          (checklist ✓)
```

---

---

# FASE 0 — Preparación del Entorno

> **Objetivo:** Garantizar que todas las herramientas locales y cuentas externas estén listas antes de escribir una sola línea de código.  
> **Tiempo estimado:** 20 minutos  
> **Entregable:** Entorno local verificado + cuentas activas

---

## 0.1 Verificar herramientas locales

Abrir una terminal y ejecutar cada comando. Si alguno falla, instalar antes de continuar.

```bash
# Verificar Node.js (debe ser >= 20.x)
node --version
# Salida esperada: v20.x.x

# Verificar npm (debe ser >= 9.x)
npm --version
# Salida esperada: 9.x.x o superior

# Verificar Git
git --version
# Salida esperada: git version 2.x.x
```

### Instalación de Node.js (si no está instalado)

Descargar Node.js 20 LTS desde [nodejs.org](https://nodejs.org) o usar un gestor de versiones:

```bash
# Con nvm (recomendado para Mac/Linux)
nvm install 20
nvm use 20

# Con winget (Windows)
winget install OpenJS.NodeJS.LTS
```

## 0.2 Verificar cuentas

| Cuenta | URL | Acción requerida |
|--------|-----|-----------------|
| **GitHub** | github.com | Tener sesión activa. Crear repositorio nuevo (vacío, sin README) |
| **Vercel** | vercel.com | Registrarse con la cuenta de GitHub para vincularlas automáticamente |

### Crear el repositorio en GitHub

1. Ir a **github.com → New repository**
2. Nombre: `mi-proyecto-ts` (o el nombre deseado)
3. Visibilidad: Público o Privado (ambos funcionan con Vercel)
4. **No inicializar** con README, .gitignore ni licencia (se creará desde local)
5. Copiar la URL del repositorio: `https://github.com/usuario/mi-proyecto-ts.git`

## 0.3 Configurar Git local (si es primera vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### ✅ Criterios de salida de Fase 0

- [ ] `node --version` retorna `v20.x.x` o superior
- [ ] `npm --version` retorna `9.x.x` o superior
- [ ] `git --version` retorna resultado sin errores
- [ ] Repositorio GitHub creado y vacío
- [ ] Cuenta Vercel activa y vinculada a GitHub

---

---

# FASE 1 — Repositorio y Scaffold Inicial

> **Objetivo:** Crear el proyecto Next.js con TypeScript, subirlo a GitHub y tener la estructura base lista.  
> **Tiempo estimado:** 30 minutos  
> **Entregable:** Repositorio en GitHub con proyecto Next.js funcional

---

## 1.1 Crear el proyecto con create-next-app

```bash
# Ejecutar desde el directorio donde guardes tus proyectos
npx create-next-app@latest mi-proyecto-ts \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Cuando el instalador pregunte:
- `Would you like to use Turbopack?` → **No** (más estable para producción)

```bash
# Entrar al directorio del proyecto
cd mi-proyecto-ts
```

## 1.2 Instalar dependencias adicionales

```bash
# Framer Motion para animaciones del Home
npm install framer-motion

# Tipos de Node.js (necesarios para fs, path en TypeScript)
npm install -D @types/node
```

## 1.3 Verificar que el proyecto inicia correctamente

```bash
npm run dev
```

Abrir `http://localhost:3000` en el navegador. Debe aparecer la página de bienvenida de Next.js.

Presionar `Ctrl + C` para detener el servidor.

## 1.4 Crear archivos de entorno

```bash
# Crear el archivo de variables de entorno locales (NO va a Git)
touch .env.local

# Crear la plantilla (SÍ va a Git)
touch .env.example
```

Contenido de `.env.example`:

```bash
# Plantilla de variables de entorno
# Copia este archivo como .env.local y completa los valores

NEXT_PUBLIC_SITE_NAME="Mi App TypeScript"
```

Contenido de `.env.local`:

```bash
NEXT_PUBLIC_SITE_NAME="Mi App TypeScript"
```

## 1.5 Verificar y ajustar .gitignore

Confirmar que el archivo `.gitignore` generado automáticamente incluye estas líneas (create-next-app lo hace por defecto):

```gitignore
# Variables de entorno — verificar que estén estas líneas
.env
.env.local
.env.*.local

# Build
.next/
out/

# Dependencias
node_modules/
```

## 1.6 Subir el proyecto a GitHub

```bash
# Inicializar Git (si create-next-app no lo hizo)
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: scaffold inicial Next.js 14 con TypeScript"

# Vincular con el repositorio remoto de GitHub
git remote add origin https://github.com/TU_USUARIO/mi-proyecto-ts.git

# Subir a la rama main
git branch -M main
git push -u origin main
```

### ✅ Criterios de salida de Fase 1

- [ ] `npm run dev` abre el sitio en `localhost:3000` sin errores
- [ ] El repositorio en GitHub muestra todos los archivos del proyecto
- [ ] `.env.local` NO aparece en GitHub (está en .gitignore)
- [ ] `.env.example` SÍ aparece en GitHub
- [ ] La rama principal se llama `main`

---

---

# FASE 2 — Configuración TypeScript Estricto

> **Objetivo:** Activar el modo estricto de TypeScript y verificar que el compilador no reporta ningún error sobre el código base inicial.  
> **Tiempo estimado:** 15 minutos  
> **Entregable:** `tsconfig.json` con strict mode y `tsc --noEmit` sin errores

---

## 2.1 Reemplazar tsconfig.json

Abrir `tsconfig.json` en la raíz del proyecto y reemplazar su contenido completo:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
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

**Opciones clave activadas:**

| Opción | Efecto |
|--------|--------|
| `"strict": true` | Activa todas las verificaciones de tipos: nullChecks, implicitAny, etc. |
| `"noUncheckedIndexedAccess": true` | Obliga a verificar que un índice de array existe antes de usarlo |
| `"allowJs": false` | Prohíbe archivos `.js` — todo debe ser `.ts` o `.tsx` |
| `"resolveJsonModule": true` | Permite importar archivos `.json` con tipos automáticos |

## 2.2 Actualizar next.config.ts

Reemplazar el contenido de `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fs"],
};

export default nextConfig;
```

## 2.3 Verificar compilación

```bash
# Verificar tipos sin generar archivos de salida
npm run type-check

# Si el script no existe, ejecutar directamente:
npx tsc --noEmit
```

La salida debe estar vacía (sin errores ni advertencias).

## 2.4 Agregar script de type-check al package.json

Abrir `package.json` y verificar que la sección `"scripts"` incluye:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## 2.5 Commit de la configuración TypeScript

```bash
git add .
git commit -m "config: TypeScript strict mode activado"
git push
```

### ✅ Criterios de salida de Fase 2

- [ ] `npm run type-check` ejecuta sin errores ni advertencias
- [ ] `npm run build` completa sin errores de TypeScript
- [ ] No existe ningún archivo `.js` dentro de `src/` (solo `.ts` y `.tsx`)
- [ ] `allowJs: false` está activo en `tsconfig.json`

---

---

# FASE 3 — Capa de Datos JSON

> **Objetivo:** Crear la estructura de carpeta `/data` y el helper tipado `jsonDb.ts` que actúa como capa de acceso a datos.  
> **Tiempo estimado:** 20 minutos  
> **Entregable:** Carpeta `/data` con JSON de configuración y helper con tipos funcionando

---

## 3.1 Crear la carpeta data/ en la raíz

```bash
mkdir -p data
```

> Esta carpeta debe estar en la **raíz** del proyecto (al mismo nivel que `src/`, `public/`, `package.json`), no dentro de `src/`.

## 3.2 Crear data/config.json

Crear el archivo `data/config.json`:

```json
{
  "siteName": "Mi App TypeScript",
  "version": "1.0.0",
  "home": {
    "titulo": "Hola Mundo",
    "subtitulo": "Powered by TypeScript + Next.js + Vercel",
    "activo": true
  }
}
```

## 3.3 Crear la carpeta lib/

```bash
mkdir -p src/lib
```

## 3.4 Crear src/lib/types.ts

```typescript
// ============================================================
// Tipos globales de TypeScript para toda la aplicación
// Cada interface refleja la estructura de un archivo en /data
// ============================================================

export interface ConfigSitio {
  siteName: string;
  version: string;
  home: {
    titulo: string;
    subtitulo: string;
    activo: boolean;
  };
}
```

## 3.5 Crear src/lib/jsonDb.ts

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON de la carpeta /data como si fuera una tabla de BD.
 *
 * Uso: const config = await leerColeccion<ConfigSitio>("config");
 *
 * @param nombre - Nombre del archivo sin extensión (ej: "config" → lee "data/config.json")
 * @returns Los datos tipados según el genérico T
 */
export async function leerColeccion<T>(nombre: string): Promise<T> {
  const rutaAbsoluta = path.join(process.cwd(), "data", `${nombre}.json`);

  if (!fs.existsSync(rutaAbsoluta)) {
    throw new Error(
      `Colección "${nombre}" no encontrada en /data/${nombre}.json`
    );
  }

  const contenido = fs.readFileSync(rutaAbsoluta, "utf-8");
  return JSON.parse(contenido) as T;
}

/**
 * Escribe datos en un archivo JSON de la carpeta /data.
 *
 * ⚠️ ATENCIÓN: Solo usar en contexto de servidor (API Routes).
 * En Vercel serverless, el filesystem es efímero — los cambios
 * no persisten entre requests. Para escritura persistente usar
 * Vercel KV o Vercel Blob.
 *
 * @param nombre - Nombre del archivo sin extensión
 * @param datos - Datos a serializar y guardar
 */
export async function escribirColeccion<T>(
  nombre: string,
  datos: T
): Promise<void> {
  const rutaAbsoluta = path.join(process.cwd(), "data", `${nombre}.json`);
  fs.writeFileSync(rutaAbsoluta, JSON.stringify(datos, null, 2), "utf-8");
}
```

## 3.6 Verificar tipos nuevamente

```bash
npm run type-check
```

Debe seguir sin errores.

## 3.7 Commit de la capa de datos

```bash
git add .
git commit -m "feat: capa de datos JSON con helper tipado y tipos globales"
git push
```

### ✅ Criterios de salida de Fase 3

- [ ] Existe `data/config.json` con estructura válida
- [ ] Existe `src/lib/types.ts` con interface `ConfigSitio`
- [ ] Existe `src/lib/jsonDb.ts` con funciones `leerColeccion` y `escribirColeccion`
- [ ] `npm run type-check` sigue sin errores después de agregar estos archivos
- [ ] La función `leerColeccion<T>` tiene tipado genérico correcto

---

---

# FASE 4 — Componente Home "Hola Mundo" con Efecto Elegante

> **Objetivo:** Crear el componente visual principal con animaciones de entrada elegantes, donde los datos provienen del archivo JSON.  
> **Tiempo estimado:** 30 minutos  
> **Entregable:** Página principal en `localhost:3000` con "Hola Mundo" centrado y animado

---

## 4.1 Crear la carpeta components/

```bash
mkdir -p src/components
```

## 4.2 Crear src/components/HolaMundo.tsx

```typescript
"use client";

import { motion } from "framer-motion";

// ─── Tipos del componente ──────────────────────────────────
interface HolaMundoProps {
  titulo: string;
  subtitulo: string;
}

// ─── Variantes de animación ────────────────────────────────
const variantes = {
  titulo: {
    oculto: { opacity: 0, y: 40, letterSpacing: "0.5em" },
    visible: {
      opacity: 1,
      y: 0,
      letterSpacing: "0.2em",
      transition: { duration: 1.4, ease: "easeOut" },
    },
  },
  linea: {
    oculto: { width: 0 },
    visible: {
      width: "200px",
      transition: { duration: 1, delay: 0.8, ease: "easeInOut" },
    },
  },
  subtitulo: {
    oculto: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, delay: 1.4 },
    },
  },
  badge: {
    oculto: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, delay: 2 },
    },
  },
};

// ─── Componente principal ──────────────────────────────────
export default function HolaMundo({ titulo, subtitulo }: HolaMundoProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative">

      {/* Fondo con gradiente animado */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, #1a1a2e 0%, #000 70%)",
            "radial-gradient(ellipse at 80% 50%, #16213e 0%, #000 70%)",
            "radial-gradient(ellipse at 50% 20%, #0f3460 0%, #000 70%)",
            "radial-gradient(ellipse at 20% 50%, #1a1a2e 0%, #000 70%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Partículas decorativas */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: `${(i + 1) * 200}px`,
            height: `${(i + 1) * 200}px`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Título principal */}
      <motion.h1
        className="text-6xl md:text-8xl font-thin text-white tracking-widest text-center z-10 px-4"
        variants={variantes.titulo}
        initial="oculto"
        animate="visible"
      >
        {titulo}
      </motion.h1>

      {/* Línea separadora */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent z-10 mt-6"
        variants={variantes.linea}
        initial="oculto"
        animate="visible"
      />

      {/* Subtítulo */}
      <motion.p
        className="mt-6 text-white/40 text-xs tracking-[0.35em] uppercase z-10 text-center px-8"
        variants={variantes.subtitulo}
        initial="oculto"
        animate="visible"
      >
        {subtitulo}
      </motion.p>

      {/* Badge de validación TypeScript */}
      <motion.div
        className="mt-12 px-5 py-2 border border-white/15 rounded-full text-white/30 text-xs tracking-[0.25em] z-10 backdrop-blur-sm"
        variants={variantes.badge}
        initial="oculto"
        animate="visible"
      >
        ✦ &nbsp; TypeScript Activo &nbsp; ✦
      </motion.div>
    </main>
  );
}
```

## 4.3 Reemplazar src/app/page.tsx

```typescript
import { leerColeccion } from "@/lib/jsonDb";
import { ConfigSitio } from "@/lib/types";
import HolaMundo from "@/components/HolaMundo";

// Página del Home — Server Component de Next.js
// Lee los datos del JSON en el servidor y los pasa al componente cliente
export default async function HomePage() {
  const config = await leerColeccion<ConfigSitio>("config");

  return (
    <HolaMundo
      titulo={config.home.titulo}
      subtitulo={config.home.subtitulo}
    />
  );
}
```

## 4.4 Actualizar src/app/layout.tsx

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi App TypeScript",
  description: "Fullstack TypeScript con Next.js y Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

## 4.5 Verificar en el navegador

```bash
npm run dev
```

Abrir `http://localhost:3000`. Se debe ver:
- Fondo negro con gradiente azul animado
- Texto "Hola Mundo" apareciendo con efecto de expansión
- Línea separadora que se extiende
- Subtítulo que aparece con fade
- Badge "TypeScript Activo" al final

## 4.6 Commit del Home

```bash
git add .
git commit -m "feat: home con 'Hola Mundo' centrado y animaciones Framer Motion"
git push
```

### ✅ Criterios de salida de Fase 4

- [ ] `localhost:3000` muestra "Hola Mundo" centrado en pantalla
- [ ] Las animaciones de entrada (título, línea, subtítulo, badge) funcionan
- [ ] El fondo tiene el gradiente azul animado
- [ ] El texto proviene de `data/config.json` (verificar cambiando el JSON)
- [ ] `npm run type-check` sin errores
- [ ] El componente `HolaMundo.tsx` tiene `"use client"` al inicio (es un componente cliente con animaciones)
- [ ] `page.tsx` es un Server Component (sin `"use client"`)

---

---

# FASE 5 — API Route de Validación

> **Objetivo:** Crear el primer endpoint del backend que lee datos del JSON y los expone como API REST, validando que el servidor TypeScript funciona.  
> **Tiempo estimado:** 15 minutos  
> **Entregable:** Endpoint `GET /api/config` respondiendo con datos tipados

---

## 5.1 Crear la estructura de carpetas para la API

```bash
mkdir -p src/app/api/config
```

## 5.2 Crear src/app/api/config/route.ts

```typescript
import { NextResponse } from "next/server";
import { leerColeccion } from "@/lib/jsonDb";
import type { ConfigSitio } from "@/lib/types";

// ─── GET /api/config ───────────────────────────────────────
// Retorna la configuración del sitio leyendo data/config.json
// Uso: fetch('/api/config') desde cualquier componente cliente

export async function GET() {
  try {
    const config = await leerColeccion<ConfigSitio>("config");

    return NextResponse.json(
      { ok: true, data: config },
      { status: 200 }
    );
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";

    return NextResponse.json(
      { ok: false, error: mensaje },
      { status: 500 }
    );
  }
}
```

## 5.3 Probar el endpoint localmente

Con el servidor dev corriendo (`npm run dev`), abrir en el navegador o usar curl:

```bash
# Con curl
curl http://localhost:3000/api/config

# Respuesta esperada:
# {
#   "ok": true,
#   "data": {
#     "siteName": "Mi App TypeScript",
#     "version": "1.0.0",
#     "home": {
#       "titulo": "Hola Mundo",
#       "subtitulo": "Powered by TypeScript + Next.js + Vercel",
#       "activo": true
#     }
#   }
# }
```

También se puede visitar directamente: `http://localhost:3000/api/config`

## 5.4 Commit de la API Route

```bash
git add .
git commit -m "feat: API Route GET /api/config con lectura de JSON tipada"
git push
```

### ✅ Criterios de salida de Fase 5

- [ ] `GET /api/config` retorna `{ ok: true, data: {...} }` con status 200
- [ ] La respuesta contiene los datos de `data/config.json`
- [ ] Si se elimina el JSON, retorna `{ ok: false, error: "..." }` con status 500
- [ ] El handler usa tipos de TypeScript (sin `any`)

---

---

# FASE 6 — Vinculación GitHub ↔ Vercel

> **Objetivo:** Conectar el repositorio de GitHub con Vercel para activar el CI/CD automático.  
> **Tiempo estimado:** 20 minutos  
> **Entregable:** Pipeline de deploy automático activo en Vercel

---

## 6.1 Crear proyecto en Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con la cuenta de GitHub
2. Click en **"Add New..."** → **"Project"**
3. En la sección **"Import Git Repository"**, buscar el repositorio `mi-proyecto-ts`
4. Click en **"Import"**

## 6.2 Configurar el proyecto en Vercel

En la pantalla de configuración:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js (detectado automáticamente) |
| **Root Directory** | `.` (dejar en blanco) |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` (default) |

## 6.3 Configurar variables de entorno en Vercel

Expandir la sección **"Environment Variables"** y agregar:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `NEXT_PUBLIC_SITE_NAME` | `Mi App TypeScript` | Production, Preview, Development |

## 6.4 Deploy inicial

Click en **"Deploy"**.

Vercel ejecutará:
1. `npm install` — instala dependencias
2. `npm run build` — compila TypeScript y genera el bundle
3. Deploy a la URL de producción

El proceso toma entre 1 y 3 minutos.

## 6.5 Verificar el pipeline de CI/CD

Una vez completado el deploy:

```bash
# Hacer un pequeño cambio en data/config.json para probar el pipeline
# Cambiar el subtítulo:
```

En `data/config.json`, cambiar:

```json
"subtitulo": "Pipeline CI/CD verificado ✓"
```

```bash
git add .
git commit -m "test: verificar pipeline CI/CD con cambio en JSON"
git push
```

Ir al dashboard de Vercel y observar que un nuevo deploy se inicia automáticamente.

### ✅ Criterios de salida de Fase 6

- [ ] Proyecto importado exitosamente en Vercel
- [ ] Primer deploy completado sin errores
- [ ] URL de producción accesible (formato: `mi-proyecto-ts.vercel.app`)
- [ ] Un `git push` a `main` dispara un nuevo deploy automáticamente
- [ ] Las variables de entorno están configuradas en Vercel

---

---

# FASE 7 — Primer Deploy a Producción

> **Objetivo:** Asegurar que el estado final del proyecto (con todas las fases anteriores) esté desplegado y accesible públicamente.  
> **Tiempo estimado:** 15 minutos  
> **Entregable:** URL pública en Vercel con el Home funcional

---

## 7.1 Verificar estado del repositorio

```bash
# Ver el estado del repositorio
git status
# Debe mostrar: "nothing to commit, working tree clean"

# Ver el historial de commits
git log --oneline
```

El log debe mostrar algo similar a:

```
a1b2c3d test: verificar pipeline CI/CD con cambio en JSON
e4f5g6h feat: API Route GET /api/config con lectura de JSON tipada
i7j8k9l feat: home con 'Hola Mundo' centrado y animaciones Framer Motion
m1n2o3p feat: capa de datos JSON con helper tipado y tipos globales
q4r5s6t config: TypeScript strict mode activado
u7v8w9x feat: scaffold inicial Next.js 14 con TypeScript
```

## 7.2 Ejecutar build local antes del deploy final

```bash
# Simular exactamente lo que Vercel ejecuta
npm run build
```

La salida debe terminar con algo similar a:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)          Size     First Load JS
┌ ○ /                X kB     XX kB
└ λ /api/config      X kB     XX kB
```

Si hay errores de TypeScript aquí, Vercel también fallará. Resolverlos antes de continuar.

## 7.3 Push final a producción

```bash
# Restaurar el subtítulo original si se cambió en la Fase 6
# data/config.json → "subtitulo": "Powered by TypeScript + Next.js + Vercel"

git add .
git commit -m "release: v1.0.0 — home con hola mundo validado en producción"
git push
```

## 7.4 Verificar en la URL de producción

Una vez que Vercel complete el deploy (1–3 minutos):

1. Abrir la URL de producción: `https://mi-proyecto-ts.vercel.app`
2. Verificar que el Home se muestra con las animaciones
3. Verificar el API: `https://mi-proyecto-ts.vercel.app/api/config`

### ✅ Criterios de salida de Fase 7

- [ ] `npm run build` local completa sin errores
- [ ] La URL de producción en Vercel está accesible
- [ ] El Home muestra "Hola Mundo" con animaciones en producción
- [ ] `/api/config` retorna datos correctamente en producción
- [ ] El dashboard de Vercel muestra el deploy como "Ready"

---

---

# FASE 8 — Validación End-to-End

> **Objetivo:** Ejecutar el checklist completo de verificación para confirmar que todos los componentes del sistema funcionan correctamente en producción.  
> **Tiempo estimado:** 20 minutos  
> **Entregable:** Sistema validado y documentado, listo para escalar

---

## 8.1 Checklist de Infraestructura

```
INFRAESTRUCTURA
───────────────
[ ] Repositorio GitHub contiene el código fuente completo
[ ] .env.local NO está en el repositorio (verificar en GitHub)
[ ] .env.example SÍ está en el repositorio con la plantilla
[ ] Proyecto vinculado correctamente a Vercel
[ ] Deploy automático funciona al hacer push a main
[ ] Las variables de entorno están configuradas en Vercel
```

## 8.2 Checklist de TypeScript

```
TYPESCRIPT
──────────
[ ] npm run type-check → sin errores ni warnings
[ ] npm run build → completa exitosamente
[ ] npm run lint → sin errores de ESLint
[ ] tsconfig.json tiene "strict": true activado
[ ] tsconfig.json tiene "allowJs": false (sin archivos .js en src/)
[ ] No hay uso de "any" explícito en ningún archivo de src/
[ ] Los tipos en types.ts reflejan exactamente la estructura de los JSON
```

## 8.3 Checklist de Capa de Datos JSON

```
CAPA DE DATOS JSON
──────────────────
[ ] Carpeta /data existe en la raíz del proyecto
[ ] data/config.json tiene estructura JSON válida
[ ] leerColeccion<T>() retorna datos tipados correctamente
[ ] El helper maneja el error cuando el archivo no existe
[ ] Los tipos TypeScript coinciden con los campos del JSON
[ ] La carpeta /data está versionada en Git
```

## 8.4 Checklist del Home "Hola Mundo"

```
HOME / VISUAL
─────────────
[ ] localhost:3000 muestra el Home correctamente
[ ] URL de producción Vercel muestra el Home correctamente
[ ] "Hola Mundo" está centrado vertical y horizontalmente
[ ] Las animaciones de Framer Motion funcionan (título, línea, subtítulo, badge)
[ ] El fondo tiene el efecto de gradiente animado
[ ] El diseño es responsive (verificar en móvil y escritorio)
[ ] Los datos del Home provienen de data/config.json (no están hardcodeados)
```

## 8.5 Checklist de la API

```
API ROUTES
──────────
[ ] GET /api/config → status 200 con datos de config.json
[ ] GET /api/config → retorna { ok: true, data: {...} }
[ ] Si config.json falla → retorna { ok: false, error: "..." } con status 500
[ ] La URL de producción responde: https://mi-proyecto-ts.vercel.app/api/config
```

## 8.6 Prueba de cambio de datos (smoke test)

Esta prueba confirma que el sistema funciona de extremo a extremo:

```bash
# 1. Cambiar el título en el JSON
# data/config.json → "titulo": "¡Sistema Validado!"

# 2. Hacer push
git add data/config.json
git commit -m "test: smoke test cambio de datos"
git push

# 3. Esperar el deploy en Vercel (1-3 min)
# 4. Verificar que la URL de producción muestra "¡Sistema Validado!"
# 5. Revertir el cambio
# data/config.json → "titulo": "Hola Mundo"
git add data/config.json
git commit -m "revert: restaurar título original"
git push
```

Si este smoke test pasa, el pipeline completo está validado.

---

---

## 🗺️ ¿Qué Sigue? — Roadmap de Expansión

Con el sistema validado, estas son las siguientes iteraciones naturales:

```
FASE A (Completada ✓)
Home validado en producción
       │
       ▼
FASE B — Nuevas Colecciones JSON
   Agregar data/usuarios.json, data/productos.json
   Crear sus interfaces en types.ts
   Crear API Routes para cada colección
       │
       ▼
FASE C — CRUD Completo
   POST, PUT, DELETE en API Routes
   Formularios en el frontend
   ⚠️ Nota: Para escritura persistente usar Vercel KV
       │
       ▼
FASE D — Nuevas Páginas
   Rutas dinámicas: /productos/[id]
   Layouts anidados: dashboard, landing
   Componentes UI reutilizables en /components/ui
       │
       ▼
FASE E — Autenticación
   NextAuth.js o Clerk
   Rutas protegidas con middleware
   Gestión de sesiones
       │
       ▼
FASE F — Migración a BD Real (si el volumen lo requiere)
   Supabase (PostgreSQL) o PlanetScale (MySQL)
   Drizzle ORM o Prisma con TypeScript
   Mantener el mismo patrón de helper tipado
```

---

## 📋 Referencia Rápida de Comandos

```bash
# Desarrollo local
npm run dev           # Inicia el servidor en localhost:3000

# Calidad de código
npm run type-check    # Verifica tipos de TypeScript sin compilar
npm run lint          # Ejecuta ESLint sobre todo el código
npm run build         # Build completo (igual que Vercel en producción)

# Git (flujo estándar)
git add .
git commit -m "tipo: descripción del cambio"
git push              # Dispara deploy automático en Vercel

# Tipos de commit recomendados
# feat:     nueva funcionalidad
# fix:      corrección de bug
# config:   cambio de configuración
# refactor: reestructuración sin cambio de funcionalidad
# test:     pruebas
# docs:     documentación
# release:  versión lista para producción
```

---

## ⚠️ Notas Importantes para el Equipo

| Situación | Qué hacer |
|-----------|-----------|
| TypeScript reporta error en `npm run build` | Vercel **no desplegará**. Resolver el error en local primero. |
| Se modifica `data/*.json` | El cambio se versiona en Git y llega a producción en el próximo deploy |
| Se necesita escritura persistente en producción | Usar **Vercel KV** (clave-valor) o **Vercel Blob** (archivos). El filesystem de Vercel es efímero en serverless. |
| Se agrega un nuevo JSON en `/data` | Crear su interface en `types.ts` inmediatamente para mantener tipado |
| Deploy falla en Vercel | Revisar el log de build en el dashboard de Vercel — el error de TypeScript estará detallado |

---

*Este plan de implementación convierte el plan de infraestructura en pasos accionables y verificables. Cada fase tiene criterios de salida claros, lo que permite detectar problemas antes de avanzar a la siguiente. El objetivo no es solo tener un "Hola Mundo" en pantalla, sino validar que todo el pipeline — desde el editor local hasta la URL pública en Vercel — funciona de manera confiable y completamente tipado en TypeScript.*
