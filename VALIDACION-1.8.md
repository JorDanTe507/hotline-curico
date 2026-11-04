# Hotline Curicó 1.8 — Arsenal del Caos

Validación local: 2 de noviembre de 2026. Base: cambios locales de 1.7.4, conservados. Paquete npm: 1.8.0; versión mostrada: 1.8.

## Estado de las etapas

- A — Inventario, selección, HUD y entrada: terminada.
- B — Cinco arrojadizos y sus efectos: terminada.
- C — Barriles, cadenas y persistencia por partida: terminada.
- D — Botín y compatibilidad: terminada.
- E — Recursos, sonidos y novedades con historial: terminada.
- F — TypeScript, suite y navegador/producción: terminada en el entorno local automatizado. Pendientes únicamente pruebas manuales en Android físico, DualShock físico y valoración de dificultad/sonido jugando.

No se añadieron cooperativo, mecánicas de 1.9 ni cambios a diálogos o tamaños de jefes. No se hicieron commits, push ni despliegues. HEAD continúa en e0a2c75 (1.7.3 publicada); la base 1.7.4 y esta 1.8 son cambios locales sin commit.

## Controles

| Dispositivo | Preparar y lanzar | Cambiar tipo | Recuperar cuchillo |
|---|---|---|---|
| Teclado/ratón | Mantener B o botón derecho; soltar | C | E |
| Mando estándar | Mantener L3; soltar | Cruceta izquierda/derecha | Cruz |
| Táctil | Mantener APUNTAR/SOLTAR; soltar | TIPO | RECOGER |

El apuntado usa ratón, stick derecho o joystick derecho existentes. G/L1 y el botón táctil LANZAR siguen arrojando el arma equipada. No se ralentiza el juego al preparar. Pausa, muerte, estados incompatibles, pérdida de foco y cancelación táctil cancelan sin consumir; desconectar el mando también cancela. Se bloquea la repetición hasta soltar.

Inventario independiente [3,2,2,2,4], vacío para ambos protagonistas y al reiniciar. No modifica guardados de monedas, mejoras o logros.

## Balance configurable

Valores en `src/chaos/config.ts`, distancias en unidades de mundo y tiempos en ms:

| Objeto | Capacidad | Alcance / velocidad | Efecto |
|---|---:|---|---|
| Fragmentación | 3 | 480 / 620 | Daño principal 100, radio 145; exactamente 4 metrallas, 18 daño, radio 48, recorrido 145. No generan nuevas metrallas. |
| Molotov | 2 | 380 / 680 | Radio 95; suelo 6000 ms, 3300 con lluvia exterior. Quemadura refrescada 1500 ms; 2 daño cada 250 ms (jefes 1). Temporizador único por víctima, incluso con zonas superpuestas. |
| Cegadora | 2 | 420 / 620 | Radio 180; aturdimiento ejecutable existente de 3200 ms para enemigos normales. |
| Eléctrica | 2 | 400 / 620 | Daño 12, radio 155; interrupción 220 ms y velocidad ×0,55 durante 2600 ms. No habilita ejecución. |
| Cuchillo | 4 | 650 / 1350 | Directo; mata al básico de tier 0. Otros enemigos: 40; escudo: 20; jefe: base 25 antes de resistencia. Se recupera una sola vez con token conservado al descargar chunks. |

- Explosiones nuevas contra jefes: ×0,65; límite compartido de 65 por lanzamiento de fragmentación, incluidas sus metrallas y barriles encadenados. Contra normales: 120. Daño propio: ×0,35 y máximo 42 por lanzamiento.
- Barriles: daño 110 y radio 170, con caída por distancia contra enemigos. Una cadena comparte límites de 240 por normal, 110 por jefe y 70 de daño propio. Armadura, resistencia y definitivas se aplican después mediante Game.damage, sin invulnerabilidad nueva.
- Control de jefes: interrupción de 120 ms, efecto máximo 600 ms; velocidad eléctrica ×0,85. Inmunidad a nuevas aplicaciones durante 4000 ms desde la primera; no se extiende al repetir. Nunca ejecutables por estos efectos.
- Molotov contra jugador: 1 daño por tick reutilizando Burning. La lluvia solo afecta al fuego exterior al crearlo; no apaga todo inmediatamente.
- Lanzamientos separados 220 ms. Reserva de capacidad para las cuatro metrallas antes de consumir. Máximos de 48 proyectiles potenciales, 8 zonas de fuego y 64 efectos animados activos. Limpieza al terminar y al cerrar la escena.

## Aparición y botín

- Barriles: 22% de chunks candidatos, como máximo dos; segundo barril ocasional cercano. Posiciones exteriores despejadas, fuera del margen de edificios, puertas, jugador, Tío Aceite y cajas. Conservan el estado destruido al ir y volver.
- Exploración: 14% por chunk elegible, una unidad aleatoria, sin regenerarla al volver.
- Caja normal: 12% de recompensa adicional; conserva primero sus pesos anteriores (munición 45%, botiquín 22,5%, adrenalina 7,5%, HC 20%, nada 5%).
- Caja fuerte: 18% adicional; mantiene su arma y la interacción de seis segundos.
- Enemigos especiales (tier 4 o >=12, excluidos jefes): 14% adicional, una tirada por baja.
- Cofre misterioso: permanece en 500 HC y entrega solamente armas.
- Inventario lleno: el objeto queda en el suelo. Los NPC no usan ni recogen los arrojadizos nuevos.

## Recursos

Se extrajeron 62 PNG individuales de las cuatro láminas verificadas en D:/Descargas. No se usa ninguna lámina completa como textura del escenario. Manifest en `public/assets/v18/manifest.json`.

Incluye cinco iconos, cinco pickups, cinco proyectiles, cinco variantes de barril, ocho fotogramas de cada efecto (explosión, fuego, cegadora, descarga y explosión de barril), restos y cuchillo recuperable. Eliminación por conectividad del blanco de presentación; negros y blancos internos conservados. Destello y descarga usan mezcla aditiva para sus fondos oscuros. Escalado proporcional. Se mantienen los sprites propios de Cervela y Nicolás y su pose de lanzamiento/melee existente.

Doce WAV originales sintetizados, sin muestras externas, dedicados a lanzamiento, fragmentación, metralla, botella, fuego, cegadora, electricidad, cuchillo, recuperación, barril y recogida. Declaración CC0 en `public/assets/audio/LICENSE.txt`; generador reproducible en `tools/generate_chaos_audio.py`. Volumen de efectos compartido. Sin recursos gráficos faltantes conocidos.

## Pruebas ejecutadas

- `tsc --noEmit`: correcto durante desarrollo y en build.
- `npm run build`: correcto; Vite conserva la advertencia previa por chunk JS superior a 500 kB. No impide compilar.
- `tsx --test tests/*.test.ts`: **186/186**, cero fallos.
- `check-chaos18.cjs`: inventarios, cuatro metrallas, límites de daño, quemadura directa, lluvia exterior/interior, superposición sin multiplicar ticks, cegadora ejecutable, eléctrica no ejecutable, resistencia de jefe, cuchillo básico y recuperación única con streaming/inventario lleno, bala enemiga y del jugador, daño entre enemigos, tres barriles encadenados una vez, caja normal destruida y contenedores protegidos, persistencia, ratón real, foco, muerte, armadura y daño propio, mando estándar simulado, botín adicional y caja fuerte, reinicio de ambos personajes. Sin errores JS/HTTP.
- `check-chaos18-mobile.cjs`: eventos táctiles emulados de mantener/soltar/cancelar, selector visible con cinco contadores, cambio de tipo y pausa anterior. Sin errores JS.
- `check-chaos18-production.cjs`: distribución real de dist bajo `/hotline-curico/`, notas 1.8 e historial 1.7.4, 62 recursos solicitados correctamente, archivos de audio incluidos, HUD y selección táctil, inventario cero y ausencia de global de depuración. Sin errores JS/HTTP.
- `check-final174.cjs`: ambos personajes, apagón global, tintes especiales y recuperación, chunks nuevos durante pausa, lluvia/niebla, cinco jefes, XP por bajas única, 1000 disparos reales de minigun, recogida/HUD, teclado, mando simulado y disparo táctil emulado. Correcto.
- `check-arsenal.cjs` con GAME_URL=http://127.0.0.1:5180/: 16 armas del jugador y NPC, munición, recogida, lanzamiento G, aturdimiento, streaming, armas duales, recarga y limpieza de reinicio. Correcto.
- `check-fortune16.cjs`: cajas, progreso de caja fuerte, 500 HC y arma de ruleta, cinco jefes (rondas 5/10/15/20/25), ataques, vida, transiciones, streaming y tres botiquines. Correcto.
- `git diff --check`: sin errores de espacios.

La emulación táctil no equivale a una prueba en teléfono físico. Tampoco se conectó un DualShock real USB/Bluetooth. Las cotas de efectos se comprobaron automáticamente; no se promete una tasa de FPS en hardware Android sin medirla allí.

Correcciones encontradas durante validación: refrescar el cuerpo estático del barril después de escalarlo para centrar su colisión, y anclar el selector táctil al viewport para que no quedara fuera de pantalla. Las pruebas de botín separan la tirada nueva de los premios originales.

## Archivos de esta actualización

Nuevos:
- `src/chaos/config.ts`, `Inventory.ts`, `DamageBudget.ts`, `Barrels.ts`, `ChaosSystem.ts`, `assets.ts`.
- `public/assets/v18/*.png` y `manifest.json`; doce WAV en `public/assets/audio/`.
- `tools/prepare_chaos_assets.cjs`, `tools/generate_chaos_audio.py`.
- `tests/chaos18.test.ts`; `check-chaos18.cjs`, `check-chaos18-mobile.cjs`, `check-chaos18-production.cjs`; este informe.

Integraciones modificadas:
- `src/main.ts`, `src/scenes/Game.ts`, `src/scenes/Menu.ts`.
- `src/input/PadState.ts`, `src/input/PadControls.ts`.
- `src/mobile/MobileUI.ts`, `MobileMenus.ts`, `mobile.css`.
- `src/systems/SurvivalSystem.ts`, `AudioSystem.ts`; `src/weapons/Burning.ts`.
- `src/world/WorldStreamer.ts`, `ChunkLootStore.ts`, `FortuneObjects.ts`, `TioAceite.ts`.
- `src/config/releaseNotes.ts`, `package.json`, `package-lock.json`, `public/assets/audio/LICENSE.txt`.
- `tests/atmosphere173.test.ts` (versión/historial); `check-fortune16.cjs` (no confundir recompensa adicional con premio antiguo).

Los demás cambios preexistentes de 1.7.4 se conservaron; no deben confundirse con archivos modificados exclusivamente por 1.8 al mirar git diff contra la versión publicada.

## Probar localmente

Desarrollo utilizado: http://127.0.0.1:5180/ . Vista previa de producción: http://127.0.0.1:5181/hotline-curico/ . Estos enlaces son locales al computador.

Para iniciar desde la carpeta del proyecto: `npm run dev`. Para acceso LAN desde teléfono, usar el script existente `npm run dev:mobile` y la IP LAN del computador; no se ha configurado un despliegue nuevo ni cambiado la publicación en GitHub.
