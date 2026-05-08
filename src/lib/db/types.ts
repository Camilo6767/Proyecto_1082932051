/**
 * Tipos de la capa de datos JSON
 *
 * Estas interfaces definen la estructura de los datos en /data/*.json
 * Proporcionan type-safety end-to-end desde el servidor al cliente.
 */

/**
 * Configuración global de la aplicación
 *
 * Corresponde a: data/config.json
 * Propiedades:
 * - app.name: Nombre público de la aplicación
 * - app.version: Versión semántica del proyecto
 * - app.locale: Código de idioma/región (ej: "es-CO")
 * - app.theme: Tema visual (light o dark)
 */
export interface AppConfig {
  app: {
    name: string;
    version: string;
    locale: string;
    theme: "light" | "dark";
  };
}

/**
 * Datos del Home page
 *
 * Corresponde a: data/pages/home.json
 * Propiedades:
 * - hero.title: Título principal de la página
 * - hero.subtitle: Subtítulo con tecnologías
 * - hero.description: Descripción larga
 * - hero.effect: Animación CSS a aplicar (glow-pulse, fade-in, slide-up, etc)
 */
export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    effect: string;
  };
}
