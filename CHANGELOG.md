# Changelog - Carioca Score

## [1.0.2] - 2026-06-06

### Corregido
- **Conexión de Producción de Convex:** Se configuró el perfil de compilación de producción en `eas.json` y el archivo `.env` del repositorio para apuntar al servidor de producción real (`determined-cuttlefish-548`), solucionando el error de carga infinita de datos y el fallo de autenticación en la app nativa.
- **Inicio de Sesión con Google (OAuth):** Se configuraron los Client IDs y Client Secrets en los servidores de desarrollo y producción de Convex, y se actualizaron los redireccionamientos autorizados en Google Cloud Console para resolver el error `401: invalid_client`.
- **Incremento de Versión y Build:** Se incrementó la versión pública a `1.0.2` y el código de versión nativa (`versionCode` en Android y `buildNumber` en iOS) a `4` para permitir la publicación del hotfix de producción en Google Play.

## [1.0.1] - 2026-06-06

### Agregado
- **Enlaces institucionales en Ajustes:** Se agregaron enlaces y ventanas modales de navegación para la "Política de Privacidad" y "Acerca de".
- **Información corporativa:** En la sección "Acerca de" se incluyó a la empresa *MakersApps SPA*, la versión de la app (`1.0.1`) y el correo de soporte oficial (`makersapps.com@gmail.com`).
- **Logotipo oficial:** Se reemplazó el icono genérico en el modal de "Acerca de" por la imagen de logotipo oficial de la aplicación (`icon.png`).
- **Compatibilidad con API 35 (Android 15):** Se incorporó el plugin `expo-build-properties` para orientar la aplicación a la API 35 nativa de Android, cumpliendo con los estándares obligatorios de Google Play Store.
- **Configuración de exclusiones de Expo Doctor:** Se añadieron las excepciones para las dependencias `convex`, `@convex-dev/auth` y `react-native-country-flag` para permitir la correcta validación del build local.
- **Ignorar ejecutables nativos en Git:** Se añadieron exclusiones a `.gitignore` para evitar rastrear archivos pesados `.apk`, `.aab` e `.ipa` en el repositorio.

### Cambiado
- **Pantalla de carga (Splash Screen):** Se actualizó el fondo de la pantalla de carga al color verde de mesa de casino de la app (`#0A3D2A`) utilizando el logotipo oficial de Carioca Score.
- **Incremento de Versión:** Se actualizó la versión global de la aplicación a `1.0.1` y se incrementó el código de versión nativa (`versionCode` en Android y `buildNumber` en iOS) a `2` para permitir la subida a las tiendas.

### Corregido
- **Filtro de Ranking Mundial por País:** Se corrigió el error en la consulta `getGlobalStats` que filtraba las partidas por el país del dueño del juego en lugar de evaluar el país individual de cada jugador, impidiendo que contaran las partidas internacionales para el ranking.
- **Optimización de Lecturas en la Base de Datos:** Se refactorizó la consulta de estadísticas mundiales para realizar lecturas en lote (`Promise.all`) de todos los perfiles de usuario involucrados, eliminando el riesgo de exceder el límite de 1000 operaciones de lectura de base de datos de Convex.
- **Asociación de Usuario Creador de Partida:** Se corrigió la consulta `getUserProfile` de Convex para que retorne el `_id` de usuario, solucionando el bug en `CreateGameScreen.tsx` que asociaba al creador de la partida con un ID `undefined` y lo omitía del ranking mundial.
- **Sincronización retroactiva:** Se ejecutó un proceso de backfill para asociar de manera retroactiva las partidas ya jugadas con los IDs de usuario correspondientes.
