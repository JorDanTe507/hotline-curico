# Hotline Curicó 1.7.4 — Correcciones finales

Fecha: 2 de noviembre de 2026. Preparada y comprobada únicamente en local. Sin commits, staging, push ni publicación. HEAD permanece en `e0a2c75`, publicación 1.7.3. No se incorporaron mecánicas ni recursos de 1.8.

## 1. Apagón general

El estado del corte vive en un único evento de `EventDirector`. Afecta a cualquier coordenada y mantiene un solo plazo de recuperación. Rechaza iniciar otro apagón mientras el actual siga activo, aunque se cambie de sector. Resolver un refuerzo de otro sector no cancela el apagón. La restauración y la limpieza al reiniciar cancelan correctamente el estado global.

Conserva duración de 20–45 segundos de tiempo activo, sombras de 0,62, faroles apagados, atenuación de elementos eléctricos al 18 % y luces de emergencia existentes. Cambia el aviso a «Falla el tendido de toda la ciudad» y la herramienta de pruebas a «APAGÓN GENERAL». Lluvia, niebla y sus transiciones/audio se conservan.

`WorldStreamer` refresca la iluminación al cambiar los chunks activos: un sector nuevo entra ya a oscuras, incluso si se carga mientras la partida está pausada. No se añaden temporizadores por chunk ni recuperaciones independientes.

`ActorLighting` multiplica por 0,75 los cuatro tintes de cada protagonista y de todos los enemigos/jefes justo antes de dibujar la escena. Inmediatamente después restaura los valores originales, incluido `tintFill`. Así no se acumula oscuridad, no se pisan avisos de ataques/daño/definitivas y tampoco se altera una textura. Funciona durante pausa y con enemigos aparecidos durante el corte. No aplica el tinte a HUD, retratos, diálogos, menús, armas, proyectiles ni gráficos de peligro.

## 2. Experiencia por baja

Se ajustaron las tablas existentes; no hay un sistema de XP paralelo. Valores fijos por tipo ponderados según sus estadísticas base y habilidades. No se recalculan por fotograma ni se escala esta recompensa automáticamente por ronda. La curva de niveles, cartas, selección de mejoras y WeakSet que evita duplicar bajas permanecen intactos.

La XP por impactos conserva base 2 y multiplicador 1,20, acumulación fraccional y deduplicación por crédito/enemigo. No se encontró otro multiplicador de XP por baja que hubiera que migrar.

### Enemigos

| Enemigo | Vida base | XP anterior | XP 1.7.4 |
|---|---:|---:|---:|
| Matón básico | 35 | 10 | 10 |
| Matón con pistola | 55 | 15 | 18 |
| Matón con subfusil | 100 | 15 | 28 |
| Matón blindado | 160 | 25 | 48 |
| Matón de élite | 220 | 25 | 64 |
| Matón con escopeta | 80 | 20 | 26 |
| Matón con rifle | 110 | 20 | 34 |
| Matón con cuchillo | 45 | 12 | 16 |
| Matón con bate | 70 | 15 | 22 |
| Matón corpulento | 210 | 30 | 52 |
| Matón con lentes | 90 | 20 | 28 |
| Matón atlético | 60 | 15 | 24 |
| Encuentro: Incendiario | 320 | 100 | 110 |
| Francotirador | 70 | 30 | 42 |
| Médico enemigo | 65 | 25 | 32 |
| Perro de ataque | 38 | 12 | 16 |

Blindados reciben más que los armados ordinarios; corpulentos/élites y el encuentro incendiario tienen recompensas superiores por resistencia o peligro. Los comunes no alcanzan por sí solos dos niveles desde nivel 1. Las recompensas por muerte se consultan y entregan una sola vez; los impactos siguen siendo una fuente independiente, como antes.

### Jefes

| Jefe | Primera ronda | XP anterior | XP 1.7.4 |
|---|---:|---:|---:|
| EL TORTURADO | 5 | 150 | 180 |
| EL COMANDANTE | 10 | 150 | 230 |
| EL DEMOLEDOR | 15 | 150 | 280 |
| EL VERDUGO | 20 | 150 | 330 |
| EL CARNICERO | 25 | 150 | 400 |

## 3. Minigun

El catálogo local anterior contenía 200 balas en cargador y 400 en reserva (600 totales), con recarga de 4000 ms. Ahora la minigun completa tiene 1000 balas disponibles, reserva cero y recarga cero.

- HUD de escritorio y móvil: número único, por ejemplo `1000`, `999`, `0`; sin separador de cargador/reserva.
- Recargar con teclado, mando o tacto no inicia recarga ni interrumpe el giro/disparo. A cero no dispara; una recogida válida permite volver a usarla.
- Se conserva daño 12, intervalo base de 50 ms, dispersión 0,08, alcance 850, giro previo de 600 ms, efectos y reglas de cadencia.
- Capacidad máxima fija 1000, incluso con mejoras de cargador. Munición ordinaria: 400 balas base; mejora de reserva recibida conservada y resultado limitado a 1000. Suministro de emergencia: 200 balas. No se crea reserva invisible.
- Munición antigua en armas del suelo/streaming: combina cargador y reserva existentes, limita a 1000 y deja reserva a cero. Ejemplo: `70/400` pasa a `470`, sin relleno gratuito. Conserva identidad, transferencia y estado de munición.
- El registro de recogidas de Última Calada respeta el límite al restaurar la munición. La munición infinita temporal de esa habilidad se conserva: el arma por sí misma sigue siendo finita. Modo Tryhard continúa consumiendo munición.
- El Comandante comparte el ID de minigun: recibe el depósito de 1000 sin reserva. Conserva daño, patrón de ráfagas y enfriamientos; durante el enfriamiento utiliza pose idle en lugar de animación de recarga. Los demás jefes y armas mantienen su recarga.

## 4. Novedades

Versión local 1.7.4 en paquete, lock y configuración central. Menús de escritorio/móvil muestran «CORRECCIONES FINALES», con apagón global, tinte ambiental, XP y minigun. Conserva el historial 1.7.3/1.7.2/1.7.1 y anteriores.

## 5. Validación

- TypeScript: correcto.
- 182 pruebas unitarias: correctas, cero fallos. Incluyen unicidad del apagón, sectores nuevos, recuperación/limpieza, tintes por esquina y tintFill, recompensas/deduplicación, munición y migración/transferencia, límite de mejoras, recarga ordinaria y recogidas durante Calada.
- `npm run build`: correcto, paquete 1.7.4. Build `dist/assets/index-kG_KnLQc.js`, CSS `index-Dn6X2TKP.css`. Permanece el aviso previo de Vite por bundle mayor de 500 kB.
- `check-final174.cjs`: Cervela y Nicolás, tres tipos de enemigo y los cinco jefes oscurecidos en render, incluido tinte especial; nueve chunks activos; pausa/reanudación; nuevos chunks aún a oscuras; enemigo posterior; lluvia/niebla; recuperación global sin alterar tintes. Capturas normal/apagón revisadas.
- Misma suite: bajas reales dan 10/18/48/110 XP a los ejemplos básico/pistola/blindado/incendiario y 180/230/280/330/400 a jefes. Una segunda llamada no añade XP.
- Misma suite: 1000 decisiones de disparo reales por la ruta de Game, con consumos hasta cero y separación de 50 ms, sin recarga; pulsar recargar durante disparo no reinicia el giro. Recogida posterior: 400, reserva cero. HUD de una cifra. Teclado y mando estándar simulado no recargan; el mando sí dispara. La pistola sí inicia su recarga normal.
- Misma suite en Pixel 7 emulado: botón táctil de recarga ignorado por minigun; pulsación táctil sostenida dispara y deja 991 balas, reserva cero, sin recarga. HUD móvil muestra un solo contador. No es una prueba en teléfono físico.
- `check-atmosphere173.cjs`: lluvia, niebla, sonido, volumen, mute, un único bucle y limpieza conservados; assertions de versión y apagón actualizadas al nuevo comportamiento global.
- `check-bosses171.cjs` y `check-bosses171-controls.cjs`: ambos protagonistas, cinco jefes, diálogos exactos de rondas 5–50, escala/colisiones/impactos/animaciones, tacto y mando emulados.
- `check-balance172.cjs`: vendedor por ronda y acceso/streaming, probabilidad y transferencia de armas, ausencia de reintentos y especialistas. Prueba de apagón usa ahora el evento global real.
- `check-city17.cjs` y `check-city17-mobile.cjs`: eventos, refuerzos/rondas, pausa, clima, sectores y controles móviles conservados.
- `check-fortune16.cjs`: cajas, cofres, recompensas, jefes y streaming conservados.
- `check-maintenance162.cjs`: habilidades, salud, suministros y entradas de ratón/mando conservadas.
- `check-arsenal.cjs`: ataques reales de las 16 armas para jugador y NPC, transferencias, recogida, lanzamiento existente, instancias/streaming, cadencias, recargas normales, melee y colisiones. Sus casos de transferencia ahora eligen tiradas exitosas explícitamente: antes suponían caída garantizada y recogida sin el 5 % de 1.7.2. Las probabilidades reales siguen probándose por separado. Se ejecuta con GAME_URL en el servidor 5180, ya que su puerto predeterminado 5176 no estaba activo.
- `check-atmosphere173-production.cjs`: build local en `/hotline-curico/`, notas 1.7.4 e historial, recursos de ciudad/audio, lluvia/apagón/recarga y ausencia de global de depuración en producción.
- Sin errores JavaScript/HTTP en las suites completadas. `git diff --check` correcto.

No se modificaron sprites, archivos de progreso ni claves de almacenamiento. No se realizó una prueba física con Android/DualShock ni una sesión humana prolongada de balance. No quedan fallos detectados en las comprobaciones realizadas; la única advertencia de compilación es el tamaño del bundle ya existente.

## Archivos modificados

- `check-final174.cjs`
- `src/atmosphere/ActorLighting.ts`
- `tests/final174.test.ts`
- `check-arsenal.cjs`
- `check-atmosphere173-production.cjs`
- `check-atmosphere173.cjs`
- `check-balance172.cjs`
- `check-city17-mobile.cjs`
- `check-city17-production.cjs`
- `check-city17.cjs`
- `package-lock.json`
- `package.json`
- `src/atmosphere/CityAtmosphere.ts`
- `src/atmosphere/CityDevPanel.ts`
- `src/atmosphere/CityState.ts`
- `src/bosses/NewBosses.ts`
- `src/config/progression.ts`
- `src/config/releaseNotes.ts`
- `src/mobile/MobileUI.ts`
- `src/scenes/Game.ts`
- `src/systems/PlayerModifiers.ts`
- `src/systems/Progression.ts`
- `src/systems/SurvivalSystem.ts`
- `src/systems/Ultimate.ts`
- `src/systems/UpgradeCatalog.ts`
- `src/ui/CombatHud.ts`
- `src/ui/ReloadFeedback.ts`
- `src/weapons/GroundWeapon.ts`
- `src/weapons/arsenal.ts`
- `src/world/WorldStreamer.ts`
- `tests/atmosphere173.test.ts`
- `tests/city17.test.ts`
- `tests/progression.test.ts`
- `tests/roulette.test.ts`
- `VALIDACION-1.7.4.md` (este informe).
