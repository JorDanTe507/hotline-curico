# Hotline Curicó 0.7 — La Barredora y ruleta de armas

Actualización sobre Phaser 3 y TypeScript existentes. Se conserva el proyecto de la carpeta superior. Fecha de validación: 26–27 de octubre de 2026.

## Comportamiento vigente

Cervela comienza desarmado. Cada ronda abre una ruleta de 3,6 segundos: desplazamiento rápido con desaceleración durante 2,8 segundos y presentación del premio durante 0,8 segundos. El ganador se calcula antes de crear las tarjetas. Su centro termina exactamente en el indicador; se reproduce un sonido y aparece el mismo arma como objeto recogible con E, cerca de Cervela, con brillo y sobre suelo accesible. Las rondas siguientes conservan las armas y su munición; recoger el premio con dos armas sustituye solamente la activa.

Durante la ruleta se detienen física, movimiento, disparos, IA, temporizadores, tweens y reloj de simulación. No transcurre supervivencia, descanso, recarga, dash ni duración de Última Calada. El chaleco sigue sin tener duración temporal. ESC permite pausar y abandonar durante la ruleta. El jefe aparece y comienza su diálogo después de entregar el premio. Muerte, reintento y salida eliminan panel, máscara, tarjetas, callback pendiente y motor de la minigun.

### La Barredora

| Parámetro | Valor |
| --- | --- |
| Daño por bala | 12 HP |
| Cargador | 200 |
| Cadencia | 20 disparos/s, intervalo 50 ms |
| Preparación continua | 600 ms; soltar reinicia |
| Recarga | 4.000 ms |
| Movimiento mientras dispara | 80% de la velocidad normal |
| Penetración | Dos enemigos como máximo: 12 HP al primero y 6 HP al segundo |
| Paredes | Detienen la bala |
| Reserva inicial | 400 balas |
| Alcance / dispersión | 850 px / 0,08 rad |

La reserva, el alcance, la dispersión y la reducción al segundo objetivo son decisiones de implementación para los parámetros no especificados. El seguimiento por enemigo impide que una bala vuelva a dañar al primero mientras lo atraviesa. Las siete armas anteriores mantienen sus estadísticas. Solo la minigun compensa la deriva de fotogramas de su cadencia de 50 ms. Durante Última Calada funciona con munición infinita y una segunda arma distinta, incluido RPG. Los matones también respetan la preparación si recogen una minigun.

## Probabilidades

`src/config/roulette.ts` conserva las 16 propuestas originales, que suman 100. Las armas incompletas tienen `id: null` y quedan excluidas de selección y tarjetas. Los ocho pesos habilitados suman 70 y se normalizan a 100 para sortear:

| Arma funcional | Peso propuesto | Probabilidad efectiva de ruleta |
| --- | ---: | ---: |
| Pistola | 18 | 25,7143% |
| Revólver | 13 | 18,5714% |
| Subfusil | 12 | 17,1429% |
| Escopeta | 11 | 15,7143% |
| Rifle de asalto | 9 | 12,8571% |
| Rifle de precisión | 5 | 7,1429% |
| RPG | 1 | 1,4286% |
| Minigun | 1 | 1,4286% |

Los valores mostrados están redondeados; los cálculos usan los pesos completos. Mini Uzi, Magnum, recortada, M79, lanzallamas, bate, palanca y hacha no se entregan hasta implementar su comportamiento.

El botín usa una tirada independiente de la ruleta: RPG ocupa [0; 0,01), minigun [0,01; 0,02). Cada uno tiene 1% por generación de botín normal, usando el criterio existente del RPG; no es 1% garantizado por enemigo ni por ronda. Se conserva la decisión previa de si un enemigo genera botín y los objetos normales de inicio de ronda. El RPG especial de jefe conserva su única tirada del 10%; el chaleco sigue siendo una recompensa adicional con 5% normal y 25% para jefe.

## Recursos

La lámina suministrada se utilizó como referencia visual; no contiene una minigun identificable. Se recreó una minigun de seis cañones con la herramienta integrada imagegen, conservando el original transparente en `public/assets/weapons/minigun/source.png`.

El sprite final está en `public/assets/weapons/weapon-7.png`. Los archivos individuales `pickup.png`, `hud.png`, `spin-0.png`, `spin-1.png`, `fire-0.png`, `fire-1.png` y `flash.png` están normalizados a 32×32 en `public/assets/weapons/minigun/`; `casing.png` es el casquillo de 8×4. `tools/prepare_minigun.py` permite regenerar los recursos desde el original incluido. Phaser carga archivos individuales, nunca el atlas completo.

El prompt completo y la procedencia están en `public/assets/weapons/minigun/provenance.json`. Prompt empleado: una minigun aislada de seis cañones orientada a la derecha, pixel art de baja resolución, metal oscuro, reflejos de acero/cian y bordes magenta, siguiendo el atlas como referencia de estilo, fondo transparente y sin texto, personajes ni paneles. Se usó imagegen integrado, sin CLI ni API key.

Motor en bucle, disparo y recompensa son WAV locales sintetizados mediante `tools/generate_audio.py`. Respetan el volumen de efectos y el motor se destruye al soltar, pausar, recargar, morir o abandonar. Se conservaron la música y el vídeo de menú; no se editaron `MenuVideo.ts` ni el MP4. SHA-256 del vídeo: `44D145B6616A8C2434A0F8024C66880CE333F5D46E38F77B5B542CA4BAAC5E8C`.

## Pruebas ejecutadas

| Ejecución | Resultado |
| --- | --- |
| `tsc --noEmit` | Correcto |
| `tsx --test tests/*.test.ts` | 39/39 correctas |
| `vite build` | Correcto; `dist/` actualizado |
| `node check-v07.cjs` | Correcto en Edge; sin errores JavaScript |
| `node check-v062.cjs` | Correcto: chaleco, ulti, HUD, rondas, jefe, menú y tres reintentos |
| `node check-v061.cjs` | Correcto: vídeo/bucle/fallback, música, impactos, cadencias, RPG, dash, pausa y reintentos |
| `node check-v04.cjs` | Correcto: armas de enemigos, paredes, lanzamiento, aturdimiento, ejecuciones y cuatro reintentos |

Los fixtures de regresión se adaptaron al inicio desarmado y a la pausa de ruleta. Las pruebas históricas restantes no se ejecutaron en esta actualización. Vite mantiene su aviso de tamaño del bundle de Phaser superior a 500 kB; no impide compilar.

### Verificaciones solicitadas

1. Ruleta inicial: panel activo, ronda 1, inventario vacío y enemigos todavía sin aparecer.
2. Sin pistola predeterminada: E entrega el ganador elegido, sin equiparlo automáticamente.
3. Rondas posteriores: ruleta en supervivencia, boss y siguiente exterminio.
4. Pesos: tabla propuesta y tabla habilitada normalizada suman 100; barrido determinista de 70.000 posiciones reproduce sus proporciones.
5. Ganador: tarjeta centrada, texto y objeto entregado coinciden.
6. Cadencia: 20 disparos en un segundo de ráfaga; comprobación a 60 FPS y en el flujo de disparo de Game.
7. Preparación: cero disparos a 599 ms; primero a 600 ms; soltar exige otros 600 ms.
8. Minigun legendaria: icono, tarjetas doradas luminosas y 1% normal verificados; sin depender de que un sorteo aleatorio la entregue durante una partida corta.
9. RPG: 1% normal y única tirada de jefe del 10%, estadísticas y explosión conservadas.
10. Jefe: no aparece durante la ruleta; después inicia diálogo, combate con 450 HP y transición tras derrotarlo.
11. Relojes: supervivencia, tiempo total, regeneración, duración de ulti y temporizadores permanecen congelados.
12. Enemigos: un enemigo insertado expresamente durante la prueba no se desplaza ni ataca; el jugador tampoco dispara ni se mueve y no recibe daño durante el panel.
13. Reintentos: tres muertes con ruleta activa crean una nueva ruleta limpia, sin premio anterior ni motor residual; salida a menú también limpia.
14. Inventario: conserva dos armas y munición durante el sorteo; E reemplaza solo la activa y mantiene el límite de dos.
15. Continuidad: recorrido acelerado por exterminio, supervivencia, boss y ronda 6; se conservan HUD, protección, botiquines, dash, ejecuciones, ulti y menú.

Además se verificaron recarga exacta de cuatro segundos, penalización del 20% solo durante ráfaga, velocidad completa al soltar, daño 12/6 a dos objetivos sin repetir daño al primero, colisión física contra pared y disparo dual infinito con RPG. Las pruebas aceleran algunos relojes y transiciones mediante la API de la escena; la primera animación de ruleta se ejecuta en tiempo real. No sustituyen una sesión extensa de equilibrio jugada manualmente.

Capturas: `roulette-v07.png`, `roulette-result-v07.png`, `minigun-v07.png` y las capturas de regresión de HUD, jefe y menú. Se revisaron visualmente las capturas de ruleta, resultado y minigun.

## Ejecutar

`pnpm dev` o `npm run dev`, y abrir la URL indicada por Vite. Para repetir las pruebas: `npm test`, `npm run build` y `npm run test:browser:v07`. Las pruebas de navegador requieren Edge y Playwright; usan `GAME_URL` si está definida. La verificación 0.7 usó `http://127.0.0.1:5175`; las regresiones usaron el servidor existente en el puerto 5174.

