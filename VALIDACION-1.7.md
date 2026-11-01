# Validación 1.7 — Curicó nunca duerme

Fecha: 2026-11-01. Base local: 1.6.3. Publicación autorizada por la solicitud, condicionada a completar las comprobaciones. Este documento registra la validación local; la respuesta final y GitHub Actions confirman el resultado real del despliegue.

## Implementación

- Clima: despejado/lluvia/niebla, probabilidades 40/35/25%, duración de 2–4 rondas, transiciones suaves. No se reinicia al entrar a edificios y se mantiene en los jefes. Lluvia y suelos mojados se excluyen de los interiores; la niebla se dibuja por debajo de actores y proyectiles.
- Pavimento normal en seco, capas de humedad exteriores, reflejos poco frecuentes y hasta seis charcos por sector. No modifica velocidad ni colisiones.
- Apagones: identidad por clave de sector, 20–45 segundos de reloj activo, oscurecimiento moderado de 18% bajo actores, luces normales atenuadas y emergencia roja/amarilla. Recuperación automática, sin interacción con generadores. El estado lógico no depende de que el sector esté renderizado.
- Director: un evento importante por sector, recuperación global 45 s y sectorial 90 s; evita repetir el último tipo. Eventos ambientales y pequeños grupos de combate. Emboscadas/refuerzos a partir de ronda 3, sin jefes, salud crítica ni sobrecarga. Director automático considera salud, enemigos, ronda, tiempo, sector, eventos recientes y calidad; no aumenta el daño de enemigos.
- Refuerzos: hasta dos por evento y cuatro por ronda, límite total existente de 24 enemigos; reserva y aviso antes de aparición. Puntos transitables a 650–1200 píxeles, fuera de cámara al planificar y con ruta al jugador. Pasa por Game.spawn y la transacción normal de rondas, XP y recompensas. Vencimiento de 10 s libera reservas/objetivo y evita bloquear la ronda.
- Zonas: estacionamiento con Spark/Lanos/Aveo/Cerato, marcas/topes/señales/caseta; bodega con estantes, pallets, máquina, puerta y generador decorativo; callejón con tres corredores estrechos abiertos en ambos extremos, contenedores/bolsas/desagüe/faroles; COPEC con tres surtidores, marquesina, identidad visual, tienda accesible, estantes/frigorífico/mostrador, señalética y decoración. COPEC puede ofrecer un botiquín mediante el sistema existente, una tirada por tienda (35%).
- Las ocho familias anteriores permanecen. Los sectores se regeneran determinísticamente desde la misma semilla; cajas y botín conservan sus sistemas persistentes existentes. Solo nueve sectores mantienen objetos gráficos activos.
- Recarga: porcentaje real, LISTO, CARGADOR VACÍO y SIN MUNICIÓN; HUD de escritorio y móvil. Respeta arma, reserva, pausa, lanzamiento, muerte y definitivas. Última Calada muestra infinito y no inicia recargas innecesarias ni emite una finalización falsa durante munición infinita. RPG sin reserva y melee mantienen sus reglas.
- Calidad: ventanas de cuatro segundos e histéresis de doce segundos. Reduce lluvia 100→55→24, niebla 2→1 capas y charcos/reflejos antes de afectar cualquier elemento de combate. No cambia colisiones, enemigos o proyectiles importantes.
- PROJECT507: desde pausa, CIUDAD 1.7 · PRUEBAS permite clima, apagón/restauración, evento ambiental, emboscada/refuerzos, viajes seguros a las cuatro zonas, estado/FPS y ciclo de armas para probar recargas. Conserva selector paginado, inmortalidad y HC de prueba. Los logros/guardados siguen aislados por DeveloperSession.

## Archivos de 1.7

Nuevos:

- src/atmosphere/CityState.ts, CityAtmosphere.ts y CityDevPanel.ts.
- src/world/UrbanZones.ts, urban17Assets.ts y urban17Manifest.ts.
- src/ui/ReloadFeedback.ts; public/assets/v17/*.png (61 recursos).
- prepare-assets17.cjs; tests/city17.test.ts.
- check-city17.cjs, check-city17-mobile.cjs, check-city17-arsenal.cjs, check-city17-production.cjs.
- RECURSOS-1.7.md y este informe.

Integración:

- src/main.ts; src/world/WorldModel.ts, WorldStreamer.ts y BuildingSupplies.ts.
- src/systems/RoundDirector.ts y SurvivalSystem.ts; src/scenes/Game.ts y Menu.ts.
- src/ui/CombatHud.ts y PauseMenu.ts; src/input/InputHub.ts.
- src/mobile/MobileUI.ts y MobileMenus.ts; src/config/releaseNotes.ts.
- tests/v15.test.ts y maintenance162.test.ts reconocen los nuevos interiores, conservando las comprobaciones de conectividad, puertas y suministros anteriores.
- package.json, package-lock.json, .gitignore y README.md.

Los cambios locales anteriores de 1.5.2 a 1.6.3 forman parte de la base que se publica; no se descartaron ni reconstruyeron. Los informes anteriores documentan ese trabajo. Se guardó un respaldo lógico del código anterior a 1.7 en .publication-lock, excluido de Git.

## Pruebas ejecutadas

- TypeScript sin errores.
- 165 pruebas unitarias aprobadas, cero fallos: clima, apagones, director, calidad, zonas, conectividad, persistencia, recarga y todas las suites existentes.
- npm run build correcto. Advertencia de bundle Phaser superior a 500 kB; no impide producir el build.
- check-city17: cuatro zonas reales, lluvia/humedad, recarga de sectores sin duplicados, apagón/emergencias/recuperación, emboscada a través del Director y reservas de ronda, cancelación por vencimiento, jefe sin extras y con niebla, recarga real/pausa/finalización. Sin errores HTTP/JavaScript.
- check-city17-mobile: emulación Pixel 7 horizontal; PROJECT507, botones táctiles de clima/viaje COPEC/apagón, reloj congelado en pausa, recarga visible y reanudación.
- check-city17-arsenal: dieciséis reglas de recarga, sin carga anticipada ni duplicación de munición, lanzamiento cancela, efectos al 0%, doce saltos de sectores. Nueve sectores cargados, recursos acotados. Texturas de rótulos fluctúan con los interiores cargados y vuelven a bajar; no se exige un número idéntico entre zonas diferentes. Una muestra headless local registró unos 73 FPS; no es una garantía de rendimiento en otros equipos.
- check-city17-production: build real bajo /hotline-curico/, usando solamente interfaz táctil, con los 61 recursos, COPEC, lluvia/apagón/recarga y sin global de depuración.
- check-visual163 y check-visual163-mobile: menú animado silenciado/bucle/fallback/preferencia, ambos protagonistas, hitboxes conservados, opciones de audio desde pausa, guardado y Escape.
- check-visual163-production: navegación normal en escritorio y móvil emulado bajo la ruta de publicación.
- check-maintenance162 y variante móvil: cinco jefes, Tryhard, suministros, cuatro puñetazos por caja, ratón/R2/táctil, sin errores de recursos.
- check-balance152: ambos protagonistas y rondas 1–5 sin inmortalidad, daño, chaleco, Calada, botiquines y El Torturado.
- check-requiem153: penetración, desafíos, definitivas, logro y guardado.
- Inspección visual de recortes y capturas de zonas. Git diff --check sin errores de espacios.
- Comparación SHA-256 de los 393 archivos de public con dist: sin diferencias en el build local. Dos láminas de preparación v163 permanecen locales y no forman parte del repositorio publicado; ninguna carga de ejecución las necesita.

## Límites de comprobación

No hubo teléfono Android físico ni DualShock físico USB/Bluetooth. Se verificaron emulación táctil y entradas de mando simuladas; no se afirma una prueba física. No se realizó escucha humana del sonido ni una medición exhaustiva de FPS en hardware móvil.

Se conservan los respaldos de muerte direccional documentados en 1.6.3 por secuencias solapadas de aquellas láminas. No son sprites nuevos faltantes de las zonas 1.7.

La memoria lógica de eventos persiste por partida; no se implementó guardado/reanudación de una partida completa nueva. Monedas, mejoras, logros y configuraciones conservan el almacenamiento local existente. El progreso de localhost no se transfiere automáticamente al dominio de GitHub Pages.

## Publicación

Rama: main. Remoto origin: https://github.com/JorDanTe507/hotline-curico.git. Se comprobó antes de publicar que la rama remota seguía en 9b324b5e8741c86527762a1eef7e4a06673df491; no se requiere sobrescribir historial. Workflow existente: .github/workflows/deploy.yml, con npm ci, npm test, build y acciones oficiales de Pages.

No se incluyen node_modules, dist, credenciales, respaldos, capturas de QA ni láminas originales innecesarias de preparación. El commit y el resultado de Actions/Pages se comprueban después de registrar este informe. Enlace esperado: https://jordante507.github.io/hotline-curico/.
