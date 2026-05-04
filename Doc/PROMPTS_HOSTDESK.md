# PROMPTS DE IMPLEMENTACIÓN — HostDesk
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_HOSTDESK.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_HOSTDESK.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_HOSTDESK.md
2. Leer doc/ESTADO_EJECUCION_HOSTDESK.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_HOSTDESK.md
y crear el archivo doc/ESTADO_EJECUCION_HOSTDESK.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, persistencia y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de la primera experiencia visual del usuario.

Tu mentalidad: en Vercel el filesystem es de solo lectura — cada dato que
no vaya a Supabase o a Blob se pierde cuando la instancia muere. La arquitectura
de esta fase no es negociable: dataService como único punto de acceso,
blobAudit como driver interno, tokens lazy, cero caché en memoria, headers
no-store en toda la cadena. El login es la primera cara del sistema — debe
transmitir la identidad de HostDesk desde el primer segundo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — especialmente las secciones 8 (stack y variables
   de entorno), 9 (reglas de oro de la arquitectura de persistencia), 10
   (estructura de data/ y del bootstrap), 11 (estructura interna de lib/ y
   reglas de implementación del dataService), 13 (implementación de blobAudit
   con withFileLock y getBlobToken lazy) y 17 (identidad visual del login)
2. doc/ESTADO_EJECUCION_HOSTDESK.md — registra el inicio de la Fase 1

El plan tiene todo lo que necesitas: SQL de la migration 0001, la estructura
exacta de data/seed.json, la lista completa de funciones de auth.ts, el
patrón de withAuth y withRole, los endpoints necesarios y la especificación
visual completa del login (paleta terracota/crema, logo de llave, tagline,
animación Framer Motion).

Puntos críticos que no puedes ignorar:

— El token de Blob se accede siempre con getBlobToken() como función lazy,
  nunca como constante de módulo. Si lo defines como const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN en el cuerpo del módulo, fallará en
  build time porque las variables de entorno no existen en ese momento.

— La auditoría en blobAudit.ts usa get() del SDK de @vercel/blob, nunca
  fetch(url). Los blobs privados devuelven 401 silencioso con fetch —
  el error nunca aparece, simplemente no hay datos.

— withFileLock serializa las escrituras al mismo archivo de auditoría dentro
  de la misma instancia. Es necesario porque appendAudit es read-modify-write:
  sin el lock, dos requests concurrentes leen el mismo array, ambos hacen push,
  y el segundo sobrescribe el primero.

— dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts.
  Las API Routes importan solo de dataService. Ningún componente del cliente
  importa ningún archivo de lib/ directamente.

— En modo seed el sistema solo permite el login del admin y navegación básica.
  Cualquier intento de escritura (crear usuario, hacer check-in) debe retornar
  un error claro: "El sistema está en modo seed. Ejecuta el bootstrap primero."

— El error de login debe ser siempre genérico: "Correo o contraseña incorrectos".
  Nunca especificar si el correo no existe o si la contraseña está mal —
  esa distinción ayuda a los atacantes.

— Cookie de sesión: HttpOnly, Secure, SameSite=Strict. Nunca localStorage.

— La identidad visual del login no es opcional: logo SVG de llave geométrica,
  paleta terracota y crema, animación de entrada con Framer Motion, tagline
  exacto. Sin link de "Crear cuenta" — los usuarios los crea el admin.

— next.config.ts debe tener headers no-store para /api/:path* desde el
  principio. withAuth también debe agregarlos a cada respuesta. Triple defensa:
  next.config + withAuth + rutas públicas sin auth con headers explícitos.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin del seed → /api/system/mode retorna 'seed' → cookie
  HttpOnly verificada en DevTools → logout → /dashboard sin sesión redirige
  a /login
- Registra el cierre en ESTADO_EJECUCION_HOSTDESK.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout base y página de bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. El layout es la estructura que organiza todo lo que
viene. La página de bootstrap es la herramienta que activa el sistema — debe
ser clara, informativa y con retroalimentación precisa de cada paso.

Tu mentalidad: HostDesk tiene dos roles con vistas distintas. El administrador
necesita ver números financieros; el recepcionista solo necesita saber cuántas
habitaciones hay disponibles ahora mismo. El sidebar no debe mostrar opciones
que el usuario no puede usar.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — sección 17 (paleta terracota/crema completa,
   tipografía, componentes clave incluyendo SeedModeBanner), sección 4
   (matriz de permisos — qué ve cada rol), la Fase 2 del plan
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica que la Fase 1 esté completada
   y registra el inicio de la Fase 2

Puntos críticos que no puedes ignorar:

— El sidebar filtra sus ítems según el rol del usuario autenticado. El
  recepcionista nunca debe ver los ítems de /admin/*. Esto no es solo UX —
  es seguridad en profundidad. El backend ya lo protege con withRole, pero
  la UI no debe ni siquiera sugerir que esas rutas existen para ese rol.

— El dashboard tiene dos versiones: admin (conteo de habitaciones disponibles
  y ocupadas + ingresos del día si hay datos) y recepcionista (solo conteo de
  habitaciones). La API /api/dashboard devuelve datos distintos según el rol
  del JWT — implementa esta diferencia en el endpoint.

— En modo seed, el dashboard muestra el SeedModeBanner. Es un banner amarillo
  persistente con texto claro y link a /admin/db-setup. Solo el admin lo ve.
  El recepcionista creado en modo seed no existe todavía, así que esto aplica
  solo al admin del seed.

— La página /admin/db-setup debe dar información útil y real: si Supabase
  responde (ping con SELECT 1), si Blob responde (list() con limit 1),
  cuántas migrations están aplicadas vs cuántas existen en el repo, conteo
  de registros por tabla. Botón "Ejecutar bootstrap" con modal de confirmación
  que explique qué va a hacer: "Esto aplicará 4 migrations y cargará el seed
  inicial (admin + 5 habitaciones de demo)."

— El middleware.ts protege las rutas privadas. Si el usuario no tiene sesión,
  redirige a /login. Si el usuario tiene sesión pero no tiene role='admin' y
  está accediendo a /admin/*, redirige a /dashboard.

Al terminar:
- Probar el flujo completo: login admin seed → ver SeedModeBanner → ir a
  /admin/db-setup → ejecutar bootstrap → verificar que el banner desaparece
  y /api/system/mode retorna 'live' → verificar que las 5 habitaciones de
  demo aparecen en el diagnóstico (conteo de rooms = 5)
- Verificar responsive en 375px, 768px y 1280px
- npm run typecheck
- Registra el cierre en ESTADO_EJECUCION_HOSTDESK.md
- Crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Habitaciones

### Rol: `Ingeniero Fullstack Senior + Diseñador Frontend — Vista principal de operación`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior y Diseñador Frontend
trabajando en conjunto. El módulo de habitaciones es la vista principal del
sistema — lo primero que ve el recepcionista al entrar y lo que usa decenas
de veces al día. El diseño y la funcionalidad son igualmente importantes.

Tu mentalidad: el recepcionista necesita saber de un solo vistazo qué
habitaciones están libres y cuáles están ocupadas. Verde = disponible,
rojo = ocupada. Sin ambigüedad. Sin tener que leer texto para entender el
estado. Y desde esa misma vista, con un solo clic, debe poder iniciar un
check-in o un check-out.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — modelo de datos de rooms (migration 0002),
   reglas RN-08 y RN-09, la sección de componentes (RoomCard, RoomGrid,
   RoomStatusBadge) y la Fase 3 del plan
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— getRooms() en el dataService debe devolver RoomWithActiveGuest: para cada
  habitación ocupada, incluir en el objeto el nombre del huésped actual y
  la fecha de salida esperada. Esto requiere un LEFT JOIN entre rooms y
  bookings WHERE bookings.status = 'activa'. La UI no debe hacer una llamada
  adicional para obtener estos datos.

— El RoomCard de una habitación ocupada muestra: número de habitación, tipo,
  nombre del huésped y fecha estimada de salida (formateada en español y zona
  horaria America/Bogota). El RoomCard disponible muestra: número, tipo y
  precio por noche. En ambos casos el estado es visual inmediato por color
  de fondo y badge.

— Desde el RoomCard disponible: botón "Registrar Check-in" que navega a
  /checkin?roomId=<id>. Desde el RoomCard ocupado: botón "Check-out" que
  navega a /checkout/<bookingId>. Estos botones son la forma principal de
  navegar al flujo — el recepcionista no necesita ir a un menú separado.

— Solo el admin puede crear, editar o eliminar habitaciones. El recepcionista
  no ve esos botones. Pero en el backend, withRole(['admin']) protege esas
  rutas igualmente — la UI es solo la primera capa.

— updateRoom verifica primero que rooms.status = 'disponible' (RN-08). Si
  la habitación está ocupada, retorna 409 con mensaje: "No se puede editar
  una habitación ocupada. Registra el check-out primero."

— deactivateRoom (soft delete, RN-09): si la habitación tiene bookings
  (activos o completados), marca is_active=false en lugar de eliminar.
  Si no tiene historial, puede eliminarse físicamente. En ambos casos,
  la habitación desaparece del panel principal.

— El seed inicial ya tiene 5 habitaciones. Tras el bootstrap de la Fase 2
  ya deben estar en Postgres. Verificar que se muestran correctamente.

Al terminar:
- Probar CRUD completo de habitaciones con el rol admin
- Probar que el recepcionista no puede crear/editar/eliminar (403 en API)
- Verificar que RoomGrid muestra correctamente disponibles (verde) y
  ocupadas (rojo) con los datos del huésped
- Verificar la navegación desde RoomCard al check-in y al check-out
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_HABITACIONES.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Huéspedes y Check-in

### Rol: `Ingeniero Fullstack — Flujo de entrada del hospedaje`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
registro de usuarios y diseño de formularios que minimizan el tiempo del
operador en el mostrador.

Tu mentalidad: el check-in es la operación más frecuente del sistema. El
recepcionista lo hace varias veces al día, con el huésped esperando al otro
lado del mostrador. Cada campo innecesario, cada validación mal explicada
o cada error silencioso tiene un costo real. La eficiencia y la claridad
del feedback son tan importantes como la corrección técnica.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — modelos de guests y bookings (migrations 0003 y
   0004), lib/bookingService.ts y sus dos funciones, reglas RN-01 al RN-04,
   el caso de uso CU-02 con todos sus flujos, la Fase 4 completa y la
   nota sobre snapshot de precio en la sección 12
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— bookingService.ts es un módulo de lógica pura, sin dependencias de
  Supabase ni de Blob. calculateNights(checkIn, checkOut) devuelve la
  diferencia en días. Si el resultado es 0 (misma fecha), devuelve 1
  (RN-04). Nunca un número negativo — si las fechas están invertidas, Zod
  ya lo rechazó antes. calculateTotal(nights, pricePerNight) multiplica
  directamente. Estas dos funciones se usan tanto en el check-in como en
  el historial — garantizan consistencia.

— El precio que se guarda en bookings.price_per_night es el precio actual
  de la habitación AL MOMENTO DEL CHECK-IN, no una referencia a rooms.
  Si el admin cambia el precio mañana, esta reserva debe conservar el
  precio de hoy. Lee el plan — esto está documentado como "snapshot de
  precio" y es fundamental para la integridad del historial financiero.

— getGuestByIdentification(id) busca si ya existe un huésped con esa
  identificación. Si existe, el formulario de check-in pre-llena nombre
  y teléfono automáticamente. El recepcionista puede editarlos antes de
  confirmar. Si no existe, se crea un nuevo registro en guests. Esto evita
  duplicados y acelera el check-in de huéspedes recurrentes.

— checkIn en el dataService debe ser una operación secuencial clara:
  (1) verificar que la habitación está disponible (RN-01 — retorna 409 si
  no), (2) validar datos con Zod (RN-02 y RN-03), (3) crear o recuperar
  el guest, (4) insertar en bookings con nights calculado y price_per_night
  como snapshot, (5) actualizar rooms.status = 'ocupada', (6) llamar
  recordAudit. Si cualquier paso falla, la habitación no debe quedar en
  estado inconsistente.

— El CheckInForm muestra el total estimado en tiempo real mientras el
  recepcionista elige las fechas. Esto se calcula en el cliente con
  bookingService — no requiere llamada a la API. El recepcionista ve
  exactamente lo que pagará el huésped antes de confirmar.

— Antes de confirmar: mostrar modal de resumen con habitación, nombre del
  huésped, fechas, noches y total estimado. Botón "Confirmar Check-in"
  prominente. Botón "Cancelar" secundario. El recepcionista no debe poder
  hacer check-in accidentalmente.

— El formulario de check-in acepta el roomId como query param (?roomId=...)
  si viene desde el RoomCard de la Fase 3. En ese caso pre-selecciona la
  habitación y no la muestra como campo editable — el recepcionista ya eligió
  la habitación. Si no viene el param, el formulario incluye un selector
  de habitaciones disponibles.

Al terminar:
- Probar check-in completo: seleccionar habitación → ingresar datos → ver
  total estimado actualizarse → confirmar → verificar que la habitación
  aparece ocupada en el panel con el nombre del huésped
- Probar RN-01: intentar check-in en habitación ya ocupada (debe retornar
  409 antes de mostrar el formulario o al confirmar)
- Probar RN-03: fecha de salida anterior a entrada (debe fallar en Zod)
- Probar huésped recurrente: hacer check-in con identificación de un
  huésped existente y verificar que se pre-llenan los datos
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_CHECKIN.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Check-out y Cálculo de Total

### Rol: `Ingeniero Fullstack — Flujo de salida y cobro`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en flujos de
cierre de operaciones y diseño de pantallas de confirmación de cobro.

Tu mentalidad: el check-out es el momento en que el hospedaje cobra. El
total a pagar debe ser imposible de malinterpretar: número grande, bien
visible, con el desglose claro (X noches × $Y por noche = $Z). El
recepcionista no debe tener que calcular nada — el sistema lo hace por él
y lo muestra sin ambigüedad.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — modelo de bookings (migration 0004), reglas
   RN-04 y RN-05, caso de uso CU-03 con todos sus flujos, la Fase 5 y
   el componente CheckOutSummary en la sección 17
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— checkOut en el dataService debe ser atómico desde el punto de vista del
  negocio: (1) obtener la reserva activa con getActiveBooking(roomId),
  (2) calcular el total con bookingService.calculateTotal usando el
  price_per_night guardado en la reserva (no el precio actual de la
  habitación — el snapshot del check-in), (3) actualizar bookings con
  total_amount, actual_checkout_at = NOW(), status = 'completada' y
  checked_out_by, (4) actualizar rooms.status = 'disponible', (5) llamar
  recordAudit. Si el paso 3 o 4 falla, la reserva no debe quedar en un
  estado intermedio — si Supabase falla, el error se propaga al cliente
  con un mensaje claro.

— RN-05: la habitación debe quedar disponible de forma inmediata. Los pasos
  3 y 4 deben ejecutarse como parte de la misma lógica de servicio. No
  hay un estado intermedio "procesando checkout".

— El total se calcula con el price_per_night guardado en bookings, no con
  el precio actual de la habitación. El plan llama a esto "snapshot de
  precio" — es fundamental para que el historial sea consistente aunque
  el admin cambie precios después.

— La pantalla de confirmación /checkout/[bookingId] muestra sin ambigüedad:
  nombre del huésped, identificación, habitación, fecha de entrada, fecha
  de salida estimada, noches de estadía, precio por noche y el TOTAL A
  COBRAR en el número más grande de la pantalla. El recepcionista no debe
  tener que hacer ninguna cuenta.

— Flujo alternativo del CU-03: si la diferencia real entre el check-in y
  ahora es de menos de 1 día (check-out el mismo día), se aplica el mínimo
  de 1 noche (RN-04). bookingService.calculateNights ya maneja esto —
  asegúrate de que el checkout lo use.

— Desde el panel de habitaciones (/rooms), las habitaciones ocupadas tienen
  botón "Check-out" que navega directamente a /checkout/[bookingId]. El
  recepcionista no necesita ir a un menú separado.

— Al confirmar el check-out: toast de éxito con el total cobrado en el
  mensaje ("Check-out registrado. Total cobrado: $120.000"), redirección
  al panel de habitaciones. La habitación debe aparecer de inmediato en
  verde.

Al terminar:
- Probar check-out completo: ir a habitación ocupada → ver CheckOutSummary →
  confirmar → verificar toast con total → verificar habitación en verde
- Verificar que el total calculado es correcto: precio × noches mínimo 1
- Verificar que el precio usado es el snapshot del check-in, no el actual
  (cambiar el precio de la habitación manualmente y verificar que el
  checkout usa el original)
- Verificar que actual_checkout_at quedó registrado en la reserva
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_CHECKOUT.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Historial Mensual

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Consulta y resumen financiero`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend trabajando
en conjunto. El historial es donde el administrador evalúa el rendimiento
del hospedaje. El recepcionista lo usa para verificar registros pasados.
Cada uno necesita ver algo distinto del mismo módulo.

Tu mentalidad: los datos deben hablar solos. El administrador abre el
historial del mes y en 3 segundos sabe cuánto rentó y cuánto ganó. El
recepcionista puede buscar un huésped de la semana pasada en segundos.
La información debe estar organizada, no enterrada.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — regla RN-07, casos de uso CU-04, los endpoints
   /api/history y /api/history/summary, la matriz de permisos (resumen
   financiero solo admin), componentes HistoryTable, MonthSelector y
   FinancialSummary, y la Fase 6 del plan
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Puntos críticos que no puedes ignorar:

— getBookingHistory filtra por el mes de actual_checkout_at, no de
  check_in_date. El historial registra cuándo se completó la renta, no
  cuándo empezó. Una reserva que entró el 30 de abril y salió el 2 de
  mayo aparece en el historial de mayo. Usa DATE_TRUNC('month',
  actual_checkout_at) en la query.

— Solo se muestran bookings con status = 'completada'. Las reservas activas
  no aparecen en el historial — esas son operaciones en curso.

— getMonthlyFinancialSummary está protegido con withRole(['admin']). Devuelve:
  total de rentas del mes (COUNT), suma total de ingresos (SUM de
  total_amount), y la habitación con más check-outs en ese mes. El recepcionista
  nunca recibe estos datos — ni en la UI ni en la API.

— MonthSelector navega entre meses con flechas ← →. Al cargar la página, el
  mes por defecto es el mes actual. Si el mes actual no tiene rentas aún (por
  ejemplo, a principios de mes), muestra el EmptyState apropiado.

— La tabla muestra por defecto las 25 rentas más recientes del mes, ordenadas
  por actual_checkout_at DESC. Si hay más de 25, muestra paginación con
  botones "Anterior / Siguiente".

— El EmptyState para meses sin rentas debe tener un mensaje útil, no genérico.
  Por ejemplo: "No hay rentas registradas en mayo de 2026." con un link
  al mes anterior si hubo rentas.

Al terminar:
- Verificar el historial del mes actual con las rentas de prueba de las
  fases 4 y 5
- Verificar que el resumen financiero solo es visible para el admin
  (probar con cuenta de recepcionista que la sección no aparece)
- Verificar el EmptyState para un mes sin rentas
- Verificar la paginación con más de 25 reservas (crear datos de prueba)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_6_HISTORIAL.md

Tu trabajo termina aquí. No avances a la Fase 7.
```

---

---

## PROMPT FASE 7 — Administración de Usuarios

### Rol: `Ingeniero Fullstack Senior — Gestión de usuarios y credenciales temporales`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en gestión
de usuarios con roles y flujos de credenciales temporales.

Tu mentalidad: el administrador del hospedaje no es un técnico. Crear un
nuevo recepcionista debe ser un proceso de 3 pasos sin complicaciones.
La contraseña temporal que el sistema genera es el único momento en que
una contraseña viaja en claro — debe ser evidente que es temporal y que
el recepcionista debe cambiarla en su primer login.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — sección de roles y permisos (el recepcionista
   no puede acceder a /admin/users), la Fase 7 completa, el campo
   must_change_password en la migration 0001 y el flujo de login en la
   sección 19
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 a 6 completadas,
   registra inicio de Fase 7

Puntos críticos que no puedes ignorar:

— Todas las rutas /api/users sin excepción usan withRole(['admin']). Un
  recepcionista que intente acceder directamente a esas URLs debe recibir
  403, no datos.

— Cuando el admin crea un usuario: generar contraseña temporal con 12
  caracteres aleatorios alfanuméricos (no usar Math.random — usar
  crypto.randomBytes del módulo nativo de Node para garantizar entropía),
  hashearla con bcrypt antes de guardar, marcar must_change_password=true,
  y retornar la contraseña EN CLARO una sola vez. La UI la muestra en un
  modal con botón "Copiar al portapapeles" y un texto de advertencia claro:
  "Esta es la única vez que verás esta contraseña. Entrégala al recepcionista
  y pídele que la cambie en su primer inicio de sesión." El modal no debe
  poder cerrarse hasta que el admin haga clic en un botón explícito.

— En el flujo de login: si el JWT del usuario tiene must_change_password=true,
  redirigir automáticamente a /change-password antes de llegar al dashboard.
  Después de cambiar la contraseña exitosamente, marcar must_change_password=false
  y redirigir al dashboard normalmente.

— El admin no puede suspender ni eliminar su propia cuenta. Verificar
  explícitamente en la API comparando el id del target con el userId del JWT
  — no bastan verificaciones del lado del cliente.

— La auditoría en Blob debe registrar: creación de usuario (con nombre y rol
  del nuevo usuario en metadata), suspensión, reactivación y eliminación.

— La página /admin/audit usa AuditViewer con MonthSelector. Lee el mes de
  Blob mediante /api/audit?month=YYYYMM. Muestra en tabla: timestamp
  formateado, email del usuario que hizo la acción, la acción y el campo
  summary (texto legible). El admin puede navegar entre meses para ver
  el historial completo de operaciones.

Al terminar:
- Probar el flujo completo: admin crea recepcionista → ve contraseña temporal
  una vez → recepcionista hace login → es redirigido a /change-password →
  cambia contraseña → accede al dashboard normalmente
- Probar que el admin no puede eliminarse a sí mismo
- Probar suspensión: usuario suspendido obtiene 401 al intentar hacer login
- Verificar que las operaciones de usuarios quedan en la auditoría de Blob
- Verificar /admin/audit con el historial de operaciones de las fases previas
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_7_USUARIOS.md

Tu trabajo termina aquí. No avances a la Fase 8.
```

---

---

## PROMPT FASE 8 — Pulido final y Deploy

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre. No hay funcionalidades
nuevas — hay calidad, coherencia y solidez en producción.

Tu mentalidad: HostDesk lo va a usar un recepcionista real, en un hospedaje
real, varias veces al día. Un empty state con un mensaje genérico, un error
de red que no explica qué pasó, o una habitación que no se actualiza después
del checkout son fallas que afectan la operación. Esta fase no termina
hasta que el flujo completo del hospedaje funcione sin fricciones en producción,
en celular y en computador.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOSTDESK.md — Fase 8 completa, requerimientos no funcionales
   RNF-01 al RNF-11 y restricciones del sistema
2. doc/ESTADO_EJECUCION_HOSTDESK.md — verifica Fases 1 a 7 completadas,
   registra inicio de Fase 8

Lo que debes completar en esta fase:

Auditoría de empty states: cada módulo debe tener un mensaje contextual
útil cuando no hay datos. El panel de habitaciones sin habitaciones debe
decir algo accionable: "No hay habitaciones registradas. Ve a Gestión de
habitaciones para agregar la primera." El historial sin rentas: "Sin
registros para [mes año]." No genéricos.

Manejo de errores global revisado: error de red (Toast "Sin conexión —
verifica tu internet"), sesión expirada (401 → Toast "Tu sesión expiró"
+ redirect a /login), sin permisos (403 → Toast "No tienes permisos para
esta acción"), error del servidor (500 → Toast "Error del servidor. Intenta
de nuevo en unos minutos."). Estos toasts deben aparecer en cualquier parte
de la app que haga fetch a la API.

Revisión del flujo operacional en celular (RNF-07): el recepcionista puede
trabajar desde el celular del mostrador. Probar el flujo completo en 375px:
panel de habitaciones → seleccionar disponible → formulario de check-in →
confirmar → habitación ocupada → checkout → confirmar → habitación disponible.
Cada paso debe ser usable con una sola mano y sin tener que hacer zoom.

Verificar que el recepcionista no puede acceder a ninguna ruta de /admin/*
introduciendo la URL directamente en el navegador. El middleware.ts debe
redirigir a /dashboard con un toast de "Acceso denegado."

Verificar que ningún componente cliente importa variables de entorno privadas
ni módulos de lib/ directamente. Solo fetch('/api/...'). Buscar en todo el
código cualquier import de supabase, blobAudit, pgMigrate o de variables
como SUPABASE_SERVICE_ROLE_KEY en archivos con 'use client'.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso sin errores
- Deploy en Vercel: verificar que todas las variables de entorno están
  configuradas (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN, JWT_SECRET,
  ADMIN_BOOTSTRAP_SECRET)
- Probar en producción con ambos roles el flujo completo:
  · Admin: login con seed → bootstrap → verificar 5 habitaciones demo →
    crear recepcionista → consultar auditoría → ver historial
  · Recepcionista: primer login → cambio de contraseña → check-in →
    check-out → consultar historial

Al cerrar el proyecto:
- Registra la Fase 8 como Completada en ESTADO_EJECUCION_HOSTDESK.md con
  la URL de producción de Vercel en el historial
- Crea doc/RESUMEN_FASE_8_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, listado de funcionalidades implementadas, stack utilizado,
  tablas de Supabase creadas, decisiones técnicas destacadas y estado final

El proyecto HostDesk está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Camilo Moreno — Doc: 1082932051
> Curso: Lógica y Programación — SIST0200
