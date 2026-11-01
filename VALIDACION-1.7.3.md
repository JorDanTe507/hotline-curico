# Hotline Curicó 1.7.3 — La ciudad se oscurece

Fecha: 1 de noviembre de 2026. Incluye y conserva las correcciones locales de 1.7.1 y 1.7.2. Publicación expresamente autorizada por el usuario para esta versión. No incorpora mecánicas de 1.8.

## Atmósfera

- Apagón: la sombra sectorial pasa de 0,18 a 0,62, a profundidad 8. Suelo/estructura se oscurecen; actores, objetos de combate, proyectiles y HUD conservan sus capas superiores. Se apagan los faroles del sector y se atenúan a 18 % los elementos eléctricos identificados (fachadas, letreros, surtidores/marquesina, luminarias). Las luces de emergencia permanecen. Se recuperan el tinte original y la luz al terminar. Ninguna sombra global ni cambio en duración/lógica de eventos.
- Niebla: capa inferior de 0,48 y velo de actores limitado a 0,16, con escalas y desplazamientos distintos. No hay blur, cambio de percepción de IA ni penalización de disparo. Proyectiles y HUD están sobre ambas capas. El nivel de calidad reducido conserva una capa.
- Lluvia: hasta 160 gotas nítidas (90/40 en niveles reducidos), variando longitud, velocidad, posición y opacidad. Se reutiliza un pool de 24 salpicaduras; se omiten interiores y sólidos. Suelo húmedo y charcos más visibles. Pool total fijo: 186 objetos meteorológicos, sin acumulación por sector.
- Audio: un único bucle por escena con interpolación exponencial de entrada/salida, atenuación bajo techo y ganancia ambiental máxima de 0,26 multiplicada por el volumen de efectos. No reproduce hasta que Phaser permita audio tras interacción del usuario. Respeta volumen/silencio y se destruye al salir de la partida.

## Procedencia del sonido

No existía audio de lluvia. `public/assets/audio/rain-ambient.wav` es síntesis procedural original, sin grabaciones ni muestras externas. Licencia CC0 1.0, declarada en `public/assets/audio/LICENSE.txt`. Fuente reproducible: `tools/generate_rain.py`, biblioteca estándar de Python, semilla fija. Bucle de seis segundos, mono PCM16 a 22050 Hz, 264644 bytes. No requiere atribución ni conexión a un proveedor externo.

## Novedades y versión

`CURRENT_VERSION` y el historial se centralizan en `src/config/releaseNotes.ts`. Menú de escritorio y móvil muestran 1.7.3. El apartado existente muestra la actualización actual y permite recorrer 1.7.2, 1.7.1 y versiones anteriores. Se conservan navegación, desplazamiento y diseño táctil. Paquete y lock: 1.7.3.

## Validación local

- TypeScript y `npm run build`: correctos. Artefacto final `dist/assets/index-Ca9l0e07.js`; CSS `index-Dn6X2TKP.css`. Persiste el aviso previo de Vite por bundle superior a 500 kB.
- 176 pruebas unitarias: correctas, sin fallos. Incluyen fades independientes del framerate, restauración de tintes, clasificación de elementos eléctricos, formato/tamaño/señal del WAV y orden del historial.
- `check-atmosphere173.cjs`: apagón localizado, luces apagadas, vecino sin oscurecer, recuperación automática, capas de niebla móviles, lluvia visible y variada, audio bloqueado antes del gesto, volumen efectivo reducido de aproximadamente 0,143 a 0,052 al ajustar efectos, mute, una sola instancia tras viajar, fade de salida y destrucción al cambiar escena. Sin errores JS/HTTP.
- Muestra local de carga con 20 enemigos armados y lluvia: pool de 186 efectos constante; aproximadamente 115 FPS en Edge headless de este equipo durante la muestra. Es una comprobación breve, no una promesa de FPS en teléfonos.
- Capturas de despejado/apagón/niebla/lluvia y novedades revisadas visualmente. HUD legible; escenarios y sprites distinguibles. No se exportan capturas de QA al repositorio.
- `check-bosses171.cjs`: ambos protagonistas, frases exactas y veinte encuentros en rondas 5–50, escala, impactos, Requiem, explosión, animaciones y puerta. Campo de tiro de la prueba despejado de cajas aleatorias, que podían bloquear correctamente los proyectiles.
- `check-bosses171-controls.cjs`: presentaciones de los cinco jefes con ambos protagonistas por tacto emulado; confirmación con mando estándar simulado.
- `check-balance172.cjs`: vendedor por ronda, sectores/climas/apagones, interacción, ausencia de duplicados, ruta y alternativas; caída y retirada de armas, enemigo desarmado, rechazo de oportunidad sin nuevas tiradas y especialistas.
- `check-city17.cjs`: cuatro zonas, apagones/recuperación, refuerzos y reserva de rondas, expiración sin bloqueo, clima en jefes y recarga.
- `check-city17-mobile.cjs`: herramientas, COPEC, lluvia, apagón, pausa y recarga mediante navegación táctil emulada. Se corrigió la carrera del viejo test de contraseña usando el formulario visible.
- `check-fortune16.cjs`: cajas, caja fuerte, ruleta, persistencia, recompensas, cinco jefes, streaming, tres botiquines y tacto emulado.
- `check-atmosphere173-production.cjs`: build local desde `/hotline-curico/`, versión e historial móvil 1.7.3/1.7.2/1.7.1, audio HTTP 200, 61 recursos de ciudad, COPEC/lluvia/apagón/recarga y ausencia del global de depuración en producción.
- Inventario previo a publicación sin claves privadas, patrones de tokens ni archivos mayores de 100 MB. `node_modules`, `dist`, logs y `.publication-lock` excluidos. `git diff --check` correcto. Remoto `origin` y rama `main` comprobados; sin divergencia ni sobrescritura de historial.

Los primeros ensayos visuales activaban artificialmente calidad baja al simular frames de 50 ms; se repitieron con intervalos de 16 ms. La comprobación de volumen espera la actualización del hilo WebAudio antes de leer la ganancia. Los ensayos finales pasan. No se afirma prueba física en Android ni con DualShock real.

## Publicación

La confirmación de commit, Actions y URL pública se entrega en el informe final, después de verificar el despliegue real. Se utiliza el workflow de Pages existente, sin cambiar credenciales ni configuración de permisos. El progreso de localhost no se transfiere automáticamente al dominio público; no se han modificado ni borrado las claves de guardado.

## Archivos incluidos

Los archivos de 1.7.1/1.7.2 estaban pendientes de commit: se incluyen conservados en esta publicación. Los informes anteriores documentan su validación en el momento en que eran solo locales.

- `VALIDACION-1.7.1.md`
- `VALIDACION-1.7.2.md`
- `check-atmosphere173-production.cjs`
- `check-atmosphere173.cjs`
- `check-balance172.cjs`
- `check-bosses171-controls.cjs`
- `check-bosses171.cjs`
- `public/assets/audio/rain-ambient.wav`
- `src/atmosphere/AtmosphereStyle.ts`
- `src/atmosphere/RainAmbience.ts`
- `src/bosses/BossGeometry.ts`
- `tests/atmosphere173.test.ts`
- `tests/balance172.test.ts`
- `tests/bosses171.test.ts`
- `tools/generate_rain.py`
- `check-city17-mobile.cjs`
- `check-city17.cjs`
- `check-fortune16.cjs`
- `package-lock.json`
- `package.json`
- `public/assets/audio/LICENSE.txt`
- `src/atmosphere/CityAtmosphere.ts`
- `src/atmosphere/CityState.ts`
- `src/bosses/NewBosses.ts`
- `src/bosses/Torturado.ts`
- `src/bosses/expansion.ts`
- `src/config/aceite.ts`
- `src/config/enemyBalance.ts`
- `src/config/releaseNotes.ts`
- `src/maps/MapVisuals.ts`
- `src/mobile/MobileMenus.ts`
- `src/scenes/Game.ts`
- `src/scenes/Menu.ts`
- `src/systems/AudioSystem.ts`
- `src/systems/RoundDirector.ts`
- `src/systems/SurvivalSystem.ts`
- `src/ui/BossDialogue.ts`
- `src/weapons/WeaponCombat.ts`
- `src/world/TioAceite.ts`
- `src/world/WorldModel.ts`
- `src/world/WorldStreamer.ts`
- `tests/city17.test.ts`
- `tests/v14.test.ts`
- `tests/v15.test.ts`
- `VALIDACION-1.7.3.md` (este informe).
