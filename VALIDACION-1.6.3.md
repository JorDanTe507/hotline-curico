# Validación local 1.6.3 — Renovación visual

Fecha: 2026-11-01. Continuación de 1.6.2; se conservaron los cambios locales anteriores. Sin commits, push ni despliegue. HEAD continúa en 9b324b5e8741c86527762a1eef7e4a06673df491.

## Personajes y recursos

Se usaron las dos láminas proporcionadas en Descargas, conservadas en public/assets/v163/*-source.png. prepare-assets163.cjs y src/characters/buildDirectional.ts extraen componentes por panel, retiran solamente el fondo neutral conectado al exterior, descartan componentes cortados y alinean los pies. Atlas RGBA de celdas 96×112, sin encabezados ni separadores. No se eliminan indiscriminadamente blancos de camisa ni negros de ropa/cabello.

Ambos protagonistas usan sus propios perfiles arriba/abajo/izquierda/derecha. Estados nuevos: idle, caminar, correr/dash, golpe y daño. Las láminas tienen cantidades reales distintas de sus rótulos; se utilizan los fotogramas íntegros disponibles, sin inventar ocho cuadros.

Limitación explícita: muerte frontal de ambos, muerte izquierda de Cervela y muerte derecha de Nicolás conservan la animación anterior. Esas secuencias se solapan o no terminan limpiamente en el recurso nuevo. Cervela usa muerte nueva derecha/espalda; Nicolás izquierda/espalda. El manifiesto registra las secuencias y descartes.

Escala uniforme .66 para ambos, cuerpo de referencia de 90 píxeles → 59,4 píxeles visibles frente a los 55 anteriores (aprox. +8%). Se conserva exactamente el tamaño y centro del cuerpo físico anterior, recalculando tamaño/offset al cambiar de textura. Retratos de selección, diálogos y definitivas anteriores conservados. Las estelas usan el fotograma y origen correctos del nuevo atlas.

## Combate y alerta

El cuerpo nuevo está desarmado también al disparar: las armas equipadas siguen dibujándose aparte por WeaponCombat. Al lanzar se oculta inmediatamente la imagen del arma. El render usa el inventario vigente. El puñetazo usa punch.wav (golpe breve sintetizado localmente), sin disparos, fogonazos ni consumo de munición. Cadencia, daño, cajas y definitivas conservados.

Borde crítico: alfa de cada línea ×1,25; mismo pulso, umbrales e interior despejado. Sonido crítico: ganancia .60→.75 (+25%), multiplicada por el volumen de efectos existente. Sigue sin duplicarse y se detiene al silenciar, pausar o salir del estado crítico.

## Menú y pausa

Video original proporcionado: public/assets/v163/menu.mp4. Reproducción automática, bucle, muted/defaultMuted, volumen cero, sin controles ni entrada. Escala contain proporcional. Se libera al salir; volver crea una sola instancia. El fondo estático v161 queda debajo y funciona al desactivar el video o fallar su carga.

MENÚ ANIMADO guarda una preferencia local independiente. No borra monedas, logros ni mejoras. AudioSystem y MusicManager siguen siendo las fuentes únicas de volumen, con sus claves anteriores. El volumen de efectos actualiza también sonidos en curso; música sigue usando su administrador compartido.

Pausa añade CONFIGURACIÓN, reutilizando Controls y sus pestañas teclado/ratón y mando, además de la presentación táctil existente. Incluye efectos, música y menú animado. El mundo, reloj, física y animaciones permanecen pausados. Volver/Escape cierra configuración hacia pausa; después se puede reanudar. Se limpian entradas y se requiere soltar disparo para evitar acciones filtradas. La escena de opciones se eleva sobre Game y el escenario queda visible debajo.

## Archivos de esta actualización

- src/characters/PlayerAppearance.ts, directional.ts, directionalManifest.ts, buildDirectional.ts.
- src/main.ts y src/scenes/Game.ts: carga, apariencia, estelas, arma e integración de pausa.
- src/scenes/Menu.ts; src/ui/MenuVideo.ts, PauseMenu.ts, PresentationPreferences.ts.
- src/systems/AudioSystem.ts, CriticalHealth.ts, SurvivalSystem.ts.
- src/input/InputHub.ts; src/mobile/MobileMenus.ts y mobile.css.
- src/config/releaseNotes.ts; package.json, package-lock.json y README.md.
- public/assets/v163: dos fuentes, dos atlas y video; public/assets/audio/punch.wav.
- prepare-assets163.cjs; tests/visual163.test.ts; check-visual163.cjs, check-visual163-mobile.cjs y check-visual163-production.cjs.

Los otros cambios mostrados por Git pertenecen también a actualizaciones locales anteriores y no se descartaron.

## Comprobaciones

- TypeScript sin errores; npm run build correcto, Vite genera dist. Advertencia de tamaño del bundle superior a 500 kB; no impide compilar.
- 157 pruebas unitarias aprobadas, cero fallos.
- check-visual163: video activo/silenciado/proporcional y bucle real, desactivación persistente tras recarga, fondo estático, ambos protagonistas, igualdad exacta de hitboxes anteriores, cuatro direcciones, ausencia de arma equipada desarmado, configuración con reloj/física congelados, volumen inmediato/mute, Escape opciones→pausa→juego y reentrada con una instancia de video. Sin errores JavaScript/HTTP.
- check-visual163-mobile: emulación Pixel 7 horizontal, opciones táctiles, preferencia, ajuste de audio, retorno a pausa y reanudación. Fallo forzado del video conserva fondo estático y menú funcional.
- check-visual163-production: distribución bajo /hotline-curico/ y navegación de interfaz en escritorio/móvil emulado, sin errores HTTP/JavaScript ni global de depuración.
- check-maintenance162: cinco jefes, ataques/muertes, Tryhard, suministros persistentes y golpes con ratón/R2 simulado.
- check-maintenance162-mobile: pulsación FIRE táctil real emulada, cuatro puñetazos por caja, sin munición ni entradas atascadas.
- check-balance152: ambos protagonistas, aparición de rondas 1–5, daño real/mortal sin inmortalidad, El Torturado, inventario de tres botiquines y Requiem.
- check-requiem153: penetración, desafío, Calada, Tryhard, logro, recarga y guardado compatibles.
- Los 332 recursos de public están en dist y coinciden byte por byte mediante SHA-256.
- Inspección visual de hojas de contacto y capturas de juego/configuración.

No se probó en un teléfono Android físico ni con un DualShock físico por USB/Bluetooth. Los ensayos automatizados no sustituyen una valoración humana de dificultad o escucha del sonido. No se ejecutaron todos los scripts históricos: algunos esperan interfaces o sprites anteriores; se ejecutaron las suites pertinentes enumeradas.

No se publicó nada. El progreso local existente no fue eliminado.
