# Hotline Curicó 1.6.2 — Recuperación y validación local

## Estado recuperado

Se conservaron todos los archivos y cambios locales. Antes de continuar se leyó la solicitud original y la de recuperación, se revisaron `git status`, los diffs y el código actual, y se ejecutó TypeScript sin errores. El historial Git también contiene modificaciones sin commit de versiones locales anteriores; no se descartaron ni atribuyen todas a 1.6.2.

Ya estaban preparados los recortes individuales y la separación de componentes del atlas de jefes, además de la condición de curación final de Tryhard. Faltaba validar/cerrar el renderizado en partida, añadir suministros por edificios, ajustar puñetazos, actualizar expectativas de pruebas y completar versión/informe/compilación. El proyecto todavía se identificaba como 1.6.1.

Se continuó sobre esos avances. No se reimplementó Tryhard ni se reconstruyó el juego.

## Jefes: causas y correcciones

La revisión encontró varios problemas distintos; normalizar alfa no bastaba:

1. **Atlas irregular:** el paso fijo anterior de 56 píxeles y los recortes de ataque por incremento de 92 no correspondían a las celdas reales. Incluían fragmentos de poses vecinas, cortaban armas/cuerpos e incorporaban rótulos o líneas del panel.
2. **Deformación:** algunos ataques se dibujaban a otro ancho que los fotogramas de movimiento. Ahora los píxeles se componen a escala uniforme, sin estirar.
3. **Cuerpo descentrado al voltear:** la primera preparación usaba ancla 64 en un lienzo de 224. El flip horizontal desplazaba visualmente el actor respecto a su cuerpo físico. Todos los nuevos fotogramas usan ahora 288×128, cuerpo centrado en X=144, origen 0,5 y referencia de pies uniforme; la hitbox conserva su tamaño anterior y queda alineada con el personaje.
4. **Tonos oscuros confundidos con fondo:** se estrechó el criterio del fondo azulado para conservar pantalones, uniformes y contornos negros. La selección de componentes conserva el actor anclado y los destellos pertinentes, descartando textos, líneas de panel y personajes vecinos. No se rellenaron huecos indiscriminadamente ni se hizo opaca toda la lámina.
5. **Arma superpuesta:** los fotogramas de ataque ya traen su arma. La imagen auxiliar se oculta durante esas fases para evitar dibujarla dos veces; sigue disponible en movimiento/recuperación.

| Ronda | Jefe | Resultado |
|---|---|---|
| 5 | El Torturado | Revisado en la inicialización y poses reales; se conserva la preparación alfa de 1.6.1, sus recursos individuales y su IA. No necesitaba nuevos recortes del atlas. |
| 10 | El Comandante | Recortes medidos de movimiento/ataque, pantalones y botas conservados, arma completa y cuerpo centrado al mirar a ambos lados. |
| 15 | El Demoledor | Celdas propias de disparo/recarga, sin segundo personaje ni línea del panel. |
| 20 | El Verdugo | Rifle y abrigo completos, sin rótulos APUNTAR/DISPARO incrustados y sin desplazamiento al voltear. |
| 25 | El Carnicero | Martillo y cuerpo completos, pose de impacto aislada y sin fragmentos del personaje vecino. |

Se usó PROJECT507 y el selector paginado para cargar individualmente 5/10/15/20/25. Se capturaron poses de ataque y muerte, se comprobaron transparencia de fondo, cuerpo opaco, alfa 1 después de daño y ausencia del arma duplicada. Se inspeccionaron visualmente las capturas de los cinco encuentros y una lámina de diagnóstico con los recortes reales de movimiento/ataque. Los rayos, círculos y demás señales de ataques permanecen.

Los cuatro jefes nuevos conservan la representación de muerte existente (pose girada/teñida y sangre): la lámina no ofrece una secuencia dedicada de muerte. Se verificó que el actor se renderice entero; no se inventaron nuevas animaciones ni se alteraron sus ataques, HP, velocidades o cantidades de enemigos.

## Modo Tryhard

La implementación encontrada se confirmó y validó: **solo al expirar normalmente y estando vivo**, Nicolás restaura su multiplicador de capacidad a 1 y queda con `maxHealth(run)` completo, usando el máximo base actual con mejoras.

Pruebas en la partida real:

| Entrada | Durante la activación | Tras recibir 10 de daño | Final normal |
|---|---|---|---|
| 20/100 | 100/500 | 90/500 | 100/100 |
| 75/100 | 375/500 | 365/500 | 100/100 |
| 20/125 | 100/625 | 90/625 | 125/125 |

La activación conserva el porcentaje anterior: no concede esta curación al comenzar. Tras el final se infligió daño otra vez y un tick posterior no volvió a curar. Se comprobaron velocidad normal 253 y cooldown de dash 1.200 ms, además de la capacidad normal. La cancelación conserva su regla previa y no cura; daño letal durante la habilidad deja a Nicolás muerto, sin resurrección.

Adrenalina continúa bloqueada durante la definitiva, permanece guardada y, después de expirar, rellena la barra sin activar otra habilidad ni acumular capacidad. La definitiva de Cervela sigue regenerando 20 HP/s; la prueba 20 → 40 tras un segundo permanece igual. Las mejoras y la curva de experiencia no se alteraron.

## Suministros por edificio

Configuración `MEDICAL_SUPPLY_CHANCE`:

| Tipo | Tirada por edificio |
|---|---:|
| Hospital / centro médico | 80%, reservado para futuros tipos |
| Farmacia existente | 75% |
| Supermercado existente | 50% |
| Otros | Sin suministro adicional; botín anterior conservado |

El proyecto tiene farmacias con consultorio y supermercados, pero **no tiene plantilla de hospital ni centro médico independiente**. No se crearon edificios nuevos. La configuración reconoce los identificadores reservados `hospital` y `medical-center` para una futura integración.

Una tirada determinista por edificio permite generar **un** botiquín si hay un punto válido. Se comprueban entrada/salida, conexión por celdas transitables, interior, muebles, puertas y separación respecto de cofres/cajas interactivas. Es un drop no bloqueante; no cambia colisiones ni navegación.

El streaming registra los chunks ya evaluados durante la partida y reutiliza `ChunkLootStore` para botiquines no recogidos. Volver a cargar el mismo sector no repite la tirada ni añade otro; recogerlo y regresar tampoco lo regenera. Al iniciar otra partida se aplica el ciclo normal del mundo nuevo. No se añadió una clave de guardado permanente ni se borraron datos previos.

Muestra determinista seed 507 en 625 chunks: **88/119 farmacias (73,95%)**, **212/410 supermercados (51,71%)**. Son resultados de esa muestra, no sustituyen las probabilidades configuradas. Se validó en ejecución un botiquín real de cada tipo, recogida, descarga/recarga y ausencia de regeneración. Con tres botiquines, el objeto permanece en el suelo. HC, munición, adrenalina y las tablas de cajas existentes se conservan.

## Cajas rompibles y puñetazos

La única categoría con salud/destrucción de cajas implementada es `FortuneKind: crate`. Las cajas decorativas del mobiliario no tienen esa clasificación; no se convirtieron en destructibles. Caja fuerte y caja misteriosa se excluyen tanto de búsqueda melee como del daño del registro.

Se reutilizan el puñetazo y las armas melee existentes, con sus límites de alcance, dirección, línea de visión y cadencia. El daño a cajas se ajusta centralmente por **0,375**: un puñetazo ordinario de referencia 20 causa **7,5** sobre la caja de 30 HP, por lo que requiere **cuatro golpes**. Se priorizó la referencia jugable de tres a cinco golpes; aplicar literalmente el 25% de una bala de pistola de 15 habría requerido ocho.

Los disparos conservan su daño; la pistola básica de 15 sigue necesitando dos impactos. El daño melee contra enemigos no se modifica. Las armas melee también pasan por el mismo ajuste de resistencia del objeto. Se conserva la textura dañada, el efecto de impacto existente, la desaparición de colisión al romper y una sola recompensa. No se consume munición ni se crea una tecla nueva; no interfiere con ejecuciones.

Se comprobó mantener el ataque con ratón, R2 de mando estándar simulado y el botón FUEGO con un toque mantenido emulado: cuatro impactos de 7,5, premio único, sin entrada atascada. Cajas fuertes/cofres no reciben el daño de esos golpes.

## Pruebas ejecutadas

- TypeScript sin errores al recuperar el trabajo y después de los cambios.
- **155/155 pruebas unitarias**, cero omitidas. Cinco pruebas nuevas de 1.6.2; se actualizaron expectativas antiguas de salud al terminar Tryhard y del daño de puñetazo contra cajas según los nuevos requisitos.
- `npm run build`: correcto, TypeScript + Vite. Advertencia no bloqueante de tamaño del bundle (~1,74 MB minificado), sin dependencias añadidas.
- Paquete final: los 326 archivos de `public` coinciden byte a byte con los incluidos en `dist`; no faltan recursos. `git diff --check` sin errores de espacios (solo aviso LF/CRLF de la configuración existente).
- Regresiones de navegador local seleccionadas:

| Suite | Resultado |
|---|---|
| `check-maintenance162.cjs` | Cinco jefes reales por selector, capturas/alpha/origen/arma, muerte, Tryhard con daño real y mejoras, curación única, movimiento/dash, muerte, adrenalina, farmacia/supermercado y streaming, máximo tres, ratón/R2, cajas protegidas. |
| `check-maintenance162-mobile.cjs` | Toque real emulado mantenido en FUEGO, cuatro puñetazos, premio único, sin munición ni acción atascada. |
| `check-fortune16.cjs` | Ataques/vida/HUD de cinco jefes, transición solo después de matarlos, cajas por balas y melee, cajas fuertes, ruleta inicial/pago, persistencia y limpieza de chunks/escena. |
| `check-maintenance161.cjs` | Menú nuevo y resoluciones, selector paginado, HC/pago único 500, XP de impactos, cartas y adrenalina H/R3, ambos protagonistas y reinicio. |
| `check-requiem153.cjs` | Penetración 1/4/5 objetivos, muros/rango/jefe, duales, restricciones del logro, Tryhard, notificación y guardado sin duplicar. |
| `check-arsenal.cjs` | Las dieciséis armas, daño jugador/NPC, munición, recarga, lanzamiento, explosiones/fuego, recogida, persistencia y reintento. |
| `check-v15.cjs` | Monedas/mejoras/logros guardados, Tío/ciudad, modo de pruebas con/sin inmortalidad y aislamiento del guardado real. |
| `check-mobile151-menus.cjs` | Menús, cartas, acciones táctiles, tres punteros, HUD, derrota/reintento y ambas definitivas. |
| `check-v13.cjs` | Mando estándar simulado: conexión/desconexión, sticks, acciones, menús y preferencias. |
| `check-balance152.cjs` | Daño común ×0,55 una sola vez, defensas, tres botiquines, generación de rondas 1–5 y mortalidad con ambos protagonistas. |
| `check-mobile151-production.cjs` | Paquete de producción bajo `/hotline-curico/`: recursos, selección, introducción, ruleta inicial, HUD y pausa móvil. |

Los adaptadores locales de suites antiguas solo cambian su puerto a 5180. No se ejecutaron todos los scripts históricos de versiones anteriores, cuyos requisitos de menú/video o salud ya cambiaron; sí el conjunto unitario completo y las regresiones pertinentes enumeradas. Se distingue la inspección de capturas de una partida humana o de una prueba en un teléfono real.

## Archivos de 1.6.2

Avances recuperados/completados: `src/bosses/{atlasFrames,isolateActor,NewBosses}.ts`, `src/world/fortuneAssets.ts`, `src/scenes/Game.ts`, `src/systems/Tryhard.ts`.

Añadidos en la continuación: `src/world/BuildingSupplies.ts`, `tests/maintenance162.test.ts`, `check-maintenance162.cjs`, `check-maintenance162-mobile.cjs` y este informe.

Integración/metadatos modificados: `src/world/{WorldStreamer,FortuneObjects}.ts`, `src/config/{fortune,releaseNotes}.ts`, `src/scenes/Menu.ts`, `src/mobile/MobileMenus.ts`, `package.json`, `package-lock.json`, `README.md`; expectativas de pruebas en `tests/{v11,permanent}.test.ts` y `check-fortune16.cjs`.

No se integraron sprites nuevos de Cervela/Nicolás ni funciones futuras de clima, apagones o zonas. Los PNG originales de jefes se conservan; la corrección es de preparación/renderizado de texturas en Phaser.

## Límites y publicación

No se probó Android físico ni mando USB/Bluetooth real; se usaron Edge local, capturas inspeccionadas, entradas de ratón/teclado y emulación táctil/Gamepad API. No se jugó manualmente una campaña completa ni se hizo un benchmark de FPS en teléfono. El hospital no se puede probar en el mapa porque no existe esa estructura.

Los parámetros de combate, cantidades, dificultad, precios, rarezas, progreso y logros anteriores se conservaron salvo los cambios solicitados. No quedan errores de compilación o de las pruebas informadas.

**Todo permanece local. No se creó commit ni se ejecutó push o despliegue.** HEAD conservado: `9b324b5e8741c86527762a1eef7e4a06673df491`. Se espera autorización expresa para publicar.
