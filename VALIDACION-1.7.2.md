# Hotline Curicó 1.7.2 — validación local

Fecha: 1 de noviembre de 2026. Sin commits, staging, push ni publicación. Conserva los cambios locales de 1.7.1.

## Causas y correcciones

### Tío Aceite

Antes era un prop generado aleatoriamente: solo biomas comercial/plaza, coordenadas de chunk múltiplos de 2 y tirada del 45 %. Los nuevos sectores se generaban primero y hacían `continue`, ocupando cuadrantes y reduciendo las ubicaciones libres. Los sectores iniciales residenciales no eran elegibles. No había contrato de aparición por ronda; las imágenes pertenecían al streaming y se destruían al descargar chunks.

Ahora `RoundDirector.startNext` solicita exactamente un puesto al empezar cada ronda. `TioAceite` lo posee durante esa ronda, separado de los props de los chunks. Busca cerca del jugador, por anillos de 4–32 tiles, sin depender del bioma. Descarta paredes, edificios, apartamento inicial y objetos de fortuna, incluyendo los que volverían al recargar el sector. Exige un área exterior despejada de 5×5 tiles, reserva un cuerpo sólido de 3×3 y deja dos filas de acceso. Comprueba una ruta A* real hasta el frente después de reservar el cuerpo; revierte el candidato si no existe ruta y continúa buscando. Si no encuentra espacio, reintenta tras 1000 ms de juego activo. No elimina obstáculos para forzar la colocación.

La misma imagen, posición, usos de servicio y colisión sobreviven a cambios de sector, clima y apagones. No reaparece por evento ni cambio de sector. Al empezar la siguiente ronda se destruye el puesto anterior y se liberan sus celdas, incluso si no se visitó. La limpieza también soporta reiniciar/salir de la escena. Se conservan los sprites, cartel amarillo, curación de 40 HP, coste cero provisional y límite de dos servicios por puesto.

### Armas al morir

`SurvivalSystem.died` soltaba siempre el arma cuando se llamaba con `drop=true`. Ahora `NORMAL_WEAPON_DROP_CHANCE = .35` controla una tirada por muerte armada normal. Sin arma no se tira; se vacía la referencia antes de transferirla para impedir duplicados. Cuando falla, se retira la instancia del registro. Se conservan munición y reserva del arma que cae.

También existía un botín aleatorio adicional del 17 % que podía generar otra arma, incluso para enemigos desarmados. Para muertes normales esa recompensa sigue existiendo, pero una recompensa de arma se entrega como munición: la única arma normal de la muerte es la equipada y su tirada es del 35 %. Los otros usos de `drop`, las cajas, cofres y recompensas especiales no cambian.

Se reutiliza la clasificación existente `isCommonEnemy`: enemigos con comportamiento normal excepto élite, sin jefe. Blindados, élites, incendiarios y demás comportamientos especiales y jefes conservan sus contratos previos; no se aplica el 35 % automáticamente a ellos.

### Recogida básica

`BASIC_WEAPON_PICKUP_CHANCE = .05` se evalúa una vez por enemigo básico y arma elegible, al seleccionar un candidato. El rechazo no bloquea la IA y no vuelve a tirar cada frame ni cada búsqueda. Se guarda el `instanceId` para reconocer la misma arma tras streaming, con identidad débil como respaldo. Los especializados omiten esta tirada. Se mantiene la restricción previa que impide recoger armas al 10 % de los básicos desde su generación; el 5 % es por oportunidad válida de los que sí tienen permiso. No cambian estadísticas, combate ni rarezas permitidas.

## Archivos de esta actualización

- `src/world/TioAceite.ts`: puesto único por ronda, búsqueda, colisiones, persistencia y limpieza.
- `src/config/aceite.ts`: sustituye parámetros aleatorios antiguos por radio de búsqueda y reintento; servicios intactos.
- `src/world/WorldModel.ts`: retira los puestos decorativos aleatorios que duplicarían al vendedor.
- `src/world/WorldStreamer.ts`: deja de registrar vendedores propiedad de chunks.
- `src/systems/RoundDirector.ts`: aparición al inicio de ronda.
- `src/config/enemyBalance.ts`: probabilidades y memoria de oportunidades.
- `src/systems/SurvivalSystem.ts`: caída, retirada de instancias y selección probabilística de armas.
- `src/scenes/Game.ts`: evita una segunda arma en el botín normal adicional.
- `package.json`, `package-lock.json`, `src/scenes/Menu.ts`: identificación local 1.7.2.
- `tests/balance172.test.ts`, `check-balance172.cjs`: nuevas pruebas.
- `tests/v14.test.ts`, `tests/v15.test.ts`: comprobaciones de mundo adaptadas a que el vendedor ya no sea un prop aleatorio.
- `check-fortune16.cjs`: fuerza una oportunidad exitosa en su caso de recogida y separa las nueve celdas del vendedor del límite de celdas de cajas. Mantiene las demás verificaciones.
- Este informe.

Los archivos de jefes, sus diálogos y `BossGeometry.ts` ya estaban modificados por 1.7.1 y se han conservado; no son trabajo nuevo de 1.7.2. No se modificaron sprites ni guardados.

## Resultados

- TypeScript: correcto.
- 172 pruebas unitarias: correctas, cero fallos.
- 100000 tiradas de caída independientes con generador reproducible: 34921 éxitos (34,921 %).
- 100000 oportunidades básicas independientes: 4917 éxitos (4,917 %).
- Rechazo repetido 1000 veces sobre el mismo objeto: solo una tirada. Misma `instanceId` tras reconstruir el objeto: no repite.
- `check-balance172.cjs`: correcto. Aparición inicial desde el director; siete rondas consecutivas en dos sectores; despejado, lluvia, niebla y apagones; ruta al frente; interacción y +40 HP; misma imagen y usos tras descargar/recargar sectores; siguiente ronda elimina el puesto anterior, sin duplicar aunque no se visite; candidato inicial sin ruta rechazado y ubicación alternativa aceptada.
- Prueba real de 200 muertes armadas con resultados de azar controlados: 100 caídas y 100 retiradas; segunda llamada no duplica; enemigo desarmado no entrega arma equipada.
- IA real: 100 búsquedas sobre arma rechazada producen una sola tirada; otra arma puede aceptarse; especialista conserva recogida sin tirar el 5 %.
- `check-bosses171.cjs`: correcto. Ambos protagonistas, 20 presentaciones en rondas 5–50, frases exactas, cinco escalados, colisiones, impactos, Requiem, explosiones, animaciones y tránsito por puerta. También comprueba reinicios de escena.
- `check-city17.cjs`: correcto. Cuatro zonas, apagones y recuperación, refuerzos integrados en rondas, expiración sin bloqueo, clima en jefe y recarga.
- `check-fortune16.cjs`: correcto. Cajas, caja fuerte, pago/ruleta, persistencia, cinco jefes/estadísticas/ataques, transiciones, tres botiquines, texto de logro, streaming acotado e interacción táctil emulada.
- Navegador: sin errores JavaScript/HTTP en las suites terminadas.
- `npm run build`: correcto, versión 1.7.2; salida `dist/assets/index-DYVhkWIy.js`. Permanece el aviso previo de Vite por bundle mayor de 500 kB.
- `git diff --check`: correcto; índice sin cambios preparados.

Durante las pruebas se detectó y corrigió una limpieza del cuerpo del vendedor que fallaba cuando Phaser ya había destruido el grupo al reiniciar. Los primeros ensayos de botín también necesitaron aislar el azar de la prueba del generador interno de Phaser; los ensayos finales pasan. El antiguo caso de recogida garantizada del test de fortuna se adaptó al cambio solicitado.

No hay errores pendientes detectados en estas comprobaciones. Son pruebas automatizadas locales; no se afirma prueba física en Android ni con un mando real. No se publica esta versión.
