# Expansión 0.8.5 — calles e industria sobre la versión 0.9

La expansión solicitada se integró sobre la progresión 0.9 existente. La versión del proyecto es **0.9.1**, para conservar niveles y mejoras sin volver a una versión anterior. Validación: 27 de octubre de 2026.

## Mundo continuo

El complejo sigue siendo el punto inicial, con sus habitaciones, muebles y sistemas anteriores. Se abrieron accesos al norte, sur, este y oeste. Ahora se puede salir andando hacia calles y explorar en coordenadas positivas o negativas, sin teletransportes del jugador ni pantallas de carga. La cámara mantiene el seguimiento suave y ya no se detiene en los antiguos límites. Hacia el este se alcanza una zona industrial a partir de la cuarta columna de sectores.

Se conservaron las casillas físicas de **48 px** del complejo para mantener escala, cuerpos y navegación. El arte conserva su base normalizada de 32 px. Cada chunk contiene **32×32 casillas**, por lo que mide **1536×1536 px**, en lugar de los 1024 px sugeridos. No se alteraron la velocidad base ni el dash.

## Generación procedural

`WorldModel` genera únicamente los sectores consultados. Cada partida obtiene una semilla de 32 bits en `Run.seed`; la geometría y los objetos se derivan exclusivamente de esa semilla y las coordenadas del chunk. Una caché LRU conserva como máximo 64 descripciones de sector y regenera las antiguas cuando se vuelven a consultar. No se guarda el mundo entero.

Los biomas residencial, comercial, plaza/estacionamiento e industrial se agrupan mediante regiones de 3×3 chunks, con un entorno residencial alrededor del complejo y acceso industrial garantizado hacia el este. Se usan plantillas de manzana con variaciones por semilla: edificios con entradas, comercios y algunos locales completamente sólidos/cerrados; estacionamientos o plazas con árboles, bancas y fuente; bodegas, patios, contenedores, montacargas, camión, barriles, tanques y tuberías.

Las avenidas de cuatro casillas se alinean en las mismas coordenadas locales de cada chunk. Los bordes reservan conexiones transitables y los edificios permanecen dentro de sus sectores. Las plantillas próximas al complejo que lo invadirían se omiten completas. Así no se cortan edificios ni se cierran calles en las costuras. Las puertas de los edificios abiertos conectan sus interiores con las veredas; los locales cerrados no contienen pisos transitables inaccesibles.

`WorldStreamer` mantiene nueve chunks, el actual y sus ocho vecinos. Carga los siguientes antes de descargar los anteriores. Cada sector usa capas de tiles, un atlas compartido de objetos y hasta dos luces aditivas estáticas. El complejo inicial mantiene sus capas existentes y oculta su representación cuando queda lejos. No hay luces dinámicas por píxel ni generación de texturas en cada fotograma.

## Colisiones y navegación

Las colisiones se derivan de las mismas celdas que producen los edificios y objetos visibles. Las huellas de vehículos, contenedores, tanques y maquinaria son sólidas; el pavimento, marcas, reflejos y alcantarillas son decorativos. Las filas contiguas de celdas sólidas se agrupan en rectángulos para reducir cuerpos estáticos. Al descargar un sector se eliminan sus cuerpos de la simulación inmediatamente, además de destruir sus objetos y capas.

El adaptador de cuadrícula permite que las consultas existentes de paredes, línea de visión, objetos lanzados y efectos funcionen con coordenadas globales y negativas. No existe una matriz de tamaño infinito en memoria.

`WorldRoutes` utiliza A* de cuatro direcciones, sin cortar esquinas, con máximo de 6000 expansiones por búsqueda y caché de 128 rutas. `Navigation` conserva su escalonado de hasta cuatro planes por fotograma y la recuperación por atasco. Los fallos quedan cacheados; no se repite una búsqueda completa en cada frame. La conectividad entre pisos se garantiza por las plantillas y avenidas reservadas.

Durante una ronda activa los enemigos conocen el destino global de Cervela para poder perseguirlo entre sectores; siguen necesitando línea de visión para atacar. Sus movimientos, armas, ejecuciones y ataques no se sustituyeron.

## Enemigos, rondas y jefes

Se conserva el máximo de 24 enemigos normales activos. La aparición busca hasta 140 candidatos próximos, nominalmente a 500–1100 px del jugador, prefiere puntos fuera de cámara y comprueba una zona transitable de 3×3 casillas. Los jefes usan la misma búsqueda de espacio abierto y mantienen sus ataques y rondas cada cinco niveles de ronda.

Si un enemigo queda a más de 2400 px, se recoloca fuera de cámara en un punto próximo válido, conservando objeto, salud, arma y pertenencia a la ronda. No se concede una baja, XP ni recompensa por ese reciclaje. Esto evita perder los objetivos de exterminio o acumular enemigos lejanos en supervivencia. El jugador nunca se teletransporta. Los jefes también pueden recolocarse cuando quedan demasiado lejos; no se les restaura salud.

Los enemigos pueden cruzar sectores normalmente: se comprobó una persecución física entre ambos lados de una frontera, sin saltos de posición. La recolocación solo se usa para distancias grandes.

## Botín y progresión

Las armas, munición, botiquines, chalecos y premios de ruleta se colocan en pisos transitables. El botín normal de una muerte aparece ahora cerca de los pies del enemigo. Los premios de ruleta siguen apareciendo cerca de Cervela y se recogen con E. Las mejoras de capacidad, daño, cadencia y demás estadísticas 0.9 siguen aplicándose en cualquier zona.

Al descargar un chunk, sus objetos pendientes se convierten en registros compactos con posición global, tipo y estado exacto del arma —identificador, balas y reserva—. Se almacenan en `sessionStorage` con un prefijo de partida. Al regresar se extraen una sola vez y se recrean como objetos recogibles. Las estructuras se regeneran por semilla; no hace falta guardarlas. Al terminar la escena se borra el botín temporal de esa partida.

XP, niveles, elecciones pendientes e inventario permanecen en el jugador, independientemente del chunk. Se utiliza el sistema 0.9 existente, sin una segunda progresión. La selección de nivel y la ruleta siguen congelando el combate y sus relojes de forma secuencial.

## Recursos gráficos

Se inspeccionó la referencia de 1536×1024 y se extrajeron rectángulos explícitos, no una cuadrícula automática sobre la lámina. `tools/extract_world.py` admite `--source` y documenta cuadros y SHA-256 en `public/assets/world/crops.json`.

- Seis muestras de suelo de 32×32: asfalto, vereda, grietas, industrial, señalización de peligro y superficie húmeda. Se normalizaron con bordes continuos mediante espejado.
- Nueve objetos individuales: contenedor rojo, contenedor azul, montacargas, barril, tanque, banca, árbol, fuente y camión. Se limpió el fondo conectado al borde; el árbol usa además selección de follaje. Se conserva proporción y transparencia, y los contenedores/camión se orientaron para la vista cenital.
- Los materiales se empaquetan en `tiles.png`; los objetos en `city.png`/`city.json`, conservando también los PNG individuales. Se reutiliza el atlas 0.8 para camas, mesas, automóviles, carteles, grafitis, lámparas y reflejos.
- Las marcas viales, pasos peatonales y alcantarillas se dibujan como detalles de suelo de Phaser, sin colisión. Hay luces magenta, cian, rojas y cálidas, sin filtros globales oscuros.

No se insertó el mapa de referencia como fondo ni se utilizaron sus títulos, leyendas o etiquetas. No fue necesario generar arte con IA. Los rótulos de comercios y bodegas son señalización propia del escenario.

## Pruebas ejecutadas

| Ejecución | Resultado |
| --- | --- |
| `tsx --test tests/*.test.ts` | 57/57 aprobadas |
| `tsc --noEmit` | Correcto |
| `vite build` | Correcto; `dist/` actualizado |
| `node check-world.cjs` | Correcto en Edge, sin errores JavaScript |
| `node check-v09.cjs` | Correcto: XP, cartas, mejoras, jefe y limpieza |
| `node check-v07.cjs` | Correcto: ruleta, minigun, RPG e inventario |
| `node check-v062.cjs` | Correcto: chaleco, ulti, HUD, rondas, menú y reintentos |
| Verificación Pillow de los seis materiales nuevos | Tamaño 32×32 y coincidencia exacta de bordes opuestos |
| `node check-world.cjs --preview` | Captura general final generada y revisada |

### Comprobaciones solicitadas

1. Salida del complejo: caminata física por la salida norte.
2. Exploración sin límite anterior: caminata desde la salida este hasta superar x=6250.
3. Chunks: nueve sectores vecinos activos y descarga de los anteriores.
4. Calles: costuras transitables verificadas en una región de 15×15 chunks.
5. Industria: llegada andando al bioma industrial, sin teletransporte del jugador.
6. Colisiones: cobertura exacta de celdas sólidas y huellas de objetos comprobada en pruebas.
7. Persecución: enemigo cruzando el borde x=3072 con física normal.
8. Apariciones: 24 enemigos sobre zonas abiertas y alcanzables, a distancia segura.
9. Supervivencia: 24 enemigos durante desplazamiento entre sectores; objetivos y reloj vigentes.
10. Jefe: aparición, persecución, escopeta, muerte y avance a ronda 6 fuera del complejo.
11. Ruleta: premio exterior en piso accesible a menos de 85 px de Cervela.
12. Objetos: minigun dormida restaurada con exactamente 17 balas y 23 de reserva, recogida con E.
13. Cámara: seguimiento sin límites y coordenadas negativas.
14. Retorno: distribución idéntica del sector antes/después de descargarlo.
15. Rendimiento: caché acotada tras 500 chunks en pruebas de datos; recorrido gráfico de 45 sectores con nueve activos.
16. Reintento: tres partidas nuevas con semilla nueva, salud/protección/XP restablecidas y nueva ruleta.
17. Limpieza: cero chunks anteriores, motor detenido, botín temporal borrado y contador de callbacks antiguos igual a cero.

En el recorrido gráfico se observaron máximos de 444 cuerpos estáticos, 1014 objetos de escena y 138 texturas, con caché de hasta 64 descripciones. Con 24 enemigos, minigun y nueve chunks, la muestra de 120 intervalos en Edge headless tuvo mediana de 8,2 ms y percentil 95 de 12,6 ms. Son mediciones breves de este entorno, no garantías para cualquier equipo.

Se corrigió además una limpieza incompleta del reloj existente: en Phaser, `removeAllEvents()` no elimina los eventos aún pendientes de inserción. El cierre de partida ahora llama también a `clearPendingEvents()`, verificado mediante un callback que no debe sobrevivir a la muerte/reintento.

Las suites históricas restantes no se ejecutaron en esta actualización. Las regresiones base mantienen su aislamiento de XP; la convivencia real del mundo con progresión se comprobó en la suite del mundo y en 0.9.

## Archivos añadidos o modificados

| Archivos | Cambio |
| --- | --- |
| `src/world/WorldModel.ts` | Semilla, biomas, plantillas, cuadrícula global y caché LRU |
| `src/world/WorldRoutes.ts` | A* acotado y caché de rutas |
| `src/world/WorldStreamer.ts` | Carga/descarga visual y física, representación de sectores y botín dormido |
| `src/world/ChunkLootStore.ts` | Persistencia temporal de objetos por partida/chunk |
| `src/scenes/Game.ts` | Mundo abierto, cámara, apariciones, reciclaje, botín y limpieza de temporizadores |
| `src/systems/Navigation.ts` | Selección de rutas globales y reinicio de ruta al recolocar |
| `src/systems/Perception.ts` | Persecución entre sectores durante rondas activas |
| `src/systems/run.ts` | Semilla por partida |
| `src/maps/MapVisuals.ts` | Precarga de recursos, visibilidad del complejo y efectos en coordenadas globales |
| `src/maps/environment.ts` | Profundidad cenital válida para coordenadas positivas y negativas |
| `src/scenes/Menu.ts`, `package.json` | Identificación de la expansión y comando `test:browser:world` |
| `public/assets/world/` | 17 PNG y dos JSON de recursos/procedencia |
| `tools/extract_world.py` | Extracción y normalización reproducible de la referencia |
| `tests/world.test.ts`, `check-world.cjs` | Pruebas de datos e integración del mundo |
| `README.md`, este informe, `dist/` | Documentación y compilación actualizada |

## Limitaciones pendientes

- La escala física sigue siendo 48 px; el chunk mide 1536 px. Pasar todo el juego a 32 px físicos requeriría una migración de cuerpos, distancias y arte que no se incluyó.
- Se utiliza una gramática de manzanas y patios con variaciones, no una ciudad real ni un generador de edificios completamente libre. Los locales cerrados son obstáculos sólidos, no interiores ocultos visitables.
- La generación/carga es síncrona y local. Los nueve vecinos evitan vacíos en el movimiento normal; no hay trabajos de generación en segundo plano. Los desplazamientos instantáneos usados en pruebas pueden concentrar más trabajo en un frame.
- El botín temporal usa la cuota de `sessionStorage` del navegador. Si está bloqueada o agotada, hay un respaldo en memoria para 256 sectores con botín, que puede descartar los más antiguos. No es una partida guardada entre sesiones.
- Se conservan tipo, posición y munición del botín; manchas, cadáveres y brillos temporales no son estado permanente de cada sector.
- Los enemigos muy lejanos se recolocan fuera de cámara; no existe simulación persistente de todos los habitantes del mundo. Los proyectiles mantienen su ciclo de vida limitado existente, sin añadir un pool completo nuevo.
- No se implementó rebasing de coordenadas. A distancias gráficas extremas puede degradarse la precisión; se probó exploración visual del orden de decenas de miles de píxeles, además de cientos de descripciones de sector.
- Vite conserva el aviso de bundle de Phaser superior a 500 kB; no impide compilar.

Capturas: `world-exit.png`, `world-industrial.png`, `world-boss.png`, `world-survival.png`, `world-overview.png` y `world-assets-preview.png`. Para jugar, abrir la URL indicada por Vite; la validación usó `http://127.0.0.1:5176`. El comando de navegador admite `GAME_URL`.
