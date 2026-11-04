# Hotline Curicó 1.8.1 — Pulido y correcciones

Validación local: 2 de noviembre de 2026. Se conservan los cambios locales de 1.7.4 y 1.8. No se crearon commits ni se hizo push o despliegue.

## Alertas de salud

Se reutilizó `CriticalHealth` y su máquina `CriticalAlert`, sin crear otro sistema.

- Texto de 28 a 32 px, contorno de 3 a 5 px y profundidad 105 para que los efectos de combate no lo oculten.
- Siete líneas de borde en vez de cinco, confinadas a los 28 px exteriores; el centro no recibe una capa oscura.
- Pulso de opacidad 0,75–1, entrada de aproximadamente 220 ms y salida de 320 ms. Se mantiene mientras el estado crítico siga activo.
- Se conserva la histéresis: entrar al 25% o menos; salir al superar el 30%.
- Ganancia del monitor de 0,75 a 0,90: **20% más**. No se cambió el WAV, su frecuencia ni el intervalo de 1200 ms. Una sola reproducción simultánea.
- Se conserva el volumen general; silencio, pausa, curación, muerte y cierre detienen el audio apropiadamente.
- Diálogos de poca salud recolocados para no tapar el selector de arrojadizos y sus controles táctiles. Se mantiene la búsqueda de una zona sin actores/proyectiles.

Comprobado con Cervela y Nicolás: alerta persistente, pulso, volumen efectivo, pausa, curación, muerte y silencio. Inspección visual de escritorio y móvil emulado. La percepción subjetiva durante un combate intenso necesita prueba manual con los altavoces/auriculares del jugador.

## RPG: estado encontrado y corrección mínima

Ya existían: cargador de un cohete, campo de reserva, recarga de 2500 ms, HUD cargado/reserva y persistencia por instancia. La reserva inicial era cero y continúa en cero.

Defectos encontrados:

1. La recogida de munición excluía explícitamente el ID 6 (RPG).
2. La carta de reserva de emergencia también lo excluía.
3. Las mejoras porcentuales del cargador podían convertir su capacidad de 1 en 2 o más.

Correcciones:

- El RPG recibe munición de los objetos compatibles y de la carta de reserva, usando las mismas funciones y bonificaciones existentes.
- Su capacidad queda en un cohete, independientemente de las mejoras de cargador.
- Se mantienen daño 150, cadencia 1500 ms, alcance 1300, recarga 2500 ms, velocidad del proyectil, radio y comportamiento explosivo anteriores.
- No se añade munición infinita ni se modifica la definitiva existente.

Prueba real: `1/5 → disparar → 0/5 → recargar → 1/4 → recoger munición → 1/6`. Cambiar de arma conserva la reserva. Al sustituirlo por otro RPG, la instancia antigua queda en el suelo con `1/6` y la nueva conserva su propio `1/0`; no se borran ni fusionan arbitrariamente cohetes.

La minigun conserva depósito único de 1000, sin reserva ni recarga.

## Recarga sonora

Existía `public/assets/audio/reload.wav`: síntesis original, CC0 según `LICENSE.txt`, duración aproximada 240 ms. Se reutiliza; no se añadieron audios ni dependencias.

El defecto era una segunda reproducción al finalizar. Ahora hay una sola llamada al iniciar la recarga válida, sincronizada con el comienzo del temporizador/animación. No se estira el clip hasta la duración completa de la recarga. Pulsaciones repetidas, cargador lleno, falta de reserva, armas cuerpo a cuerpo y minigun no lo reproducen. Pausa, lanzamiento del arma, definitiva que cancela recarga, muerte y cierre gestionan la detención. El sonido sigue el volumen/silencio existente.

La corrección afecta a la recarga del protagonista. No se añadieron bucles de recarga a todos los NPC.

## Auditoría de transparencia

Se revisaron las 16 armas, sus consumidores de suelo/equipadas/HUD/disparo y los scripts de extracción. No se encontró un chroma key verde en ejecución. Los PNG ya tienen canal alfa, pero algunos fueron preparados eliminando colores de forma demasiado agresiva.

### Reparación realizada

El extractor de la segunda lámina eliminaba tanto magenta como píxeles casi negros conectados. Se confirmó pérdida de sombras/cuerpo en:

| ID | Arma | Píxeles visibles antes / después en base 32×32 |
|---|---|---|
| 8 | Mini Uzi | 194 / 328 |
| 10 | Escopeta recortada | 167 / 254 |
| 11 | M79 | 209 / 299 |
| 12 | Lanzallamas | 144 / 290 |

Se recuperaron los RGB de la referencia original disponible `D:/Descargas/Atlas neón de armas pixel art (1).png`, sin dibujar sombras nuevas. Solo se separaron componentes de fondo magenta y reglas de presentación. Se conservaron detalles pequeños de color interiores y los negros del objeto. Se regeneraron únicamente base, pickup, HUD y dos fotogramas de uso de esas cuatro armas: **20 PNG**, todos 32×32, alfa real, escala proporcional y centrado compatible.

`tools/repair_weapon_alpha181.py` permite reproducir la reparación y el extractor anterior la reaplica al finalizar. No se ejecutó una eliminación global sobre el resto del arsenal.

Requiem utiliza su master alfa en ejecución y la minigun su master alfa propio: ambos quedaron intactos. Las armas cuerpo a cuerpo tampoco se alteraron sin un defecto confirmado.

### Pendiente artístico explícito

Los recortes antiguos `weapon-0.png` a `weapon-6.png` (pistola, revólver, subfusil, escopeta, asalto, precisión y RPG) proceden de una lámina con fondo oscuro. El método histórico también puede vaciar sombras conectadas al exterior; se ven pérdidas en zonas oscuras al compararlas con la referencia y fondos claros. En esa lámina el fondo y partes negras del objeto se confunden y no hay una máscara alfa original que permita separarlos automáticamente con certeza.

**Estos siete recursos no se declararon reparados.** Necesitan una máscara de contorno revisada manualmente o un original aislado con alfa para una recuperación segura. Se conservaron sus archivos y diseño actuales, sin inventar píxeles, engrosar contornos por heurística ni aplicar otro chroma key global.

La corrección de cuatro armas es completa; la limpieza artística de esos recortes antiguos sigue pendiente. No afecta a su lógica de disparo o recogida, pero impide afirmar que todo el arsenal tiene una transparencia perfecta.

Control visual en fondos claro, oscuro, verde y azul: `weapon-alpha-audit181.png` (inspección inicial) y `weapon-alpha-fixed181.png` (cuatro reparadas). También se comprobaron sus ataques, alineación, recogida y variantes dentro del navegador.

## Pruebas

- TypeScript: correcto durante desarrollo y en la compilación.
- `npm run build`: correcto, paquete 1.8.1. Se mantiene la advertencia previa de Vite por bundle superior a 500 kB; no bloquea la compilación.
- Suite unitaria: **189/189**, cero fallos. Incluye tres pruebas nuevas de RPG, estado crítico y variantes alfa.
- `check-polish181.cjs`: RPG real, reserva/recarga/HUD, cambios y sustitución de arma, sonidos sin duplicación, minigun y recargas inválidas, cancelación, alerta de ambos protagonistas, pausa/curación/muerte/silencio y posición móvil. Sin errores JS/HTTP.
- `check-chaos18.cjs`: cinco inventarios, trayectoria con botón derecho, cancelación, cuatro metrallas, fuego/lluvia, cegadora, eléctrica, resistencia de jefes, cuchillo recuperable sin duplicación, barriles de ambos bandos, cadenas/persistencia y botín. Correcto.
- `check-chaos18-mobile.cjs`: mantener/soltar, cambio de tipo, cinco contadores, cancelación por foco y pausa táctil. Correcto.
- `check-arsenal.cjs` con GAME_URL=http://127.0.0.1:5180/: 16 armas, ataques del jugador y NPC, recarga, cuerpo a cuerpo, armas duales, lanzamiento, recogida y streaming. Correcto.
- `check-final174.cjs`: apagones globales, clima, tintes, cinco jefes, experiencia, 1000 disparos de minigun, teclado/mando simulado y disparo táctil. Correcto.
- `check-balance172.cjs`: Tío Aceite por rondas y sectores, accesibilidad, curación, persistencia, botín y oportunidades de recogida de enemigos. Correcto.
- `check-chaos18-production.cjs`: compilación en `/hotline-curico/`, novedades 1.8.1 e historial 1.8/1.7.4, 62 sprites del arsenal del caos, audio, HUD y controles móviles, sin global de depuración ni errores HTTP/JS. Correcto.
- `git diff --check`: correcto.

No se probó Android físico ni DualShock USB/Bluetooth físico. Las pruebas móviles son emuladas. Sigue pendiente la intervención artística indicada arriba.

## Archivos de esta actualización

Código:
- `src/systems/CriticalHealth.ts` — pulso, transiciones, ganancia y ubicación de alertas/diálogos.
- `src/systems/PlayerModifiers.ts` — capacidad de un cohete.
- `src/scenes/Game.ts` — munición RPG, una sola recarga sonora y detención.
- `src/systems/UpgradeCatalog.ts` — reserva de emergencia compatible.
- `src/systems/UltimatePresentation.ts`, `SurvivalSystem.ts` — detener recarga al cancelarla.
- `src/config/releaseNotes.ts` — novedades e historial.
- `package.json`, `package-lock.json` — versión 1.8.1; comando de prueba añadido en package.json.

Recursos y herramientas:
- Veinte PNG de IDs 8, 10, 11 y 12 en `public/assets/weapons/` y `second/`.
- Nuevo `tools/repair_weapon_alpha181.py`; integración en `tools/extract_second_weapons.py`.

Pruebas y documentación:
- Nuevos `tests/polish181.test.ts`, `check-polish181.cjs`, `VALIDACION-1.8.1.md`.
- `tests/atmosphere173.test.ts` y `check-chaos18-production.cjs`: expectativas de versión/historial actualizadas.

Los demás cambios que ya estaban sin commit pertenecen a 1.7.4/1.8 y se conservaron.

## Uso local y publicación

Desarrollo activo: http://127.0.0.1:5180/ . Producción local: http://127.0.0.1:5181/hotline-curico/ . También se puede iniciar con `npm run dev` desde la carpeta del proyecto.

**Sin commits, sin push y sin publicación.** La versión pública de GitHub no se cambió.
