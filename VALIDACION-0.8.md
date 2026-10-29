# Hotline Curicó 0.8 — renovación visual del mapa

Validado el 27 de octubre de 2026 sobre el proyecto existente de Phaser 3 y TypeScript. Se mantiene el mapa fijo de 40×28 casillas de 48 px, sus 12 zonas conectadas y sus obstáculos; no se añadió un generador ni se cambiaron las reglas de combate.

## Recursos integrados

La referencia mide 1536×1024. `tools/extract_map.py` utiliza rectángulos explícitos dentro de sus paneles; no corta automáticamente la lámina en cuadros. `public/assets/maps/crops.json` guarda coordenadas, método de limpieza, dimensiones y SHA-256 del original.

- 15 muestras de materiales normalizadas a 32×32: pizarra, baldosas lilas, damero, madera, cerámica, azul, rojo, asfalto, hormigón, industrial, ladrillo, pared, acero, reja y superficie deteriorada. Los bordes se hacen continuos mediante muestras espejadas; el mapa las dibuja a 48 px para conservar sus dimensiones físicas.
- 33 recursos preparados: sofá, escritorio/mesón, mesa, expendedora, camas, armario, mesita, lavadora, secadora, estantería, caja, barril, contenedor, maquinaria, tuberías, vehículo, planta, basura, puerta, señales SALIDA/HOTEL/estacionamiento, grafiti, alfombra, tres manchas de sangre, marca de impacto, reflejo, lámpara y máscara de luz. Algunas variantes auxiliares quedan preparadas sin colocarse en el escenario.
- Los objetos conservan proporción, transparencia y relleno del lienzo. Los grandes usan lienzos de 64×32 o 32×64. Se revisaron los recortes mediante `map-assets-v08.png`.
- Los archivos individuales se conservan y además se empaquetan en `environment.png`/`environment.json` para compartir textura. `tiles.png` contiene únicamente los materiales ya normalizados. La lámina de presentación completa nunca se carga en Phaser.

No fue necesario recrear ilustraciones mediante IA. Se derivaron materiales continuos a partir de los recortes y se generó por código una máscara radial neutra de iluminación. Las tapas, pequeñas caras de pared, marcos abiertos, pintura de estacionamiento y remate del mesón usan gráficos sencillos de Phaser. La variante de cama azul extraída no se utiliza para evitar una silueta demasiado ancha; se reutiliza la cama cenital vertical con tintes distintos.

Las señales y el grafiti son elementos del escenario. No se incorporaron títulos de categorías, bordes magenta ni etiquetas de la presentación del atlas.

## Escenario y colisiones

Recepción con mesón y expendedora; sala común con sofá, mesa y expendedora; dormitorios con camas, muebles y alfombras; lavandería con lavadora, secadora, estantería y remate de mesón; pasillos con puertas, marcos abiertos, luces y señales; mantenimiento y bodega con maquinaria, tuberías, cajas, barriles y contenedor. La última zona se presenta como patio/estacionamiento con asfalto, vehículo, pintura, ladrillo, reja y grafiti.

Los 25 muebles principales cubren exactamente las 36 casillas de obstáculos ya existentes. Cada huella sólida tiene una base visual; no se añadieron obstáculos invisibles. Los cuerpos estáticos siguen siendo de 48×48. La navegación sigue consultando la misma cuadrícula que las colisiones y reconoce así todos los obstáculos sin modificar la IA. Pisos, sangre, reflejos, alfombras y pequeñas decoraciones no crean cuerpos físicos. Los pasos de dos casillas entre habitaciones siguen abiertos.

## Capas, ambiente y efectos

1. Piso: TilemapLayer compartida.
2. Alfombras, reflejos, basura y manchas sobre el suelo.
3. Paredes: segunda TilemapLayer, con tapas y pequeña cara inferior dentro de la casilla sólida.
4. Bases y muebles. El orden de los muebles y personajes depende de la altura de sus pies; Cervela aparece delante al pasar por su lado inferior.
5. Personajes, armas, etiquetas y proyectiles conservan su visibilidad de combate.
6. Luces aditivas tenues, magenta/cian/azul/amarillo, por encima del mundo y debajo del HUD.
7. HUD transparente existente.

Hay 12 luces ambientales y un límite configurable de 16. El pequeño parpadeo solo actualiza alfa, sin generar texturas ni temporizadores. No hay filtro negro global ni luces dinámicas de coste elevado.

Al morir un enemigo se coloca una de tres manchas cerca de sus pies, con orientación y tamaño variables. Permanecen durante la ronda y el descanso, hasta un máximo de 64; al alcanzar el límite se retira la más antigua. Las marcas pequeñas de bala solo se colocan si hay una celda sólida junto al punto de impacto, con un máximo de 80. No modifican colisiones. Ambos grupos se limpian al comenzar la siguiente ronda y al destruir la escena.

## Pruebas y resultados

| Ejecución | Resultado |
| --- | --- |
| `tsx --test tests/*.test.ts` | 42/42 aprobadas |
| `tsc --noEmit` | Correcto |
| `vite build` | Correcto; `dist/` actualizado |
| `python tools/verify_map.py` | 15 materiales con continuidad exacta de bordes, transparencia y 33 cuadros válidos |
| `node check-v08.cjs` | Correcto en Edge; sin errores JavaScript |
| `node check-v07.cjs` | Correcto: ruleta, premio, inventario, minigun, disparo dual, paredes y limpieza |
| `node check-v062.cjs` | Correcto: protección, ulti, HUD, rondas, jefe, menú y reintentos |

La comprobación de recarga de `check-v07.cjs` usa ahora tolerancia de 0,000001 ms para la resta del reloj de punto flotante. Las cantidades de munición y los límites temporales comprobados no se relajaron; no se modificó el sistema de armas.

### Verificaciones solicitadas

1. Nuevas texturas: inspección visual de recepción, sala común/lavandería, exterior/industria, vista general y combate con jefe.
2. Sin bordes de presentación: recortes interiores explícitos y revisión de la hoja de recursos.
3. Sin títulos del atlas: las únicas letras del mapa son señalización y nombres de zonas del juego.
4. Pisos continuos: bordes opuestos de cada PNG coinciden exactamente; las capas no dejan separaciones de un píxel.
5. Paredes/colisiones: todas las celdas estructurales coinciden con la capa de paredes; todos los sólidos tienen el cuerpo previsto.
6. Navegación: todas las casillas transitables son alcanzables desde el inicio. Un matón rodeó físicamente los muebles y recogió un arma.
7. Recogida: E recogió un chaleco sobre suelo transitable; decoración sin cuerpos añadidos.
8. Disparos: una bala real chocó con pared y dejó una marca sin alterar los sólidos.
9. Rondas: transición de jefe a ronda 6 con nueva ruleta y limpieza de manchas.
10. Jefe: movimiento y disparo de escopeta comprobados en el escenario renovado.
11. HUD: no existe franja opaca superior; la protección permanece debajo de la vida y los elementos decorativos no son interactivos.
12. Rendimiento: muestra de 120 intervalos de animación en Edge headless con 24 enemigos, minigun en ráfaga y 12 luces: mediana 5,6 ms, percentil 95 de 6,1 ms. El número de texturas se mantuvo constante. Es una muestra breve del entorno de prueba, no una garantía para cualquier equipo.
13. Reintentos: tres reinicios conservaron exactamente las cantidades de texturas, objetos, cuerpos y sólidos de referencia; volvieron dos capas, 12 luces y grupos vacíos de manchas/marcas.

Además se probaron los límites de 64 manchas y 80 impactos con 200 inserciones, variación de manchas, continuidad física de puertas abiertas y ausencia de efectos sobre la cuadrícula. Las regresiones confirman que siguen funcionando Última Calada, La Barredora, RPG, ruleta, inventario, protección, botiquines, dash, rondas y menú animado.

Vite conserva el aviso de tamaño del bundle de Phaser superior a 500 kB, sin impedir la compilación. Las suites históricas restantes no se ejecutaron en esta actualización.

## Archivos añadidos o modificados

| Archivo | Cambio |
| --- | --- |
| `src/maps/MapVisuals.ts` | Carga, capas, decoración, profundidad, luces y efectos limitados |
| `src/maps/environment.ts` | Materiales por zona, huellas de muebles, límites y profundidad |
| `src/maps/apartments.ts` | Nombre del patio; generación y transitabilidad conservadas |
| `src/scenes/Game.ts` | Integración visual, impactos/sangre y limpieza de escena |
| `src/systems/RoundDirector.ts` | Limpieza de manchas y marcas al comenzar ronda |
| `src/main.ts` | Precarga de los dos atlas normalizados |
| `src/scenes/Menu.ts` | Etiqueta de versión 0.8 |
| `public/assets/maps/` | 50 PNG preparados y dos JSON de cuadros/procedencia |
| `tools/extract_map.py` | Extracción reproducible; admite `--source` |
| `tools/verify_map.py` | Verificación de bordes y transparencia |
| `tests/environment.test.ts` | Huellas, accesos, materiales y recursos |
| `check-v08.cjs` | Integración visual/física, jefe, rendimiento y reinicios |
| `check-v07.cjs` | Tolerancia numérica en una comparación de reloj |
| `package.json` | Versión 0.8.0 y comando `test:browser:v08` |
| `README.md`, `VALIDACION-0.8.md` | Estado actual y resultados |
| `dist/` | Compilación de producción actualizada |

No se cambiaron estadísticas ni lógica de armas, minigun, ruleta, chaleco, ulti, dash, botiquines, navegación, IA del jefe, música, vídeo o audio del menú.

Capturas de esta validación: `map-assets-v08.png`, `map-overview-v08.png`, `map-reception-v08.png`, `map-common-laundry-v08.png`, `map-industrial-exterior-v08.png`, `map-boss-v08.png`.

Para jugar: iniciar `npm run dev` o `pnpm dev` y abrir la URL indicada. La verificación nueva utilizó `http://127.0.0.1:5176`; las regresiones utilizaron los servidores locales existentes. `npm run test:browser:v08` requiere Edge y Playwright y acepta `GAME_URL`.
