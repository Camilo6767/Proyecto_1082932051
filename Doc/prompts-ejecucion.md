# Prompts de Ejecución por Fases
> Sistema Fullstack TypeScript · Next.js · GitHub · Vercel · JSON DB

---

## Instrucciones de uso

Cada prompt debe ejecutarse **en orden**, en una sesión nueva de Claude.  
Antes de copiar un prompt, asegúrate de tener disponibles los tres documentos de referencia:

| Documento | Archivo |
|---|---|
| Plan de Infraestructura | `plan-infraestructura-fullstack.md` |
| Plan de Implementación por Fases | `plan-implementacion-fases.md` |
| Estado de Ejecución | `estado-ejecucion.md` |

**Flujo por prompt:**
```
Leer los 3 docs → Registrar INICIO en estado-ejecucion.md
        ↓
   Ejecutar la fase
        ↓
Documentar resultado en estado-ejecucion.md
        ↓
Crear archivo resumen-fase-N.md independiente
```

> ⚠️ No avanzar al siguiente prompt hasta que el criterio de validación de la fase actual esté cumplido y documentado en `estado-ejecucion.md`.

---

---

## PROMPT — FASE 0: Prerrequisitos

```
Actúa como Ingeniero Fullstack Senior especializado en ecosistemas TypeScript, Next.js y plataformas de despliegue en la nube. Tu perfil incluye experiencia en configuración de entornos de desarrollo, gestión de cuentas de servicios cloud y verificación de dependencias de sistema.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → arquitectura general del sistema
2. plan-implementacion-fases.md → pasos detallados por fase
3. estado-ejecucion.md → historial de ejecución del proyecto

Una vez leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza el archivo estado-ejecucion.md agregando al historial una entrada con este formato exacto:
- Fase: 0 — Prerrequisitos
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior
- Observaciones iniciales: [describe brevemente qué encontraste en los documentos leídos]

ACCIÓN 2 — EJECUTAR LA FASE 0:
Siguiendo estrictamente la sección "Fase 0 — Prerrequisitos" del plan-implementacion-fases.md, guía paso a paso la verificación y configuración del entorno. Para cada paso:
- Indica el comando exacto a ejecutar
- Muestra la salida esperada
- Confirma si el paso fue exitoso o requiere corrección

Los pasos a cubrir son:
1. Verificar versiones de Node.js, npm y Git
2. Configurar Git local (nombre y email)
3. Verificar vinculación de Vercel con GitHub
4. Verificar instalación del Vercel CLI (o guiar su instalación)
5. Validar todos los criterios de éxito de la Fase 0

ACCIÓN 3 — REGISTRAR RESULTADO:
Una vez completada la fase, actualiza el archivo estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌ si hay problemas sin resolver)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- Lo que se hizo: resumen detallado de cada paso ejecutado y su resultado
- Problemas encontrados: [si los hubo, describir y cómo se resolvieron]
- Criterios de validación: marcar cada ítem como ✅ o ❌ con nota

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-0-prerrequisitos.md con la siguiente estructura:
- Encabezado con nombre de la fase, fecha y ejecutor
- Objetivo de la fase
- Entorno verificado (versiones confirmadas)
- Cuentas y servicios configurados
- Problemas encontrados y soluciones aplicadas
- Criterios de validación con resultado
- Estado final de la fase
- Siguiente paso recomendado

Recuerda: no avances ni menciones la Fase 1 hasta que todos los criterios de validación de esta fase estén marcados como ✅.
```

---

---

## PROMPT — FASE 1: Repositorio y Configuración Base

```
Actúa como Ingeniero Fullstack Senior especializado en arquitectura de proyectos TypeScript, configuración de monorepos y buenas prácticas de desarrollo con Next.js. Tienes experiencia en configuración de herramientas de calidad de código como ESLint, Prettier y TypeScript en modo estricto.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → arquitectura general del sistema
2. plan-implementacion-fases.md → pasos detallados por fase
3. estado-ejecucion.md → historial de ejecución del proyecto, verifica que la Fase 0 esté marcada como COMPLETADO ✅ antes de continuar

Si la Fase 0 no está completada, detente e indica qué falta antes de continuar.

Una vez verificado el estado y leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza el archivo estado-ejecucion.md agregando al historial una entrada con este formato exacto:
- Fase: 1 — Repositorio y Configuración Base
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior
- Prerequisito verificado: Fase 0 COMPLETADO ✅
- Observaciones iniciales: [describe el estado del entorno según lo leído en estado-ejecucion.md]

ACCIÓN 2 — EJECUTAR LA FASE 1:
Siguiendo estrictamente la sección "Fase 1" del plan-implementacion-fases.md, guía y ejecuta cada paso. Para cada uno genera el código, comandos o configuración completa y lista para usar:

1. Crear el repositorio en GitHub (instrucciones paso a paso en la UI)
2. Inicializar el proyecto con create-next-app y las opciones correctas
3. Vincular el proyecto local con el repositorio GitHub remoto
4. Verificar la estructura de archivos generada
5. Configurar tsconfig.json con strict: true y resolveJsonModule
6. Renombrar y configurar next.config.ts en TypeScript
7. Agregar todos los scripts al package.json
8. Instalar y configurar Prettier con .prettierrc
9. Validar que el servidor local levanta sin errores
10. Actualizar .gitignore con las entradas necesarias
11. Hacer el commit final de la fase

Para cada archivo de configuración, proporciona el contenido completo y listo para copiar.

ACCIÓN 3 — REGISTRAR RESULTADO:
Una vez completada la fase, actualiza el archivo estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- Lo que se hizo: detalle de cada archivo creado o modificado con su ruta
- Commit hash: [hash del commit final de la fase]
- Problemas encontrados: [descripción y solución si los hubo]
- Criterios de validación: marcar cada ítem como ✅ o ❌

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-1-repositorio-config.md con:
- Encabezado con nombre de la fase, fecha y ejecutor
- Objetivo de la fase
- Repositorio creado (nombre, URL en GitHub)
- Archivos de configuración generados (lista con ruta y propósito de cada uno)
- Versiones de dependencias instaladas
- Scripts disponibles en package.json
- Estructura de directorios resultante
- Commit hash de cierre de fase
- Problemas encontrados y soluciones
- Criterios de validación con resultado
- Estado final y siguiente paso recomendado
```

---

---

## PROMPT — FASE 2: Capa de Datos JSON

```
Actúa como Ingeniero Fullstack Senior especializado en arquitectura de datos, diseño de APIs tipadas con TypeScript y patrones de acceso a datos en aplicaciones Next.js serverless. Tienes experiencia en el diseño de capas de abstracción de datos usando el sistema de archivos como fuente de verdad.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → arquitectura general del sistema, especialmente la sección de capa de datos
2. plan-implementacion-fases.md → pasos detallados por fase
3. estado-ejecucion.md → historial de ejecución del proyecto, verifica que la Fase 1 esté marcada como COMPLETADO ✅ antes de continuar

Si la Fase 1 no está completada, detente e indica qué falta antes de continuar.

Una vez verificado el estado y leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza el archivo estado-ejecucion.md con:
- Fase: 2 — Capa de Datos JSON
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior
- Prerequisito verificado: Fase 1 COMPLETADO ✅
- Observaciones iniciales: [describe la estructura del proyecto según lo leído en estado-ejecucion.md]

ACCIÓN 2 — EJECUTAR LA FASE 2:
Siguiendo estrictamente la sección "Fase 2" del plan-implementacion-fases.md, genera y ejecuta cada paso:

1. Crear la estructura de directorios /data/pages/
2. Crear data/config.json con el contenido completo definido en el plan
3. Crear data/pages/home.json con el contenido completo definido en el plan
4. Crear src/lib/db/ con los archivos necesarios
5. Crear src/lib/db/types.ts con las interfaces AppConfig y HomeData
6. Crear src/lib/db/reader.ts con la función readJson<T>() genérica, manejo de errores incluido
7. Ejecutar npm run type-check y confirmar que pasa sin errores
8. Hacer el commit de cierre de fase

Para cada archivo, proporciona el contenido completo y explica el rol de cada decisión de tipado.
Explica también por qué readJson es una función del servidor y no puede llamarse desde componentes cliente.

ACCIÓN 3 — REGISTRAR RESULTADO:
Actualiza estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- Archivos creados: lista con ruta completa y descripción de cada uno
- Commit hash de cierre de fase
- Resultado de npm run type-check: [salida del comando]
- Problemas encontrados: [descripción y solución si los hubo]
- Criterios de validación: marcar cada ítem como ✅ o ❌

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-2-capa-datos-json.md con:
- Encabezado con nombre de la fase, fecha y ejecutor
- Objetivo de la fase
- Estructura de /data creada (árbol de archivos)
- Esquema de datos definido (interfaces TypeScript documentadas)
- Descripción de la función readJson<T>() y su patrón de uso
- Reglas de arquitectura aplicadas (servidor only, no escritura desde cliente)
- Resultado del type-check
- Commit hash de cierre
- Criterios de validación con resultado
- Estado final y siguiente paso recomendado
```

---

---

## PROMPT — FASE 3: Aplicación Next.js

```
Actúa como Ingeniero Fullstack Senior con especialización en desarrollo de interfaces con Next.js 14 App Router, diseño de componentes con TypeScript estricto y experiencia en animaciones CSS con Tailwind. También tienes el rol de Diseñador UX/UI con criterio estético para implementar efectos visuales elegantes, tipografía de impacto y jerarquía visual clara en interfaces web modernas.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → arquitectura general, sección de componentes y API Routes
2. plan-implementacion-fases.md → pasos detallados de la Fase 3
3. estado-ejecucion.md → historial del proyecto, verifica que la Fase 2 esté marcada como COMPLETADO ✅

Si la Fase 2 no está completada, detente e indica qué falta.

Una vez verificado el estado y leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza estado-ejecucion.md con:
- Fase: 3 — Aplicación Next.js
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutores: Ingeniero Fullstack Senior + Diseñador UX/UI
- Prerequisito verificado: Fase 2 COMPLETADO ✅
- Observaciones iniciales: [describe el estado del proyecto y la capa de datos disponible]

ACCIÓN 2 — EJECUTAR LA FASE 3:
Genera el contenido completo de cada archivo en el orden indicado:

1. tailwind.config.ts — con los tres keyframes: glowPulse, fadeIn, slideUp y sus clases de animación
2. src/app/globals.css — con directivas Tailwind, clase .glow-text y reset de estilos
3. src/app/layout.tsx — con fuente Inter, metadata completa y estructura HTML semántica
4. src/components/HolaMundo/HolaMundo.types.ts — con EffectType y HolaMundoProps
5. src/components/HolaMundo/HolaMundo.tsx — componente completo con mapa de efectos, estructura semántica y clases Tailwind
6. src/app/api/home/route.ts — API Route GET con manejo de errores tipado
7. src/app/page.tsx — Server Component que lee el JSON y pasa props tipadas al componente

Para el componente HolaMundo, como Diseñador UX/UI justifica cada decisión visual:
- Por qué fondo gris oscuro (#030712)
- Por qué glow en tonos indigo/violeta
- Por qué el subtítulo en uppercase con tracking-widest
- Por qué el badge en fuente monoespaciada al pie

Después de generar todos los archivos:
8. Ejecutar npm run type-check → confirmar sin errores
9. Ejecutar npm run lint → confirmar sin errores críticos
10. Ejecutar npm run dev y verificar:
    - http://localhost:3000 → Hola Mundo con efecto visual
    - http://localhost:3000/api/home → JSON correcto
11. Ejecutar npm run build → confirmar build de producción exitoso
12. Hacer el commit de cierre de fase

ACCIÓN 3 — REGISTRAR RESULTADO:
Actualiza estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- Archivos creados/modificados: lista con ruta y descripción
- Resultado de type-check, lint y build: [salida de cada comando]
- URL local verificada: http://localhost:3000 ✅
- API local verificada: http://localhost:3000/api/home ✅
- Commit hash de cierre de fase
- Decisiones de diseño tomadas: [resumir las decisiones visuales]
- Problemas encontrados y soluciones

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-3-aplicacion-nextjs.md con:
- Encabezado con nombre de la fase, fecha y ejecutores (Ingeniero + Diseñador)
- Objetivo de la fase
- Componentes creados (con descripción de props y tipos)
- API Routes implementadas (método, ruta, respuesta)
- Decisiones de diseño UX/UI justificadas
- Animaciones implementadas y su comportamiento
- Resultados de las validaciones (type-check, lint, build)
- URLs verificadas localmente
- Commit hash de cierre
- Criterios de validación con resultado
- Estado final y siguiente paso recomendado
```

---

---

## PROMPT — FASE 4: Despliegue GitHub + Vercel

```
Actúa como Ingeniero DevOps Senior especializado en plataformas de despliegue continuo, configuración de proyectos en Vercel, gestión de entornos y variables de configuración en aplicaciones Next.js en producción.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → sección de integración GitHub + Vercel y pipeline de despliegue
2. plan-implementacion-fases.md → pasos detallados de la Fase 4
3. estado-ejecucion.md → historial del proyecto, verifica que la Fase 3 esté marcada como COMPLETADO ✅

Si la Fase 3 no está completada, detente e indica qué falta.

Una vez verificado el estado y leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza estado-ejecucion.md con:
- Fase: 4 — Despliegue GitHub + Vercel
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutor: Ingeniero DevOps Senior
- Prerequisito verificado: Fase 3 COMPLETADO ✅
- Observaciones iniciales: [describe el estado del proyecto y qué se va a desplegar]

ACCIÓN 2 — EJECUTAR LA FASE 4:
Guía paso a paso cada acción de despliegue:

1. Importar el proyecto en Vercel desde GitHub:
   - Instrucciones detalladas en la UI de Vercel
   - Tabla de configuración del proyecto (framework, build command, output dir)

2. Configurar variables de entorno en el dashboard de Vercel:
   - Lista exacta de variables con sus valores por entorno (Production, Preview, Development)

3. Ejecutar el primer deploy y monitorear:
   - Qué esperar en los logs del build
   - Cómo identificar si el build pasó el type-check
   - Cómo confirmar que el deploy fue exitoso

4. Verificar la URL de producción:
   - / → Hola Mundo con efecto visual
   - /api/home → JSON correcto en producción

5. Crear y commitear .env.example:
   - Contenido del archivo
   - Por qué es importante para el equipo

6. Verificar el deploy automático:
   - Hacer el cambio en data/pages/home.json
   - Hacer push y observar el trigger en Vercel
   - Confirmar que el cambio se refleja en producción

Para cada paso, indica qué verificar si algo falla y cómo diagnosticarlo.
Incluye una nota especial sobre por qué la carpeta /data debe estar en el repositorio y no en .gitignore.

ACCIÓN 3 — REGISTRAR RESULTADO:
Actualiza estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- URL de producción: [URL de Vercel]
- Variables de entorno configuradas: [lista sin valores sensibles]
- Deploy automático verificado: ✅ o ❌
- URL de producción verificada: ✅ o ❌
- API en producción verificada: ✅ o ❌
- Problemas encontrados y soluciones

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-4-despliegue-vercel.md con:
- Encabezado con nombre de la fase, fecha y ejecutor
- Objetivo de la fase
- Configuración del proyecto en Vercel (tabla completa)
- URL de producción del proyecto
- Variables de entorno configuradas por ambiente
- Flujo de deploy automático documentado (diagrama en texto)
- Verificaciones realizadas en producción
- Notas sobre la carpeta /data y su inclusión en el repo
- Problemas encontrados y soluciones
- Criterios de validación con resultado
- Estado final y siguiente paso recomendado
```

---

---

## PROMPT — FASE 5: CI/CD y Validación TypeScript

```
Actúa como Ingeniero DevOps Senior especializado en integración continua, GitHub Actions, protección de ramas y estrategias de calidad de código en proyectos TypeScript. Tienes experiencia en diseño de pipelines que bloquean código defectuoso antes de que llegue a producción.

Antes de comenzar, lee y analiza en su totalidad los siguientes tres documentos que te voy a proporcionar:
1. plan-infraestructura-fullstack.md → sección de validación TypeScript y pipeline de despliegue
2. plan-implementacion-fases.md → pasos detallados de la Fase 5
3. estado-ejecucion.md → historial del proyecto, verifica que la Fase 4 esté marcada como COMPLETADO ✅

Si la Fase 4 no está completada, detente e indica qué falta.

Una vez verificado el estado y leídos los tres documentos, realiza las siguientes acciones en orden:

ACCIÓN 1 — REGISTRAR INICIO:
Actualiza estado-ejecucion.md con:
- Fase: 5 — CI/CD y Validación TypeScript
- Estado: EN PROGRESO
- Fecha y hora de inicio: [fecha y hora actual]
- Ejecutor: Ingeniero DevOps Senior
- Prerequisito verificado: Fase 4 COMPLETADO ✅
- URL de producción activa: [URL registrada en la Fase 4]
- Observaciones iniciales: [describe el estado del proyecto antes de agregar CI]

ACCIÓN 2 — EJECUTAR LA FASE 5:
Genera y guía la implementación de cada paso:

1. Crear .github/workflows/ci.yml:
   - Contenido completo del workflow
   - Explicar cada step y por qué está en ese orden
   - Por qué usar npm ci en lugar de npm install

2. Configurar la protección de rama main en GitHub:
   - Instrucciones paso a paso en la UI de GitHub
   - Qué checks requerir exactamente

3. Hacer commit y push del workflow:
   - Comando exacto
   - Cómo verificar que el workflow aparece en la pestaña Actions

4. Verificar que el CI pasa en main:
   - Qué esperar en los logs de cada step
   - Cómo confirmar que los 3 checks pasan (type-check, lint, build)

5. Probar el CI con un error intencional de TypeScript:
   - Qué cambio introducir para forzar el error
   - Cómo crear la rama de prueba y el PR
   - Qué debe mostrar el CI al fallar
   - Cómo revertir limpiamente

6. Agregar el badge de CI al README.md:
   - URL exacta del badge para el repositorio
   - Contenido completo del README actualizado

7. Hacer el commit final del proyecto

ACCIÓN 3 — REGISTRAR RESULTADO:
Actualiza estado-ejecucion.md con:
- Estado: COMPLETADO ✅ (o BLOQUEADO ❌)
- Fecha y hora de finalización: [fecha y hora actual]
- Duración real: [tiempo transcurrido]
- Workflow creado: .github/workflows/ci.yml ✅
- Rama main protegida: ✅ o ❌
- CI pasa en main: ✅ o ❌
- Error intencional bloqueado por CI: ✅ o ❌
- Badge en README: ✅ o ❌
- Commit hash final del proyecto
- Duración total del proyecto: [suma de todas las fases]
- Problemas encontrados y soluciones

ACCIÓN 4 — CREAR RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-5-cicd-typescript.md con:
- Encabezado con nombre de la fase, fecha y ejecutor
- Objetivo de la fase
- Workflow de GitHub Actions documentado (steps con descripción)
- Configuración de protección de rama main
- Resultado de la prueba con error intencional
- Badge de CI con URL
- Commit hash final
- Criterios de validación con resultado
- Estado final de la fase

Y adicionalmente, dado que esta es la última fase, agrega una sección especial:
## Resumen Ejecutivo del Proyecto Completo
- Fecha de inicio y fecha de finalización
- Duración total real
- Stack implementado
- URL de producción
- Repositorio GitHub
- Fases completadas (tabla con duración real de cada una)
- Arquitectura final implementada
- Decisiones técnicas más relevantes tomadas durante la implementación
- Próximos pasos sugeridos para escalar el proyecto
```

---

*Prompts de Ejecución — Versión 1.0.0*
*Complementa: plan-infraestructura-fullstack.md · plan-implementacion-fases.md · estado-ejecucion.md*
