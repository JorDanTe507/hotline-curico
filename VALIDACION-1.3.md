# Hotline Curicó — validación 1.3

## Implementación

Se mantiene el proyecto Phaser 3 + TypeScript y su combate. Teclado y ratón conservan sus acciones y coordenadas de apuntado. Se habilita `input.gamepad` de Phaser y se consulta `navigator.getGamepads()` en una única capa de entrada por juego.

### Entrada y menús

- `src/input/PadState.ts`: estado puro, flancos de botones, selección de mando conectado, desconexión segura, zona muerta radial de 0,18, intensidad analógica acotada, dirección de apuntado conservada, preferencias validadas y asistencia opcional en cono estrecho de 0,14 radianes / 650 px. La asistencia respeta línea de visión y nunca modifica el apuntado del ratón.
- `src/input/InputHub.ts`: combina movimiento, disparo, apuntado y acciones de teclado/ratón/mando; avisos de conexión; último dispositivo; foco cian; navegación común por cruceta, cruz y círculo; limpieza de escuchas al salir/reintentar. Acciones discretas solo en el flanco inicial: mantener un botón no repite selección ni compra.
- `src/input/PadControls.ts`: esquema de DualShock, conexión, zona muerta, asistencia e intensidad. Guarda en `hotline-pad-v1`. Mapeo estándar tiene prioridad. Para dispositivos sin mapeo estándar, no se adivinan índices: hay asistentes de botones y de ejes, con calibración de orden/inversión y guardado. La navegación se suspende durante la calibración para evitar que un botón recién asignado reactive el asistente.
- `src/main.ts`: habilita plugin Gamepad, inicializa InputHub, carga y normaliza materiales urbanos.
- `src/scenes/Game.ts`: usa acciones compartidas del Hub; no duplica disparos, daño, recarga, ejecución, dash o definitivas. Movimiento analógico conserva intensidad y no acelera diagonales. El stick derecho apunta independientemente del izquierdo. Indicaciones contextuales por dispositivo.
- `src/scenes/Menu.ts`: OPCIONES → CONTROLES con pestañas TECLADO Y RATÓN / MANDO PS4; conserva audio/vídeo y demás botones.
- `src/ui/CombatHud.ts`, `src/ui/UltimateView.ts`: indicaciones de SHARE/R1/triángulo cuando corresponde.

Mapeo estándar: izquierdo movimiento; derecho apuntado; R2 fuego; L2 dash; R1 cambiar; L1 lanzar; cruz interactuar; círculo ejecutar; cuadrado recargar; triángulo definitiva; OPTIONS pausa; cruceta menús. SHARE permite usar el botiquín. En menús, cruz confirma y círculo vuelve. La ruleta existente es automática y no requiere confirmación; no se añade un paso artificial. Intro y diálogo del jefe admiten cruz.

### Calles

- `public/assets/world/streets-v13.png`: atlas de materiales generado a partir de la referencia suministrada, sin títulos ni interfaz. No se coloca la lámina de referencia sobre el mapa.
- `src/world/Streets.ts`: cuatro materiales independientes normalizados a 32×32 para el sistema existente de tiles de 48 px en el mundo. Asfalto muy oscuro y hormigón gris violáceo; variantes deterministas. Soleras, doble línea amarilla, carriles blancos discontinuos, pasos peatonales, tapas, alcantarillas y grietas mediante gráficos estáticos.
- `src/world/WorldStreamer.ts`: añade tiles urbanos al suelo existente; conserva cuerpos sólidos, edificios, objetos, rutas, botín y límites de streaming.

Las marcas se calculan con coordenadas globales, módulo positivo para sectores negativos y periodos que dividen los 32 tiles del chunk. Las líneas centrales se interrumpen ante cruces y pasos peatonales. No dependen de orden de carga ni semilla visual local reiniciada. No se modifica `WorldModel` ni la geometría de colisiones.

Otros archivos: `package.json` (1.3.0 y script), `README.md`, esta validación, `tests/input-v13.test.ts`, `check-v13.cjs`, `check-pad-menus-v13.cjs`, `check-pad-calibration-v13.cjs`.

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| TypeScript `tsc --noEmit` | PASS |
| `tsx --test tests/*.test.ts` | **84/84 PASS** |
| `vite build` | PASS; advertencia habitual del bundle Phaser >500 kB |
| `check-v13.cjs` | PASS: inicio sin mando, conexión simulada, movimiento analógico + disparo simultáneo, ángulo retenido, dash/cambio/recarga/lanzamiento/recogida, ejecución real con círculo, ambas definitivas, selección/intro/cartas/pausa/derrota/reintento, desconexión y teclado, preferencias y carga de nuevas calles, sin errores JavaScript |
| `check-pad-menus-v13.cjs` | PASS: menú, mejoras, pestañas, compras y coste, botón mantenido sin repetición, volver, controles y zona muerta solo con mando; ventana 960×640 |
| `check-pad-calibration-v13.cjs` | PASS: dispositivo sin mapeo estándar, 14 asignaciones, ejes reordenados e invertidos, persistencia tras recargar |
| `check-world.cjs` | PASS: salida y paseo físico hasta industria, negativos, continuidad, persecución, jefe exterior/disparos/muerte, rondas, XP/cartas, botín, 3 reintentos limpios; 9 chunks, 20 capas y máximo 444 cuerpos |
| `check-arsenal.cjs` | PASS: 16 armas del jugador/NPC, munición, recarga, daño, botín exclusivo, lanzamiento, colisiones y limpieza |
| `check-v12.cjs` | PASS: economía, compras, persistencia, recompensas y reintento |
| `check-v11.cjs` | PASS: capacidades, daño letal, alarma crítica, cinemáticas, reintento y volúmenes |

Las cinco pruebas unitarias nuevas cubren zona muerta/analógico/diagonal/apuntado, todos los flancos del mapeo estándar, identificadores USB/Bluetooth/genéricos simulados, desconexión, mapeo no estándar/ejes invertidos, preferencias corruptas/acotadas, asistencia y continuidad positiva/negativa de calles.

Una ejecución inicial de la prueba de mundo no cumplió su umbral temporal de desplazamiento del jefe. Se repitió sin cambiar la lógica del jefe y la suite completa pasó. La medición final, con otros navegadores de pruebas ejecutándose, fue mediana 13,3 ms y P95 21,7 ms con 24 enemigos; no es una garantía de rendimiento para otros equipos.

## Revisión visual

Capturas: `streets-v13.png`, `pad-controls-v13.png`, `pad-pause-v13.png`, `pad-upgrades-small-v13.png`, `pad-settings-small-v13.png`. Se revisó contraste asfalto/vereda, cruce, foco y legibilidad. El mapa conserva sus colisiones transitables. Materiales de referencia: `D:/Descargas/Hoja de baldosas cyberpunk urbana.png`; preparación mediante ImageGen y recorte/normalización en el cargador Phaser, no una textura de pantalla completa.

## Comprobación física pendiente

No hay un DualShock 4 físico disponible para esta ejecución. **USB y Bluetooth reales no se dan por verificados**: se comprobó la ruta estándar de Gamepad API mediante dispositivos simulados y estados conectados/desconectados. Ambos transportes usan esa misma ruta si el sistema operativo y navegador exponen el mando. El navegador puede requerir pulsar un botón antes de mostrarlo y no siempre comunica el modelo o transporte exacto.

Para comprobar hardware: abrir el juego local, conectar por USB, pulsar un botón y verificar estado/sticks/botones; repetir por Bluetooth; desconectar en combate y confirmar control por teclado. Si aparece mapeo no estándar, configurar botones y sticks desde la pestaña MANDO PS4 usando inicialmente el ratón. Preferencias locales al origen/navegador; el juego sigue funcionando si no hay mando o acceso a la API.
