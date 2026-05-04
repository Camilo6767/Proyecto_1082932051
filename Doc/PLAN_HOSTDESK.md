# HostDesk — Plan Maestro del Sistema
> Sistema de Gestión de Habitaciones | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Camilo Moreno | Doc: 1082932051

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (`dataService`)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**HostDesk** es una aplicación web diseñada para hoteles, hostales y hospedajes pequeños y medianos que permite controlar el estado de las habitaciones en tiempo real, registrar check-ins y check-outs de huéspedes, calcular automáticamente el total a cobrar y consultar el historial mensual de rentas.

El sistema reemplaza el control manual en papel o en hojas de cálculo. Opera completamente desde el navegador, persiste los datos en Supabase Postgres y registra toda la auditoría de operaciones en Vercel Blob.

El nombre **HostDesk** hace referencia al escritorio del recepcionista — el punto central de operación del hospedaje, desde donde se gestiona todo.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve HostDesk |
|---|---|
| Control de habitaciones en papel o Excel, propenso a errores. | Panel en tiempo real con el estado de cada habitación. |
| Errores al calcular el total a cobrar por la estadía. | Cálculo automático al momento del check-out: días × precio por noche. |
| Pérdida de datos de huéspedes después del check-out. | Los datos se conservan en la base de datos aunque la habitación ya esté disponible. |
| Dificultad para saber cuánto se rentó en un mes. | Historial mensual con resumen financiero consultable por mes y año. |
| Sin trazabilidad de quién hizo qué en el sistema. | Auditoría automática en Vercel Blob de cada operación de escritura. |

### Dirigido a

- Recepcionistas que registran llegadas y salidas de huéspedes.
- Administradores del hospedaje que supervisan la ocupación y los ingresos.

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Administrador** | Humano — Principal | Dueño o gerente del hospedaje. Acceso total, incluyendo bootstrap, gestión de usuarios, habitaciones y reportes financieros. |
| **Recepcionista** | Humano — Operacional | Personal de mostrador. Registra check-ins, check-outs y consulta disponibilidad. |
| **Sistema** | No humano — Automático | Calcula totales, actualiza estados, registra auditoría. |
| **Supabase Postgres** | No humano — Datos | Persistencia de datos estructurados de dominio. |
| **Vercel Blob** | No humano — Datos | Persistencia de auditoría de operaciones. |

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Admin | Recepcionista |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| **BOOTSTRAP DEL SISTEMA** | | |
| Acceder a `/admin/db-setup` | ✅ | ❌ |
| Ejecutar migrations y seed | ✅ | ❌ |
| **HABITACIONES** | | |
| Ver listado y estado de habitaciones | ✅ | ✅ |
| Crear / editar habitación | ✅ | ❌ |
| Eliminar habitación | ✅ | ❌ |
| **HUÉSPEDES** | | |
| Ver datos de huéspedes | ✅ | ✅ |
| Registrar check-in (crear huésped + reserva) | ✅ | ✅ |
| Registrar check-out | ✅ | ✅ |
| **HISTORIAL** | | |
| Ver historial mensual de rentas | ✅ | ✅ |
| Ver resumen financiero mensual | ✅ | ❌ |
| **USUARIOS** | | |
| Crear / editar / suspender usuarios | ✅ | ❌ |
| **AUDITORÍA** | | |
| Ver bitácora de operaciones (Blob) | ✅ | ❌ |

### Comportamiento por rol

**Administrador**: acceso total. Configura el sistema (bootstrap), gestiona habitaciones, crea usuarios para el personal, consulta el historial completo con resumen financiero y revisa la auditoría.

**Recepcionista**: enfocado en la operación diaria. Consulta disponibilidad, registra check-ins, registra check-outs, consulta el historial de rentas. No accede a la configuración ni a información financiera agregada.

---

## 5. Casos de uso

### Módulo 1 — Bootstrap (admin)

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-B1 | Diagnosticar estado del sistema | Admin | Verifica conectividad con Supabase y Blob, migrations aplicadas y pendientes, conteo de registros por tabla. |
| CU-B2 | Aplicar migrations y seed | Admin | Ejecuta migrations pendientes y carga el seed inicial (admin + habitaciones de demo). |

### Módulo 2 — Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | El usuario ingresa correo y contraseña. El sistema valida y redirige al panel correspondiente. |
| CU-A2 | Cerrar sesión | Todos | El usuario cierra su sesión activa. |
| CU-A3 | Cambiar contraseña | Todos | El usuario actualiza su contraseña verificando la actual. |

### Módulo 3 — Habitaciones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Consultar disponibilidad | Todos | Ver listado de habitaciones con estado en tiempo real. Las ocupadas muestran huésped actual y fecha estimada de salida. |
| CU-H1 | Crear habitación | Admin | Registra una habitación con número, tipo, descripción y precio por noche. |
| CU-H2 | Editar habitación | Admin | Modifica datos de una habitación disponible. |
| CU-H3 | Eliminar habitación | Admin | Elimina una habitación que no tenga reservas activas o historial. Soft delete si tiene historial. |

### Módulo 4 — Check-in

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-02 | Registrar check-in | Recepcionista / Admin | Selecciona habitación disponible, registra datos del huésped (nombre, identificación, teléfono) y fechas de entrada y salida. El sistema cambia el estado de la habitación a ocupada. |

### Módulo 5 — Check-out

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-03 | Registrar check-out | Recepcionista / Admin | Selecciona la habitación a liberar. El sistema muestra los datos del huésped y calcula el total a pagar. El recepcionista confirma. El sistema registra la salida y libera la habitación. |

### Módulo 6 — Historial

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-04 | Ver historial mensual | Todos (según permisos) | Selecciona mes y año. El sistema muestra las rentas del período con datos de huésped, habitación, fechas y monto cobrado. El admin además ve el resumen financiero del mes. |

### Módulo 7 — Administración

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-Ad1 | Crear usuario | Admin | Crea un recepcionista o admin con contraseña temporal. |
| CU-Ad2 | Suspender usuario | Admin | Suspende acceso de un usuario sin eliminarlo. |
| CU-Ad3 | Ver bitácora | Admin | Consulta la auditoría de operaciones desde Blob, filtrada por mes. |

---

## 6. Requerimientos funcionales

### Bootstrap del sistema

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo los datos del seed local de `data/` para navegación inicial. |
| RF-B2 | El sistema debe ofrecer una página `/admin/db-setup` accesible solo al admin para diagnóstico, aplicación de migrations y carga del seed. |
| RF-B3 | Las migrations deben estar versionadas en `supabase/migrations/` y aplicarse en orden numérico. |
| RF-B4 | Una vez aplicadas las migrations y cargado el seed, el sistema debe persistir en Supabase. |

### Habitaciones

| ID | Requerimiento |
|---|---|
| RF-01 | El sistema debe mostrar el listado de habitaciones con su estado actual (disponible u ocupada). |
| RF-02 | Las habitaciones ocupadas deben mostrar el nombre del huésped actual y la fecha estimada de salida. |
| RF-03 | El admin puede registrar habitaciones con número, tipo, descripción y precio por noche. |
| RF-04 | El admin puede editar habitaciones disponibles. |

### Check-in

| ID | Requerimiento |
|---|---|
| RF-05 | El sistema debe permitir registrar el check-in de un huésped en una habitación disponible. |
| RF-06 | El check-in debe registrar: nombre, identificación, teléfono, fecha de entrada y fecha de salida del huésped. |
| RF-07 | Al confirmar el check-in, la habitación debe cambiar automáticamente a estado ocupada. |

### Check-out

| ID | Requerimiento |
|---|---|
| RF-08 | El sistema debe calcular automáticamente el total a pagar: precio por noche × días de estadía. |
| RF-09 | Al confirmar el check-out, la habitación debe cambiar automáticamente a estado disponible. |
| RF-10 | El registro de la renta debe quedar en el historial con fecha y hora real de salida y el monto cobrado. |

### Historial

| ID | Requerimiento |
|---|---|
| RF-11 | El sistema debe mostrar un historial de rentas consultable por mes y año. |
| RF-12 | El historial debe incluir: habitación, huésped, identificación, fechas, días de estadía y monto cobrado. |
| RF-13 | El administrador debe ver el total de rentas y el total de ingresos del mes consultado. |

### Auditoría

| ID | Requerimiento |
|---|---|
| RF-A1 | Toda operación de escritura (check-in, check-out, editar habitación, crear usuario) debe quedar registrada en auditoría. |
| RF-A2 | La auditoría se persiste en Vercel Blob, particionada por mes (`audit/<YYYYMM>.json`). |
| RF-A3 | El admin puede consultar la auditoría desde `/admin/audit` filtrada por mes. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | No se puede registrar un check-in si la habitación está ocupada. | Verificar `rooms.status = 'disponible'` antes de insertar en `dataService`. |
| RN-02 | No se puede completar el check-in sin todos los datos obligatorios del huésped. | Validación Zod en el servidor (campos requeridos). |
| RN-03 | La fecha de salida debe ser posterior a la fecha de entrada. | Validación Zod con `.refine()` que compara las dos fechas. |
| RN-04 | El total a pagar = precio por noche × días de estadía. Si la estadía es de menos de 1 día, se cobra 1 día mínimo. | Función en `bookingService.ts` usada tanto al calcular el check-out como en el historial. |
| RN-05 | Al registrar el check-out, la habitación queda disponible de forma automática e inmediata. | El `dataService` actualiza `rooms.status` en la misma operación transaccional que cierra la reserva. |
| RN-06 | Los datos del huésped se conservan en la base de datos aunque ya hayan hecho check-out. | Los registros de `guests` y `bookings` no se eliminan al hacer check-out; solo cambia el estado. |
| RN-07 | El historial de rentas se organiza y consulta por mes y año. | Query con `DATE_TRUNC('month', bookings.actual_checkout_at)` en Postgres. |
| RN-08 | Una habitación no puede ser editada si tiene una reserva activa (status = 'ocupada'). | Verificar en `dataService` antes de actualizar. |
| RN-09 | Una habitación con historial de rentas no puede eliminarse físicamente. | Soft delete: marcar `rooms.is_active = false`. |
| RN-10 | El sistema arranca en modo seed hasta que el admin ejecute el bootstrap. | Flag `getSystemMode()` en `dataService`. |
| RN-11 | Toda operación de escritura queda registrada en la auditoría de Vercel Blob. | `dataService.recordAudit()` llamado automáticamente en cada escritura. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones y entrada de componentes |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde la API de bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs de operaciones append-only |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                  # Conexión Postgres directa para migrations con pg

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Auth
JWT_SECRET=                    # Mínimo 32 caracteres aleatorios

# Bootstrap
ADMIN_BOOTSTRAP_SECRET=        # Secreto para autorizar /api/system/bootstrap
```

> Las variables sin prefijo `NEXT_PUBLIC_` solo se usan en código del servidor. Nunca aparecen en componentes con `'use client'`.

---

## 9. Arquitectura de persistencia

HostDesk usa **tres destinos de persistencia** con responsabilidades claramente separadas.

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Datos de dominio: usuarios, habitaciones, huéspedes, reservas. | Necesita queries SQL: filtros de estado, cálculos de totales, historial por mes con GROUP BY. |
| **Vercel Blob** | Auditoría de operaciones, particionada por mes (`audit/<YYYYMM>.json`). | Append-only, sin necesidad de SQL. Blob es ideal para logs. |
| **`data/` en el repo** | Seed inicial: `config.json`, `seed.json` con admin por defecto y habitaciones de demo. | Read-only en producción. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **Postgres es la fuente de verdad para datos de dominio.** Si un dato de habitación/reserva/usuario no está en Postgres, no existe.
2. **Blob es la fuente de verdad para auditoría.** No se duplica en Postgres.
3. **`data/` es solo semilla.** Nunca se escribe en runtime.
4. **`dataService.ts` es el ÚNICO punto de acceso a datos** desde el resto de la aplicación. Nadie importa `supabase.ts` ni `blobAudit.ts` directamente.
5. **CERO caché en memoria** para datos transaccionales. Cada lectura va directo a Postgres.
6. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
7. **CERO browser cache** para respuestas con datos. `withAuth` agrega `no-store` a cada respuesta.
8. **`get()` del SDK de Blob, nunca `fetch(url)`** — los blobs privados fallan silenciosamente con `fetch`.
9. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
10. **Read-modify-write sobre archivos de auditoría** se serializa con `withFileLock()`.

---

## 10. Bootstrap y migrations

### 10.1 Estructura del directorio `data/` (solo semilla)

```
data/
  config.json       ← { "version": "1.0", "system_name": "HostDesk" }
  seed.json         ← {
                        "users": [{ email, password_hash, role: "admin", name: "Administrador" }],
                        "rooms": [
                          { number: "101", type: "sencilla", price_per_night: 80000 },
                          { number: "102", type: "sencilla", price_per_night: 80000 },
                          { number: "201", type: "doble",    price_per_night: 120000 },
                          { number: "202", type: "doble",    price_per_night: 120000 },
                          { number: "301", type: "suite",    price_per_night: 200000 }
                        ]
                      }
  README.md         ← Instrucciones para el estudiante
```

> El `password_hash` se genera manualmente con un script antes de commitear. El hash de `admin123` con bcrypt 10 salt rounds queda hardcodeado en el seed.

### 10.2 Estructura de `supabase/migrations/`

```
supabase/
  migrations/
    0001_init_users.sql      ← Fase 1: tabla users + tabla _migrations
    0002_init_rooms.sql      ← Fase 3: tabla rooms
    0003_init_guests.sql     ← Fase 4: tabla guests
    0004_init_bookings.sql   ← Fase 5: tabla bookings
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id          SERIAL       PRIMARY KEY,
  filename    VARCHAR(255) UNIQUE NOT NULL,
  applied_at  TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 API Route de bootstrap

`POST /api/system/bootstrap` — autenticada con sesión admin **más** header `x-bootstrap-secret`. Hace:

1. Conecta a Postgres con `pg` y `DATABASE_URL`.
2. Crea `_migrations` si no existe.
3. Aplica migrations pendientes en orden numérico.
4. En la primera vez, carga el seed: inserta admin + 5 habitaciones de demo (saltando duplicados).
5. Retorna reporte: migrations aplicadas, registros insertados, errores.

### 10.5 API Route de diagnóstico

`GET /api/system/diagnose` — sesión admin. Retorna estado de Supabase, Blob, migrations pendientes y conteos por tabla.

### 10.6 Página `/admin/db-setup`

Dos tabs: **Diagnóstico** (estado completo) y **Bootstrap** (lista migrations pendientes + botón ejecutar con confirmación).

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations aplicadas | `data/*.json` (read-only) | Bloqueadas — solo login admin para ir a bootstrap. |
| **`live`** | Migrations aplicadas | Postgres vía `supabase-js` | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts      ← ÚNICO punto de acceso. API pública tipada.
  supabase.ts         ← Cliente Supabase server. Solo lo importa dataService.
  blobAudit.ts        ← Cliente Blob para auditoría. Solo lo importa dataService.
  pgMigrate.ts        ← Cliente pg para migrations. Solo lo importa /api/system/bootstrap.
  seedReader.ts       ← Lector de data/*.json. Solo lo importa dataService en modo seed.
  bookingService.ts   ← Lógica de negocio de reservas: cálculo de total, días de estadía.
  auth.ts             ← hashPassword, verifyPassword, createJWT, verifyJWT, cookies.
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Habitaciones
export async function getRooms(): Promise<RoomWithActiveGuest[]>  // incluye huésped activo si está ocupada
export async function getRoomById(id: string): Promise<Room | null>
export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room>
export async function updateRoom(id: string, userId: string, data: UpdateRoomRequest): Promise<Room>
export async function deactivateRoom(id: string, userId: string): Promise<Room>

// Huéspedes
export async function getGuestByIdentification(id: string): Promise<Guest | null>
export async function createGuest(data: CreateGuestRequest): Promise<Guest>
export async function updateGuest(id: string, data: UpdateGuestRequest): Promise<Guest>

// Reservas (check-in / check-out)
export async function checkIn(userId: string, data: CheckInRequest): Promise<Booking>
export async function checkOut(userId: string, bookingId: string): Promise<BookingWithTotal>
export async function getActiveBooking(roomId: string): Promise<BookingWithGuest | null>
export async function getBookingHistory(year: number, month: number): Promise<BookingHistoryItem[]>
export async function getMonthlyFinancialSummary(year: number, month: number): Promise<MonthlyFinancialSummary>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica de negocio en `lib/bookingService.ts`

```typescript
// Cálculo de días: diferencia entre check_out_date y check_in_date
// Si el resultado es 0 o negativo, se aplica 1 día mínimo (RN-04)
export function calculateNights(checkIn: Date, checkOut: Date): number

// Cálculo de total: nights × price_per_night
export function calculateTotal(nights: number, pricePerNight: number): number
```

Esta lógica vive en un servicio separado para poder reutilizarla en el check-out real y en el historial, garantizando consistencia.

### 11.5 Reglas de implementación del `dataService`

1. Cada función chequea `getSystemMode()` antes de operar.
2. `checkIn` verifica que la habitación esté disponible (RN-01) y valida todos los datos (RN-02, RN-03) antes de insertar.
3. `checkOut` calcula el total con `bookingService`, actualiza el estado de la habitación en la misma operación y registra `actual_checkout_at = NOW()`.
4. `updateRoom` verifica que la habitación no esté ocupada (RN-08) antes de modificarla.
5. Toda escritura llama `recordAudit()` antes de retornar.
6. `CERO caché en memoria` — cada llamada va a Postgres.

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
┌──────────┐       ┌──────────┐
│  users   │       │  rooms   │
└──────────┘       └──────────┘
                        │
                        │──<── bookings ──>── guests
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(20)  NOT NULL
                       CHECK (role IN ('admin', 'recepcionista')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id          SERIAL       PRIMARY KEY,
  filename    VARCHAR(255) UNIQUE NOT NULL,
  applied_at  TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_rooms.sql`

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  number         VARCHAR(10)   UNIQUE NOT NULL,
  type           VARCHAR(30)   NOT NULL
                 CHECK (type IN ('sencilla', 'doble', 'suite', 'familiar', 'otro')),
  description    TEXT,
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  status         VARCHAR(15)   DEFAULT 'disponible'
                 CHECK (status IN ('disponible', 'ocupada')),
  is_active      BOOLEAN       DEFAULT true,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(number);
```

### Migration `0003_init_guests.sql`

```sql
CREATE TABLE IF NOT EXISTS guests (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  identification VARCHAR(30)  NOT NULL,
  phone          VARCHAR(20),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guests_identification ON guests(identification);
```

> Los huéspedes no se eliminan aunque hayan hecho check-out (RN-06). Si el mismo huésped regresa, se reutiliza el registro existente buscando por `identification`.

### Migration `0004_init_bookings.sql`

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id           UUID          NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  guest_id          UUID          NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  check_in_date     DATE          NOT NULL,
  check_out_date    DATE          NOT NULL,
  actual_checkout_at TIMESTAMPTZ,                       -- NULL mientras está activa
  nights            INTEGER       NOT NULL CHECK (nights >= 1),
  price_per_night   DECIMAL(10,2) NOT NULL,             -- snapshot del precio al momento del check-in
  total_amount      DECIMAL(10,2),                      -- NULL hasta el check-out
  status            VARCHAR(15)   DEFAULT 'activa'
                    CHECK (status IN ('activa', 'completada')),
  checked_in_by     UUID          REFERENCES users(id) ON DELETE SET NULL,
  checked_out_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_checkout_date ON bookings(actual_checkout_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_month ON bookings(DATE_TRUNC('month', actual_checkout_at));
```

**Notas de diseño importantes:**

- **`price_per_night` en `bookings`**: el precio se guarda como snapshot al momento del check-in. Si el admin cambia el precio de la habitación después, las reservas pasadas mantienen el precio original. Esto garantiza la integridad del historial financiero.
- **`nights` calculado al check-in**: se calcula al crear la reserva con `bookingService.calculateNights()` y se persiste para que el historial no dependa de recalcular.
- **`total_amount` NULL hasta check-out**: refleja que el cobro aún no se ha realizado. Se llena en el momento del check-out.
- **`ON DELETE RESTRICT` en `room_id` y `guest_id`**: no se pueden eliminar habitaciones ni huéspedes que tengan reservas, incluso completadas. Garantiza integridad del historial.

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;           // UUID generado por dataService
  timestamp: string;    // ISO 8601
  user_id: string;
  user_email: string;
  user_role: 'admin' | 'recepcionista';
  action: 'check_in' | 'check_out' | 'create_room' | 'update_room' | 'deactivate_room'
        | 'create_user' | 'update_user' | 'toggle_user' | 'login' | 'logout' | 'bootstrap';
  entity: 'booking' | 'room' | 'user' | 'system';
  entity_id?: string;
  summary: string;      // Texto legible: "Check-in de Juan Pérez (CC 12345) en habitación 201"
  metadata?: Record<string, unknown>;
};
```

El campo `summary` hace que la bitácora sea legible directamente sin necesidad de joins.

### 13.2 Implementación de `lib/blobAudit.ts`

```typescript
// Solo lo importa dataService — nadie más

import { put, get } from '@vercel/blob';

const _fileLocks = new Map<string, Promise<unknown>>();

async function withFileLock<T>(filename: string, fn: () => Promise<T>): Promise<T> {
  const prev = _fileLocks.get(filename) ?? Promise.resolve();
  let resolve!: () => void;
  const lock = new Promise<void>((r) => { resolve = r; });
  _fileLocks.set(filename, lock);
  try {
    await prev;
    return await fn();
  } finally {
    resolve();
    if (_fileLocks.get(filename) === lock) _fileLocks.delete(filename);
  }
}

// Lazy — NUNCA constante de módulo. Los tokens no existen en build time.
function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export async function appendAudit(entry: AuditEntry): Promise<void> {
  const yyyymm = entry.timestamp.slice(0, 7).replace('-', '');
  const filename = `audit/${yyyymm}.json`;
  await withFileLock(filename, async () => {
    const existing = await readAuditFile(filename);
    existing.push(entry);
    await writeAuditFile(filename, existing);
  });
}

async function readAuditFile(filename: string): Promise<AuditEntry[]> {
  const token = getBlobToken();
  if (!token) return [];
  try {
    // ⚠️ get() del SDK — NUNCA fetch(url) para blobs privados
    const result = await get(filename, { token, access: 'private' });
    if (!result || result.statusCode !== 200) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function writeAuditFile(filename: string, entries: AuditEntry[]): Promise<void> {
  const token = getBlobToken();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  await put(filename, JSON.stringify(entries, null, 2), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}

export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]> {
  return readAuditFile(`audit/${yyyymm}.json`);
}
```

### 13.3 Estimación de uso en Blob

| Operación | Frecuencia estimada | Por mes (100 reservas) |
|---|---|---|
| Check-in (1 entrada) | ~100/mes | ~40 KB |
| Check-out (1 entrada) | ~100/mes | ~40 KB |
| Otras operaciones (rooms, users) | ~20/mes | ~8 KB |
| **Total mensual** | | **~90 KB** |

> En varios años de operación, la auditoría total no supera los 100 MB. Plan gratuito de Vercel Blob: 1 GB.

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                       ← Redirige según sesión
  login/page.tsx                 ← Primera cara del sistema
  dashboard/page.tsx             ← Panel principal por rol
  rooms/
    page.tsx                     ← Listado de habitaciones (estado en tiempo real)
    new/page.tsx                 ← Crear habitación (solo admin)
    [id]/
      page.tsx                   ← Detalle de habitación
      edit/page.tsx              ← Editar habitación (solo admin)
  checkin/
    page.tsx                     ← Formulario de check-in
  checkout/
    page.tsx                     ← Lista de habitaciones ocupadas para check-out
    [bookingId]/page.tsx         ← Confirmar check-out con resumen del cobro
  history/
    page.tsx                     ← Historial mensual de rentas
  admin/
    db-setup/page.tsx            ← Bootstrap (solo admin)
    users/page.tsx               ← Gestión de usuarios (solo admin)
    audit/page.tsx               ← Bitácora desde Blob (solo admin)
  api/
    system/
      bootstrap/route.ts
      diagnose/route.ts
      mode/route.ts
    auth/
      login/route.ts
      logout/route.ts
      me/route.ts
      change-password/route.ts
    rooms/
      route.ts                   ← GET | POST
      [id]/route.ts              ← GET | PUT | DELETE
    checkin/route.ts             ← POST: registra check-in
    checkout/
      [bookingId]/route.ts       ← POST: confirma check-out
    history/route.ts             ← GET: historial mensual
    history/summary/route.ts     ← GET: resumen financiero (solo admin)
    users/
      route.ts
      [id]/route.ts
    audit/route.ts               ← GET: lee auditoría de Blob

components/
  ui/                            ← Button, Card, Badge, Toast, Modal, EmptyState, Table
  layout/                        ← AppLayout, Sidebar, Navbar, SeedModeBanner
  rooms/                         ← RoomCard, RoomStatusBadge, RoomGrid
  checkin/                       ← CheckInForm, GuestForm
  checkout/                      ← CheckOutSummary, CheckOutConfirm
  history/                       ← HistoryTable, MonthSelector, FinancialSummary
  admin/                         ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  types.ts
  schemas.ts
  auth.ts
  withAuth.ts
  withRole.ts
  dataService.ts                 ← ÚNICO punto de acceso
  supabase.ts                    ← Solo importa dataService
  blobAudit.ts                   ← Solo importa dataService
  pgMigrate.ts                   ← Solo importa /api/system/bootstrap
  seedReader.ts                  ← Solo importa dataService en modo seed
  bookingService.ts              ← Lógica de cálculo de noches y total
  dateUtils.ts

supabase/
  migrations/
    0001_init_users.sql
    0002_init_rooms.sql
    0003_init_guests.sql
    0004_init_bookings.sql

data/
  config.json
  seed.json
  README.md

doc/
  PLAN_HOSTDESK.md
  PROMPTS_HOSTDESK.md
  ESTADO_EJECUCION_HOSTDESK.md
```

### Patrón de acceso a datos

```
[Componente React (client)]
         ↓  fetch('/api/...')
[API Route]
         ↓  withAuth + withRole
         ↓  llama
[lib/dataService.ts]
         ├─→ Postgres (dominio)      vía supabase.ts
         └─→ Vercel Blob (auditoría) vía blobAudit.ts
```

---

## 15. Requerimientos no funcionales

### Rendimiento

| ID | Requerimiento |
|---|---|
| RNF-01 | El panel de habitaciones debe cargar en menos de 2 segundos con el estado real de cada habitación. |
| RNF-02 | El proceso de check-in completo (validación + inserción + actualización de estado) debe completarse en menos de 2 segundos. |
| RNF-03 | El historial mensual debe cargar en menos de 3 segundos incluso con 200 reservas en el mes. |

### Usabilidad

| ID | Requerimiento |
|---|---|
| RNF-04 | El recepcionista debe poder completar un check-in en menos de 2 minutos. |
| RNF-05 | El panel de habitaciones debe mostrar el estado en tiempo real con un solo vistazo (color verde = disponible, color rojo = ocupada). |
| RNF-06 | Los formularios deben mantener los datos ingresados si la validación falla. |
| RNF-07 | El sistema debe ser completamente funcional en tabletas y celulares (muchos recepcionistas trabajan desde dispositivos móviles). |

### Seguridad

| ID | Requerimiento |
|---|---|
| RNF-08 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-09 | Las sesiones deben gestionarse con JWT en cookie HttpOnly. |
| RNF-10 | Toda escritura debe registrarse en auditoría sin bloquear la respuesta principal. |
| RNF-11 | El endpoint de bootstrap requiere sesión admin y `ADMIN_BOOTSTRAP_SECRET`. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Login | Sistema en modo seed. Admin entra con credenciales del `data/seed.json`. |
| 2 | Dashboard | Banner: "El sistema está en modo seed. Ejecuta el bootstrap desde Configuración." |
| 3 | /admin/db-setup | Admin ve diagnóstico y migrations pendientes. |
| 4 | /admin/db-setup | Admin hace clic en "Ejecutar bootstrap". Confirma. |
| 5 | Procesando | Corre 4 migrations + inserta admin y 5 habitaciones de demo. |
| 6 | Completado | Modo live. Banner desaparece. Sistema operativo. |

### Flujo de check-in

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Dashboard / Habitaciones | Recepcionista ve el panel con las habitaciones disponibles (verde). |
| 2 | Habitaciones | Hace clic en una habitación disponible. |
| 3 | Check-in | El sistema lleva al formulario pre-llenado con la habitación seleccionada. |
| 4 | Check-in | Recepcionista ingresa: nombre, identificación, teléfono, fecha de entrada y fecha de salida. |
| 5 | Check-in | El sistema valida los datos y muestra un resumen: habitación, huésped, noches, total estimado. |
| 6 | Check-in | Recepcionista confirma. El sistema registra la reserva y cambia la habitación a ocupada (rojo). |
| 7 | Habitaciones | La habitación ahora muestra nombre del huésped y fecha de salida. |

### Flujo de check-out

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Check-out | Recepcionista ve la lista de habitaciones ocupadas. |
| 2 | Check-out | Selecciona la habitación a liberar. |
| 3 | Confirmación | El sistema muestra: datos del huésped, fechas, noches de estadía y total a cobrar. |
| 4 | Confirmación | Recepcionista confirma el cobro. |
| 5 | Completado | El sistema registra el check-out con hora real de salida. La habitación vuelve a verde. |
| 6 | Historial | La renta queda registrada en el historial del mes. |

---

## 17. Diseño de interfaz

### Identidad visual del Login

El login transmite calidez profesional y confianza — la primera impresión de un software de recepción.

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado vertical y horizontalmente. |
| **Fondo** | Crema cálido (`#FDF8F0`) con un patrón geométrico muy sutil tipo rombo o cuadrícula, opacidad baja. |
| **Tarjeta del formulario** | Fondo blanco (`#FFFFFF`), `border-radius: 14px`, sombra media (`0 8px 32px rgba(139, 69, 19, 0.10)`), borde izquierdo decorativo de 4px en terracota (`#C0714A`), padding generoso, max-w-sm. |
| **Logo** | SVG inline de una llave estilizada (una sola línea, geométrica) en terracota (`#C0714A`), 52×52px, centrado. |
| **Nombre del sistema** | "HostDesk" en Inter Bold 30px, color chocolate oscuro (`#3D1A00`). |
| **Tagline** | "Gestión de hospedaje en tiempo real." Inter Regular 13px, gris cálido (`#7A6255`). |
| **Campos** | Inputs con borde crema oscuro (`#D6C4B0`), focus con borde terracota (`#C0714A`), labels en chocolate. |
| **Botón principal** | "Ingresar" — terracota `#C0714A`, texto blanco, `border-radius: 8px`, hover `#A0593A`. |
| **Pie de la tarjeta** | Texto pequeño en gris cálido: "Sistema de Gestión de Habitaciones". Sin link de "crear cuenta" — los usuarios los crea el admin. |
| **Animación de entrada** | Framer Motion: tarjeta con `opacity: 0→1` y `y: 16→0`, duración 0.45s, ease `easeOut`. |

### Paleta de colores

| Elemento | Hex | Uso |
|---|---|---|
| Fondo principal | `#FDF8F0` | Crema cálido — fondo de toda la app |
| Fondo de tarjetas | `#FFFFFF` | Tarjetas y paneles |
| Fondo alterno | `#FAF3E8` | Filas pares de tablas, secciones alternas |
| Primario (terracota) | `#C0714A` | Botones, acciones principales, borde login |
| Primario oscuro | `#A0593A` | Hover de botones |
| Texto principal | `#3D1A00` | Chocolate oscuro |
| Texto secundario | `#7A6255` | Gris cálido |
| Disponible (verde) | `#16803C` | Estado de habitación libre |
| Fondo disponible | `#F0FDF4` | Card de habitación disponible |
| Ocupada (rojo) | `#B91C1C` | Estado de habitación ocupada |
| Fondo ocupada | `#FEF2F2` | Card de habitación ocupada |
| Alerta / advertencia | `#D97706` | Advertencias, habitaciones próximas a liberar |
| Error | `#DC2626` | Mensajes de error |
| Bordes | `#D6C4B0` | Bordes de inputs y tarjetas |
| Bordes suaves | `#EDE3D6` | Separadores |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` | Banner hasta ejecutar bootstrap |

### Tipografía

| Elemento | Fuente | Tamaño | Peso |
|---|---|---|---|
| Títulos principales | Inter | 24px | Bold 700 |
| Títulos de sección | Inter | 18px | SemiBold 600 |
| Cuerpo | Inter | 14px | Regular 400 |
| Secundario | Inter | 12px | Regular 400 |
| Números (precios, totales) | Inter | 16px | Medium 500 |
| Números de habitación | Inter | 20px | Bold 700 |

### Componentes clave

| Componente | Descripción |
|---|---|
| `RoomCard` | Card de habitación con número grande (bold), tipo, precio por noche. Fondo verde + badge "Disponible" si libre, fondo rojo + nombre del huésped + fecha salida si ocupada. |
| `RoomGrid` | Grilla de RoomCards — 4 columnas desktop, 2 tablet, 1 mobile. Vista principal de operación. |
| `RoomStatusBadge` | Badge color por estado: verde "Disponible", rojo "Ocupada". |
| `CheckInForm` | Formulario de check-in con los datos del huésped y las fechas. Muestra total estimado calculado en tiempo real mientras el recepcionista elige fechas. |
| `CheckOutSummary` | Panel con datos del huésped, noches de estadía, precio y total a cobrar en grande. Botón de confirmación prominente. |
| `HistoryTable` | Tabla densa del historial: habitación, huésped, identificación, fechas, noches, monto. |
| `MonthSelector` | Selector de mes y año con navegación ← → para el historial. |
| `FinancialSummary` | Tarjetas de resumen solo visibles para admin: total de rentas del mes, total de ingresos, habitación más rentada. |
| `SeedModeBanner` | Banner amarillo persistente en el dashboard cuando el sistema está sin bootstrapear. Solo admin. |
| `AuditViewer` | Tabla de auditoría con filtro por mes. Muestra timestamp, usuario, acción y texto del `summary`. |
| `Toast` | Notificación temporal en esquina inferior derecha: éxito (verde), error (rojo), advertencia (naranja). |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo + panel de habitaciones en grilla de 4 columnas. |
| Tablet (768–1023px) | Sidebar colapsable + grilla de 2 columnas. |
| Celular (<768px) | Bottom navigation + habitaciones en lista vertical (1 columna). Formularios optimizados para teclado táctil. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad
> Reemplaza el "Hola Mundo". Establece la arquitectura completa de persistencia.

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel (Private). Configurar todas las variables de entorno en `.env.local` y en Vercel. |
| 1.3 | Crear estructura `data/`: `config.json`, `seed.json` con admin inicial (password `admin123` ya hasheado con bcrypt 10 rounds) y 5 habitaciones de demo, `README.md`. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con tabla `users` (incluyendo `must_change_password`) y `_migrations`. |
| 1.5 | Crear `lib/supabase.ts`: cliente Supabase para server con service role. |
| 1.6 | Crear `lib/blobAudit.ts`: `appendAudit`, `readAuditMonth`, `withFileLock`, `getBlobToken()` lazy. Usar siempre `get()` del SDK, nunca `fetch(url)`. |
| 1.7 | Crear `lib/pgMigrate.ts`: aplica migrations pendientes comparando archivos en `supabase/migrations/` con tabla `_migrations`. |
| 1.8 | Crear `lib/seedReader.ts`: lee `data/seed.json` y `data/config.json`. |
| 1.9 | Crear `lib/dataService.ts` con `getSystemMode()`, auth de usuarios, y `recordAudit()`. En modo `seed` enruta a `seedReader`; en modo `live` a Supabase. |
| 1.10 | Crear `lib/auth.ts`: `hashPassword`, `verifyPassword`, `createJWT`, `verifyJWT`, `getTokenFromCookie`, `setSessionCookie`, `clearSessionCookie`. |
| 1.11 | Crear `lib/withAuth.ts` y `lib/withRole.ts`. `withAuth` agrega `Cache-Control: no-store` a la respuesta. |
| 1.12 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.13 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas Zod base. |
| 1.14 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`. |
| 1.15 | Crear `app/login/page.tsx` con la identidad visual de HostDesk: logo de llave, paleta terracota y crema, animación. Sin link de "Crear cuenta". |
| 1.16 | Actualizar `app/page.tsx`: redirige a `/dashboard` si hay sesión, a `/login` si no. |
| 1.17 | `npm run typecheck` sin errores. Probar: login admin del seed → `/api/system/mode` retorna `seed` → cookie HttpOnly verificada. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast (+ hook), Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta terracota/crema en `globals.css`. Configurar Inter con `next/font`. |
| 2.3 | Crear `components/layout/AppLayout.tsx`: sidebar (desktop), bottom nav (mobile), header con nombre del usuario y rol. Sidebar filtra ítems según rol (el recepcionista no ve `/admin/*`). |
| 2.4 | Crear `app/admin/db-setup/page.tsx`: tab Diagnóstico (estado Supabase, Blob, migrations, conteos) y tab Bootstrap (botón ejecutar con confirmación). |
| 2.5 | Crear `components/layout/SeedModeBanner.tsx`: banner amarillo persistente cuando el sistema está en modo seed. Solo visible para admin. Link a `/admin/db-setup`. |
| 2.6 | Crear `GET /api/dashboard`: datos según rol. Admin ve conteo de habitaciones (disponibles/ocupadas), ingresos del día. Recepcionista ve solo conteo de habitaciones. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx`: tarjetas de resumen según rol, banner de modo seed si aplica. |
| 2.8 | Crear `middleware.ts`: protege rutas privadas y verifica rol para `/admin/*`. |
| 2.9 | Probar: login admin → banner → /admin/db-setup → bootstrap → banner desaparece → modo live. |

---

### Fase 3 — Gestión de Habitaciones
> Rol: Ingeniero Fullstack Senior + Diseñador Frontend

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_rooms.sql`. Aplicar desde `/admin/db-setup`. |
| 3.2 | Tipos `Room`, `RoomWithActiveGuest`, `CreateRoomRequest`, `UpdateRoomRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getRooms` (con join a booking activo para mostrar huésped), `getRoomById`, `createRoom`, `updateRoom` (valida RN-08 — no editar si ocupada), `deactivateRoom` (valida RN-09 — soft delete si tiene historial). Cada escritura llama `recordAudit`. |
| 3.4 | API Routes con permisos correctos: `GET /api/rooms` (todos), `POST /api/rooms` (`withRole(['admin'])`), `GET/PUT/DELETE /api/rooms/[id]` (GET todos, PUT/DELETE solo admin). |
| 3.5 | Crear `app/rooms/page.tsx`: vista principal del sistema. `RoomGrid` con `RoomCard` por habitación. Verde = disponible (precio por noche). Rojo = ocupada (nombre del huésped + fecha de salida estimada). |
| 3.6 | Desde una habitación disponible: botón "Registrar Check-in" que navega a `/checkin?roomId=...`. |
| 3.7 | Crear `app/rooms/new/page.tsx` y `app/rooms/[id]/edit/page.tsx` (solo admin). |
| 3.8 | El seed inicial ya tiene 5 habitaciones — verificar que se muestran correctamente tras el bootstrap. |

---

### Fase 4 — Huéspedes y Check-in
> Rol: Ingeniero Fullstack — Flujo de entrada del hospedaje

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_guests.sql` y `0004_init_bookings.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Crear `lib/bookingService.ts`: `calculateNights(checkIn, checkOut): number` (mínimo 1 por RN-04) y `calculateTotal(nights, pricePerNight): number`. |
| 4.3 | Tipos `Guest`, `Booking`, `BookingWithGuest`, `CheckInRequest` y schemas Zod (RN-02 campos obligatorios, RN-03 fecha salida posterior a entrada). |
| 4.4 | Extender `dataService`: `getGuestByIdentification` (para reutilizar huéspedes que regresan), `createGuest`, `checkIn` (verifica RN-01 — habitación disponible, inserta en `guests` si es nuevo o reutiliza existente, inserta en `bookings` con nights calculado, actualiza `rooms.status = 'ocupada'`). `checkIn` llama `recordAudit`. |
| 4.5 | API Route `POST /api/checkin` con `withAuth` (ambos roles pueden hacer check-in). |
| 4.6 | Crear `app/checkin/page.tsx` como Client Component. Pre-llena la habitación si viene `?roomId=` en la URL. |
| 4.7 | `CheckInForm`: campos de huésped (nombre, identificación, teléfono), date pickers para fechas, cálculo en tiempo real del total estimado mientras el recepcionista elige las fechas. Badge con el precio por noche de la habitación seleccionada. |
| 4.8 | Si el huésped ya existe por identificación, el sistema pre-llena nombre y teléfono para ahorrar tiempo al recepcionista. |
| 4.9 | Confirmación: modal con resumen del check-in antes de guardar. Al confirmar, navega a `/rooms` y muestra la habitación ahora ocupada. |

---

### Fase 5 — Check-out y Cálculo de Total
> Rol: Ingeniero Fullstack — Flujo de salida y cobro

| # | Tarea |
|---|---|
| 5.1 | Extender `dataService`: `getActiveBooking(roomId)` (devuelve la reserva activa con datos del huésped), `checkOut` (calcula total con `bookingService.calculateTotal`, actualiza `bookings.total_amount`, `bookings.actual_checkout_at = NOW()`, `bookings.status = 'completada'`, `bookings.checked_out_by`, y `rooms.status = 'disponible'`). `checkOut` llama `recordAudit`. |
| 5.2 | API Route `POST /api/checkout/[bookingId]` con `withAuth`. |
| 5.3 | Crear `app/checkout/page.tsx`: lista de habitaciones ocupadas con botón "Check-out" por cada una. |
| 5.4 | Crear `app/checkout/[bookingId]/page.tsx`: `CheckOutSummary` con datos del huésped, fechas, noches de estadía, precio por noche y **total a cobrar en grande**. Botón "Confirmar check-out y cobro". |
| 5.5 | Al confirmar: el sistema procesa el check-out, muestra toast de éxito con el total cobrado, y redirige al panel de habitaciones donde la habitación aparece de nuevo en verde. |
| 5.6 | Desde `app/rooms/page.tsx`, las habitaciones ocupadas también tienen botón "Checkout" directo para agilizar el flujo. |

---

### Fase 6 — Historial Mensual
> Rol: Ingeniero Fullstack + Diseñador Frontend

| # | Tarea |
|---|---|
| 6.1 | Extender `dataService`: `getBookingHistory(year, month)` (query con `DATE_TRUNC('month', actual_checkout_at)`, join con rooms y guests), `getMonthlyFinancialSummary(year, month)` (total de rentas, suma de ingresos, habitación más rentada — solo para admin). |
| 6.2 | API Routes: `GET /api/history?year=&month=` (ambos roles), `GET /api/history/summary?year=&month=` (`withRole(['admin'])`). |
| 6.3 | Crear `app/history/page.tsx`: `MonthSelector` para navegar entre meses, `HistoryTable` con paginación (25 por página), total de registros del mes. |
| 6.4 | Si el usuario es admin, mostrar `FinancialSummary` encima de la tabla: tarjetas con total de rentas, total de ingresos del mes y habitación más rentada. |
| 6.5 | Si no hay rentas en el mes seleccionado: `EmptyState` con mensaje "Sin registros para [Mes Año]". |

---

### Fase 7 — Administración de Usuarios
> Rol: Ingeniero Fullstack Senior

| # | Tarea |
|---|---|
| 7.1 | API Routes con `withRole(['admin'])`: `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]`. |
| 7.2 | El POST genera contraseña temporal aleatoria de 12 caracteres alfanuméricos, la hashea, marca `must_change_password=true`, y la retorna EN CLARO una sola vez. La UI la muestra en modal con botón "Copiar" y advertencia de que es la única vez que se verá. |
| 7.3 | En el flujo de login: si `must_change_password=true`, redirigir a `/change-password` antes del dashboard. Después del cambio, marcar `must_change_password=false`. |
| 7.4 | Crear `app/admin/users/page.tsx`: tabla con nombre, email, rol, estado, último acceso. Acciones: activar/suspender, eliminar. |
| 7.5 | El admin no puede eliminar ni suspender su propia cuenta. |
| 7.6 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con `MonthSelector`. Lee de `dataService.readAuditMonth()` y muestra `timestamp`, `user_email`, `action` y `summary` en tabla. |
| 7.7 | API Route `GET /api/audit?month=YYYYMM` con `withRole(['admin'])`. |

---

### Fase 8 — Pulido final y Deploy
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 8.1 | Auditoría de empty states en todos los módulos: habitaciones sin registrar, historial vacío, sin usuarios, auditoría vacía. |
| 8.2 | Manejo de errores global: error de red, 401 (sesión expirada → toast + redirect a login), 403 (sin permisos → toast), 500 (error servidor → toast genérico). |
| 8.3 | Verificar que el flujo completo funciona en celular: grilla de habitaciones → seleccionar habitación disponible → formulario de check-in → confirmar → ver habitación ocupada → check-out → confirmar → ver habitación disponible. |
| 8.4 | Verificar que el recepcionista no puede acceder a ninguna ruta de `/admin/*` (probarlo directamente en la URL). |
| 8.5 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores y cero warnings. |
| 8.6 | Verificar que ningún componente cliente importa `dataService`, `supabase`, `blobAudit` ni variables privadas de entorno. |
| 8.7 | Deploy en Vercel con todas las variables de entorno configuradas. |
| 8.8 | Probar en producción el flujo completo con ambos roles: admin hace bootstrap → crea un recepcionista → recepcionista hace login → completa un check-in → completa el check-out → admin consulta el historial y la auditoría. |

---

## 19. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. dataService.getUserByEmail(email)  ← enruta a seed o Postgres
3. Verificar is_active y password con bcrypt.compare()
4. Si must_change_password=true → JWT con flag → redirect a /change-password
5. Generar JWT (payload: { userId, role, email }, expira 24h)
6. Cookie HttpOnly, Secure, SameSite=Strict
7. dataService.recordAudit({ action: 'login', ... })
8. Retornar SafeUser (sin password_hash)
```

### Aislamiento de roles

Cada API Route que modifica datos usa `withRole(['admin'])` o `withRole(['admin', 'recepcionista'])` explícitamente, según la matriz de permisos. La UI oculta botones que el usuario no puede usar, pero el backend valida el rol igualmente.

### Seguridad del bootstrap

`POST /api/system/bootstrap` requiere sesión válida con `role='admin'` **más** header `x-bootstrap-secret` igual a `ADMIN_BOOTSTRAP_SECRET`. Doble protección.

### Headers de caché

```typescript
// next.config.ts + withAuth — triple defensa
{ 'Cache-Control': 'no-store, no-cache, must-revalidate' }
{ 'Pragma': 'no-cache' }
```

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Requiere conexión a internet | Aplicación web sin modo offline. |
| RS-02 | Navegadores modernos | Chrome, Firefox, Safari, Edge actualizados. |
| RS-03 | Sin pagos integrados | El sistema calcula el total pero no procesa pagos. El cobro es responsabilidad del recepcionista. |
| RS-04 | Sin reservas anticipadas | En v1 solo se gestionan huéspedes presentes (check-in inmediato). No hay reservas con anticipación. |
| RS-05 | Bootstrap obligatorio | Hasta no aplicar migrations + seed, el sistema solo permite login admin. |
| RS-06 | Auditoría no editable | Las entradas en Blob son append-only. |
| RS-07 | Tipos de habitación fijos | En v1: sencilla, doble, suite, familiar, otro. |
| RS-08 | Un huésped activo por habitación | Una habitación solo puede tener un check-in activo a la vez. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed para activar Supabase. |
| **Modo seed** | Estado del sistema antes del bootstrap. Solo permite login admin. |
| **Modo live** | Estado normal del sistema. Todo persiste en Supabase. |
| **Migration** | Archivo SQL versionado en `supabase/migrations/` que crea o modifica el esquema. |
| **Seed** | Datos iniciales en `data/seed.json`. Admin + habitaciones de demo. |
| **dataService** | Único punto de acceso a datos. Encapsula Supabase, Blob y el seed reader. |
| **Auditoría** | Registro append-only de operaciones en Vercel Blob, particionada por mes. |
| **Check-in** | Registro de la llegada de un huésped a una habitación. |
| **Check-out** | Registro de la salida del huésped y cálculo del total a cobrar. |
| **Habitación disponible** | Habitación sin check-in activo. Puede recibir un nuevo huésped. |
| **Habitación ocupada** | Habitación con un check-in activo. No puede recibir otro huésped hasta el check-out. |
| **Reserva activa** | Registro en `bookings` con `status = 'activa'` y sin `actual_checkout_at`. |
| **Snapshot de precio** | El precio por noche se guarda en la reserva al momento del check-in para preservar el historial financiero. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio de Vercel para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Camilo Moreno — Doc: 1082932051
> Curso: Lógica y Programación — SIST0200
