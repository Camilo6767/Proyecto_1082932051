# 🏗️ Plan de Infraestructura — Fullstack TypeScript con GitHub + Vercel

> **Versión:** 1.0  
> **Fecha:** Marzo 2026  
> **Arquitecto:** Sistema basado en Next.js 14 + TypeScript + JSON como capa de datos  
> **Objetivo inicial:** Home con "Hola Mundo" centrado y efecto elegante, validando el pipeline completo de TypeScript

---

## 📐 Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   REPOSITORIO GITHUB                    │
│  main branch → trigger automático en cada push         │
└────────────────────────┬────────────────────────────────┘
                         │ CI/CD automático
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│  Build: next build  │  Runtime: Edge / Node.js          │
│  Preview URLs por PR │  Production URL en main          │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────┐     ┌──────────────────────┐
    │   Frontend      │     │   API Routes (Next)  │
    │   Next.js 14    │◄────│   /api/...           │
    │   React + TSX   │     │   Lee archivos JSON  │
    └─────────────────┘     └──────────┬───────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │   /data  (JSON DB)   │
                            │   *.json como tablas │
                            └──────────────────────┘
```

---

## 📁 Estructura de Directorios del Proyecto

```
mi-proyecto/
│
├── 📂 src/
│   ├── 📂 app/                        # App Router de Next.js 14
│   │   ├── layout.tsx                 # Layout raíz con fuentes y metadatos
│   │   ├── page.tsx                   # Home → "Hola Mundo" con efecto elegante
│   │   ├── globals.css                # Estilos globales y variables CSS
│   │   └── 📂 api/                    # API Routes (backend TypeScript)
│   │       └── 📂 ejemplo/
│   │           └── route.ts           # GET /api/ejemplo → lee JSON
│   │
│   ├── 📂 components/                 # Componentes React reutilizables
│   │   ├── HolaMundo.tsx              # Componente principal del Home
│   │   └── 📂 ui/                     # Átomos de UI (botones, cards, etc.)
│   │
│   ├── 📂 lib/                        # Utilidades y helpers
│   │   ├── jsonDb.ts                  # Helper para leer/escribir archivos JSON
│   │   └── types.ts                   # Tipos TypeScript globales
│   │
│   └── 📂 styles/                     # Estilos adicionales (si se requieren)
│
├── 📂 data/                           # 🗄️ "Base de datos" JSON
│   ├── config.json                    # Configuración general del sitio
│   └── ejemplo.json                   # Tabla de ejemplo
│
├── 📂 public/                         # Archivos estáticos
│   └── favicon.ico
│
├── .env.local                         # Variables de entorno locales (no se sube)
├── .env.example                       # Plantilla de variables de entorno
├── .gitignore
├── next.config.ts                     # Configuración de Next.js en TypeScript
├── tsconfig.json                      # Configuración de TypeScript
├── package.json
└── README.md
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| **Framework** | Next.js | 14.x | App Router, SSR, API Routes |
| **Lenguaje** | TypeScript | 5.x | Tipado estricto en todo el stack |
| **UI** | React | 18.x | Componentes del frontend |
| **Estilos** | Tailwind CSS | 3.x | Utilidades CSS con soporte TS |
| **Animaciones** | Framer Motion | 11.x | Efectos elegantes en el Home |
| **Datos** | JSON files | — | Capa de persistencia (sin DB convencional) |
| **Deploy** | Vercel | — | Hosting + CI/CD automático |
| **VCS** | GitHub | — | Repositorio y control de versiones |
| **Runtime** | Node.js | 20.x LTS | Entorno de ejecución |
| **Linter** | ESLint + Prettier | — | Calidad y formato de código |

---

## ⚙️ Requisitos Previos

### Cuentas y Accesos
- [ ] Cuenta en **GitHub** con repositorio creado (público o privado)
- [ ] Cuenta en **Vercel** vinculada a la cuenta de GitHub
- [ ] **Node.js 20 LTS** instalado localmente
- [ ] **npm** o **pnpm** como gestor de paquetes

### Herramientas Locales
```bash
node --version   # debe ser >= 20.x
npm --version    # debe ser >= 9.x
git --version    # debe ser >= 2.x
```

---

## 🚀 Fase 1 — Inicialización del Proyecto

### 1.1 Crear el proyecto Next.js con TypeScript

```bash
npx create-next-app@latest mi-proyecto \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mi-proyecto
```

**Opciones seleccionadas y su razón:**
- `--typescript` → activa el tipado estático en todo el proyecto
- `--tailwind` → utilidades CSS integradas desde el inicio
- `--eslint` → linting automático
- `--app` → usa App Router (Next.js 14, estándar actual)
- `--src-dir` → organiza el código dentro de `src/`
- `--import-alias "@/*"` → importaciones limpias sin rutas relativas profundas

### 1.2 Instalar dependencias adicionales

```bash
# Animaciones elegantes para el Home
npm install framer-motion

# Utilidades de tipos (opcional pero recomendado)
npm install -D @types/node
```

### 1.3 Configurar TypeScript estricto

Editar `tsconfig.json`:

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

> **Nota:** `"strict": true` activa todas las verificaciones de TypeScript. Si el compilador de TypeScript no reporta errores, el pipeline está validado correctamente.

---

## 🗄️ Fase 2 — Capa de Datos (JSON como Base de Datos)

### 2.1 Crear la carpeta `data/`

```bash
mkdir -p data
```

### 2.2 Archivo `data/config.json`

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

### 2.3 Helper de lectura JSON — `src/lib/jsonDb.ts`

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee un archivo JSON de la carpeta /data como si fuera una tabla de BD.
 * @param nombre - Nombre del archivo sin extensión (ej: "config")
 * @returns Los datos tipados del archivo JSON
 */
export async function leerColeccion<T>(nombre: string): Promise<T> {
  const rutaAbsoluta = path.join(process.cwd(), "data", `${nombre}.json`);
  const contenido = fs.readFileSync(rutaAbsoluta, "utf-8");
  return JSON.parse(contenido) as T;
}

/**
 * Escribe datos en un archivo JSON de la carpeta /data.
 * Solo disponible en contexto de servidor (API Routes).
 */
export async function escribirColeccion<T>(
  nombre: string,
  datos: T
): Promise<void> {
  const rutaAbsoluta = path.join(process.cwd(), "data", `${nombre}.json`);
  fs.writeFileSync(rutaAbsoluta, JSON.stringify(datos, null, 2), "utf-8");
}
```

### 2.4 Tipos TypeScript — `src/lib/types.ts`

```typescript
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

> **Principio clave:** Los archivos `.json` dentro de `/data` actúan como tablas. Cada archivo es una colección. El helper `leerColeccion<T>` garantiza tipado estricto en cada lectura.

---

## 🎨 Fase 3 — Home con "Hola Mundo" y Efecto Elegante

### 3.1 Componente `src/components/HolaMundo.tsx`

```typescript
"use client";

import { motion } from "framer-motion";

interface HolaMundoProps {
  titulo: string;
  subtitulo: string;
}

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

      {/* Título principal con entrada elegante */}
      <motion.h1
        className="text-6xl md:text-8xl font-thin text-white tracking-widest text-center z-10"
        initial={{ opacity: 0, y: 40, letterSpacing: "0.5em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        {titulo}
      </motion.h1>

      {/* Línea separadora animada */}
      <motion.div
        className="h-px bg-white/40 z-10 mt-6"
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
      />

      {/* Subtítulo */}
      <motion.p
        className="mt-6 text-white/50 text-sm tracking-[0.3em] uppercase z-10 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        {subtitulo}
      </motion.p>

      {/* Badge de TypeScript validado */}
      <motion.div
        className="mt-12 px-4 py-2 border border-white/20 rounded-full text-white/40 text-xs tracking-widest z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
      >
        ✦ TypeScript Activo ✦
      </motion.div>
    </main>
  );
}
```

### 3.2 Página principal `src/app/page.tsx`

```typescript
import { leerColeccion } from "@/lib/jsonDb";
import { ConfigSitio } from "@/lib/types";
import HolaMundo from "@/components/HolaMundo";

export default async function HomePage() {
  // Lectura desde el JSON (equivale a un SELECT en BD)
  const config = await leerColeccion<ConfigSitio>("config");

  return (
    <HolaMundo
      titulo={config.home.titulo}
      subtitulo={config.home.subtitulo}
    />
  );
}
```

### 3.3 Layout raíz `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mi App TypeScript",
  description: "Fullstack TypeScript con Next.js y Vercel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## 🔌 Fase 4 — API Route de Ejemplo

### `src/app/api/config/route.ts`

```typescript
import { NextResponse } from "next/server";
import { leerColeccion } from "@/lib/jsonDb";
import { ConfigSitio } from "@/lib/types";

export async function GET() {
  try {
    const config = await leerColeccion<ConfigSitio>("config");
    return NextResponse.json({ ok: true, data: config });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo leer la configuración" },
      { status: 500 }
    );
  }
}
```

> Accesible en: `https://tu-dominio.vercel.app/api/config`  
> Devuelve el contenido de `data/config.json` tipado y validado.

---

## 🔧 Fase 5 — Configuración de Next.js

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita la lectura de archivos JSON importados con resolveJsonModule
  experimental: {},

  // Excluir la carpeta /data del bundle del cliente (solo servidor)
  serverExternalPackages: ["fs"],
};

export default nextConfig;
```

---

## 🔄 Fase 6 — CI/CD con GitHub + Vercel

### 6.1 Archivo `.gitignore`

```gitignore
# Dependencias
node_modules/
.pnp
.pnp.js

# Next.js build
.next/
out/
build/

# Variables de entorno (nunca al repositorio)
.env
.env.local
.env.*.local

# Sistema operativo
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
```

### 6.2 Archivo `.env.example` (sí va al repositorio)

```bash
# Plantilla de variables de entorno
# Copia este archivo como .env.local y completa los valores

NEXT_PUBLIC_SITE_NAME="Mi App TypeScript"
```

### 6.3 Flujo de CI/CD

```
Desarrollador → git push → GitHub
                               │
                               ├─ Push a branch → Preview URL en Vercel
                               │                  (ej: mi-proyecto-git-feature-xxx.vercel.app)
                               │
                               └─ Push a main   → Deploy a Producción
                                                  (ej: mi-proyecto.vercel.app)
```

**Sin configuración adicional:** Vercel detecta automáticamente Next.js y ejecuta:
1. `npm install`
2. `npm run build` (incluye compilación de TypeScript)
3. Deploy de los archivos generados

Si TypeScript tiene errores, el build **falla** en Vercel y el deploy no se realiza. Esto garantiza que nunca llegue código con errores de tipos a producción.

---

## 📋 Fase 7 — Scripts del Proyecto

### `package.json` (scripts relevantes)

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

| Script | Uso | Descripción |
|--------|-----|-------------|
| `npm run dev` | Desarrollo local | Servidor en `http://localhost:3000` con hot reload |
| `npm run build` | Pre-deploy | Compila TypeScript + genera bundle optimizado |
| `npm run type-check` | Validación | Verifica tipos sin generar archivos |
| `npm run lint` | Calidad | ESLint sobre todos los archivos `.ts` y `.tsx` |

---

## 🔗 Fase 8 — Vinculación GitHub ↔ Vercel

### Pasos en la interfaz de Vercel

1. Ingresar a [vercel.com](https://vercel.com) → **Add New Project**
2. Seleccionar **Import Git Repository** → autorizar acceso a GitHub
3. Elegir el repositorio del proyecto
4. Vercel detecta automáticamente **Next.js** como framework
5. En **Build & Output Settings** dejar los valores por defecto:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
6. Agregar variables de entorno si las hay (panel **Environment Variables**)
7. Click en **Deploy**

### URLs generadas automáticamente

| Tipo | URL Ejemplo |
|------|-------------|
| Producción | `https://mi-proyecto.vercel.app` |
| Preview (PR) | `https://mi-proyecto-git-feature-home-abc123.vercel.app` |
| Dominio custom | `https://midominio.com` (opcional, configurar en DNS) |

---

## ✅ Checklist de Validación Final

### Infraestructura
- [ ] Repositorio GitHub creado y configurado con `.gitignore`
- [ ] Proyecto vinculado a Vercel
- [ ] Deploy automático funcionando en push a `main`
- [ ] Preview deployments activos en pull requests

### TypeScript
- [ ] `npm run type-check` ejecuta sin errores
- [ ] `npm run build` completa sin errores de tipos
- [ ] `strict: true` en `tsconfig.json` activado
- [ ] No hay uso de `any` explícito en el código

### Capa de Datos JSON
- [ ] Carpeta `/data` creada con `config.json`
- [ ] Helper `jsonDb.ts` tipado correctamente
- [ ] Tipos en `types.ts` coinciden con estructura JSON
- [ ] API Route `/api/config` retorna datos correctamente

### Home "Hola Mundo"
- [ ] Página accesible en `/` (raíz del dominio)
- [ ] Texto "Hola Mundo" centrado vertical y horizontalmente
- [ ] Efecto elegante de entrada con Framer Motion funcionando
- [ ] Datos provienen del archivo `data/config.json`
- [ ] Responsive en móvil y escritorio

---

## 🗺️ Roadmap Post-Validación

Una vez validado el pipeline con el Home, el sistema está listo para escalar:

```
Fase A: Home validado ✓
    │
    ▼
Fase B: Agregar más colecciones JSON
        (data/usuarios.json, data/productos.json, etc.)
    │
    ▼
Fase C: Crear API Routes CRUD completas
        (GET, POST, PUT, DELETE sobre archivos JSON)
    │
    ▼
Fase D: Nuevas páginas y componentes
        (rutas dinámicas, layouts anidados)
    │
    ▼
Fase E: Autenticación (NextAuth.js o Clerk)
    │
    ▼
Fase F: Migración a BD real si el volumen lo requiere
        (Supabase, PlanetScale, etc.)
```

---

## ⚠️ Consideraciones y Limitaciones del Enfoque JSON

| Aspecto | Detalle |
|---------|---------|
| **Escala** | Óptimo para proyectos con datos estáticos o de bajo volumen |
| **Concurrencia** | Sin manejo de transacciones; no recomendado para escrituras simultáneas de alto volumen |
| **Persistencia en Vercel** | El sistema de archivos de Vercel es **efímero** en funciones serverless. La carpeta `/data` funciona para **lectura**. Para escritura persistente se debe usar almacenamiento externo (Vercel KV, Blob, etc.) |
| **Rendimiento** | Next.js puede cachear respuestas; las lecturas JSON son extremadamente rápidas |
| **Versionado** | Los cambios en JSON quedan versionados en Git, lo que es una ventaja única |

---

## 📝 Resumen Ejecutivo

| Elemento | Decisión |
|----------|----------|
| Framework | Next.js 14 con App Router |
| Lenguaje | TypeScript estricto (`strict: true`) |
| Datos | Archivos JSON en `/data` con helper tipado |
| Deploy | Vercel con CI/CD automático desde GitHub |
| Animación Home | Framer Motion (entrada suave del texto) |
| Estilos | Tailwind CSS |
| Validación TS | `tsc --noEmit` en cada build de Vercel |
| Tiempo estimado de setup | 45–90 minutos para tener el Home en producción |

---

*Plan elaborado siguiendo principios de arquitectura limpia, separación de responsabilidades y type-safety en todo el stack. El objetivo del "Hola Mundo" no es trivial: valida que TypeScript compile correctamente, que el pipeline de CI/CD funcione de extremo a extremo y que la capa de datos JSON sea legible desde el servidor antes de construir cualquier funcionalidad adicional.*
