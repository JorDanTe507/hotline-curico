# Corrección local de escenarios — Tradicional

Base conservada: 2.2.2, HEAD a29764b. No se realiza commit, staging, etiqueta, push ni despliegue. Los cambios previos de economía permanecen intactos.

## Causa exacta del hotel

El nombre lógico `worn` correspondía al índice 14 de `public/assets/maps/tiles.png`. Su extracción histórica en tools/extract_map.py usa el rectángulo (1134,182,1167,237) de la lámina original: pertenece al panel **Paredes exteriores**, sobre un grafiti rojizo, no al de pisos interiores. El proceso de reflejar la muestra en cuatro cuadrantes convirtió ese motivo de pared en el patrón oscuro/rojo repetido.

WorldStreamer seleccionaba ese índice para todas las habitaciones no sanitarias de hoteles con `variant===2`. No eran enemigos, monedas, objetos de botín ni decoraciones independientes; eran tiles de la capa de suelo.

La selección del interior ahora está centralizada en InteriorFloor: se utiliza el material real del edificio (madera en el hotel), conservando cerámica en Baño/Consultorio. No se oculta una capa: se corrige qué recurso se coloca en ella. No se reemplazó el atlas completo, ni las texturas de los demás tipos de edificio, ni los índices existentes. El recurso antiguo queda sin seleccionarse como suelo de hotel. El resto de interiores conserva checker, blue, industrial, red, concrete y sus excepciones sanitarias.

## Causa de los pallets

El pallet del callejón ocupaba dos celdas completas de colisión (96 px) dentro de un carril de dos celdas, entre paredes. Aunque su dibujo es más estrecho, la huella física cerraba todo ese paso. La validación existente solo exigía conectividad global del sector; aceptaba el corte porque se podía rodear el bloque por fuera.

Se mantiene esa validación global y se añade una comprobación local previa para todos los props sólidos: las conexiones entre accesos del perímetro de una vecindad de dos tiles deben conservarse tras la colocación. Un desvío lejano ya no justifica sellar el pasillo. Los elementos sin colisión no reciben esta restricción física.

El pallet de la plantilla de callejón se conserva y se reubica de (8,7) a (4,4), relativo al sector del callejón, junto a la pared de su carril más ancho. No se elimina su colisión globalmente ni se borran todos los pallets. El carril derecho de dos tiles queda despejado; el carril central conserva un paso de un tile (48 px). La huella física de un enemigo normal medida en navegador es 19,25 × 18,64 px y recorrió 432 px mediante la navegación y física existentes, sin teletransporte.

## Archivos de esta corrección

- Modificado: src/world/WorldModel.ts — validación local y posición del pallet de callejón.
- Modificado: src/world/WorldStreamer.ts — selección correcta de materiales interiores.
- Nuevo: src/world/PropPlacement.ts — comparación de conectividad local antes/después, sin mutar la cuadrícula durante la prueba.
- Nuevo: src/world/InteriorFloor.ts — resolución de materiales de suelo interiores.
- Nuevo: tests/mapPlacementFixes.test.ts — caso del desvío global engañoso, materiales y muestreo procedural.
- Nuevo: tools/check_map_fixes.cjs — comparativas y recorrido físico en navegador aislado.
- Documentación y capturas: este informe y docs/map-fixes/.

Las copias anteriores y los fixtures JSON están en test-results/map-fixes/, ignorado por Git. No se modificaron src/economy, la lógica de monedas, magnetismo, monedero, XP, perks, combate, HUD, Boss Rush o guardados durante esta tarea. Los diffs existentes en esos sistemas pertenecen a la actualización de economía anterior.

## Validación procedural y pruebas

- Siete semillas: 0, 1, 25, 99, 507, 2026 y 2147483647.
- 84 sectores por semilla: 588 en total. Incluye coordenadas negativas y sectores distantes (40,−31), (−72,65) y (150,101), representativos de exploración prolongada; la geometría no depende del número de ronda.
- 234 callejones comprobados, con sus 234 pallets conservados. Verificadas las conexiones de los siete carriles/celdas de entrada con sus salidas.
- 135 hoteles; ninguna habitación selecciona worn como material. Puertas de todos los edificios muestreados libres y conectadas con el exterior.
- Determinismo: cada sector coincide con una instancia nueva de igual semilla.
- **313/313 pruebas automatizadas aprobadas**, sin fallos ni omisiones; incluyen economía, monedas, cooperativo, guardados y cuadrículas fijas de Boss Rush.
- TypeScript sin errores y compilación de producción correcta. Se conserva el aviso previo de Vite por chunk superior a 500 kB.
- Navegador Edge, perfiles nuevos: comparativas, inspección del índice real de la capa de suelo, enemigo recorriendo el callejón con Navigation/Arcade Physics, camino libre para el protagonista y navegación móvil de Tradicional. Sin errores de JavaScript o recursos.

Registros: test-results/map-fixes-tests.log, map-fixes-build.log y map-fixes-browser.log. La regresión adicional de economía también pasó: monedas entre rondas y sectores, imán global, agrupación de 50.000 HC, recogida simultánea, compra real de J2 por 500 HC, magnetismo permanente móvil y desarrollador sin persistencia real. Sin errores de recursos ni JavaScript. Registro: map-fixes-economy.log.

## Comparativas

Las imágenes «antes» son reconstrucciones controladas de la generación y selección anteriores del repositorio, con la misma semilla y cámara; no son capturas enviadas por el usuario. Para inspeccionar el interior se activa la transparencia normal de fachadas. Ninguna de estas intervenciones del comprobador modifica el producto.

Semilla 507: hotel del sector (0,−2), callejón del sector (−3,−4).

| Escena | Antes | Corregida |
|---|---|---|
| Hotel | [Ver](D:/Escritorio/ruletadbd/hotline-curico/docs/map-fixes/hotel-before.png) | [Ver](D:/Escritorio/ruletadbd/hotline-curico/docs/map-fixes/hotel-after.png) |
| Callejón | [Ver](D:/Escritorio/ruletadbd/hotline-curico/docs/map-fixes/alley-before.png) | [Ver](D:/Escritorio/ruletadbd/hotline-curico/docs/map-fixes/alley-after.png) |

## Prueba local y límites

[Probar Tradicional](http://192.168.1.6:5197/hotline-curico/), misma wifi si se utiliza un teléfono. La corrección se aplica al generar sectores nuevos y al iniciar partidas con el generador actualizado. No se reescriben guardados personales ni se cambia la economía de una run.

El muestreo no prueba todas las semillas posibles de un generador infinito. Las pruebas móviles utilizan emulación; no se utilizó un teléfono físico. No se cambió la versión ni se publicó esta corrección.
