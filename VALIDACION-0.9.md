# Hotline Curicó 0.9 — experiencia, niveles y mejoras

Validado el 27 de octubre de 2026. Implementado sobre el proyecto existente, sin reconstruir el mapa ni sustituir los sistemas de combate.

## Progresión por partida

Cada partida comienza en nivel 1, con 0 XP y estadísticas base. Las muertes conceden XP una sola vez por objeto enemigo: Matón 10; Pandillero armado y Veterano 15; Blindado y Élite 25; jefe 150. Dañar, disparar, retirar enemigos al cerrar una ronda o volver a ejecutar un objetivo muerto no da XP adicional. Disparos, explosiones, golpes y ejecuciones convergen en el mismo evento de muerte.

El siguiente nivel requiere `Math.round(100 * 1.18 ** (nivel - 1))`: 100, 118, 139, 164… El sobrante se conserva y cada nivel ganado añade una elección pendiente. El HUD muestra nivel, XP acumulada/objetivo y barra verde compacta debajo del objetivo de ronda, sin fondo opaco que atraviese el mapa.

Las elecciones aparecen una detrás de otra. Cada pantalla contiene exactamente tres cartas diferentes con icono existente, nombre, descripción, rareza y rango actual/siguiente. Se elige con ratón o teclas 1, 2 y 3. Una misma interacción o callback antiguo no puede consumir dos recompensas. ESC permite abrir la pausa; reanudar vuelve a la selección pendiente, sin saltársela ni permitir clics sobre cartas ocultas.

## Catálogo y reglas de acumulación

`UpgradeCatalog.ts` centraliza identificador, nombre, descripción, icono, rareza, máximo, lectura del rango actual, función de aplicación y condición de disponibilidad. El estado de rangos y estadísticas pertenece a `Run`, no a las escenas visuales ni a almacenamiento permanente.

| Mejora | Efecto por rango | Máximo | Rareza |
| --- | --- | ---: | --- |
| Corazón de acero | +20 vida máxima y cura 20 | 5 | Común |
| Blindaje reforzado | +25 capacidad de chaleco; no repara | 4 | Común |
| Balas reforzadas | +10% daño | 5 | Común |
| Gatillo rápido | +8% disparos por segundo | 4 | Rara |
| Reflejos felinos | +5% velocidad | 4 | Común |
| Dash mejorado | −10% enfriamiento | 4 | Rara |
| Furia de combate | +15% daño a 160 px o menos | 3 | Rara |
| Última Calada acelerada | −4 impactos necesarios | 5 | Rara |
| Recuperación extrema | +3 HP/s durante la ulti | 4 | Rara |
| Tiempo prestado | +1 segundo de ulti | 4 | Épica |
| Munición adicional | +15% capacidad de cargador | 4 | Común |
| Primeros auxilios | +10 HP por botiquín | 4 | Común |
| Placas resistentes | −8% daño sobre la parte cubierta por el chaleco | 4 | Rara |
| Puntería letal | +5 puntos porcentuales de crítico, daño ×2 | 4 | Épica |
| Ejecutor | +15% daño cuerpo a cuerpo | 4 | Común |

Los incrementos de una misma mejora se suman. Las categorías de daño general, distancia, cuerpo a cuerpo y crítico se multiplican entre sí. Los críticos se sortean por disparo/ráfaga y se comparten entre sus perdigones o explosión. La distancia de un proyectil se mide desde su origen de disparo al objetivo; sus modificadores se guardan al disparar, sin recalcular retroactivamente las balas que ya estaban en vuelo.

La cadencia usa `intervalo base / (1 + bonus)`. Sus límites técnicos centralizados, en orden del arsenal, son 160/320/60/450/100/650/900/33,333 ms. La Barredora puede alcanzar unos 26,4 disparos/s con cuatro rangos, conserva preparación de 600 ms, recarga de cuatro segundos, penetración y penalización de movimiento. Las estadísticas base del arsenal no se modifican y los enemigos no reciben los modificadores globales del jugador.

Los cargadores se redondean hacia arriba a balas enteras y no se rellenan al elegir la mejora. La recarga y las armas nuevas respetan la capacidad ampliada; una minigun llega a 320 balas. Las armas y munición recogidas durante la ulti siguen usando el sistema previo de restauración y transferencia.

### Cuerpo a cuerpo

El sistema previo de Cervela solo ofrecía ejecuciones letales; aumentar su daño no alteraba el resultado. Para que Ejecutor tenga un efecto real se añadió el golpe básico manteniendo clic izquierdo estando desarmado: 20 de daño base, alcance de 58 px, intervalo de 450 ms, objetivo frontal más cercano y línea de visión obligatoria. Recibe los modificadores correspondientes; no carga la ulti. V conserva la ejecución de enemigos normales aturdidos y G conserva el lanzamiento/aturdimiento. El golpe reutiliza una pose existente, sin animación exclusiva nueva.

## Rarezas y emergencias

La rareza se sortea con pesos Común 65, Rara 28 y Épica 7; luego se elige una mejora disponible de esa categoría. El valor de su efecto no cambia con la rareza. Cada mejora elegida se retira de las opciones restantes de esa pantalla. Al agotarse una categoría se normalizan los pesos de las restantes. Las mejoras al máximo no aparecen.

Si quedan menos de tres mejoras normales, se completan las cartas con recompensas repetibles distintas:

- Segundo aliento: cura 30 HP; con vida completa deja un botiquín recogible.
- Placas de emergencia: repara 50; con chaleco completo deja otro recogible.
- Reserva de munición: añade un cargador de reserva por arma compatible; sin ellas deja munición recogible. El RPG conserva la exclusión de la munición normal.

Así las tres opciones siguen teniendo efecto incluso con salud, protección y estadísticas al máximo, o estando desarmado. Los objetos se colocan mediante el sistema existente de posiciones accesibles.

## Límites y defensa

Vida máxima 200; chaleco máximo 150; reducción de enfriamiento de dash 40% (1200 a 720 ms); carga mínima de ulti 20 impactos; crítico máximo del catálogo 20%; ulti máxima 16 segundos y 32 HP/s de curación. La vida nunca supera su máximo actual. Ampliar chaleco sin uno equipado conserva la nueva capacidad para futuras recogidas y no crea ni repara protección automáticamente.

La ulti reduce primero el daño un 40%. Las placas se aplican solo al tramo realmente cubierto por el chaleco. Cuando este se agota, el tramo restante pasa a salud sin conservar la reducción de placas. Ejemplo con ulti y cuatro rangos de placas: 100 de daño bruto consumen 40,8 de chaleco si alcanza la protección. La combinación produce 59,2% de reducción sobre ese tramo. Existe además un límite global del 75%, comprobado incluso con valores defensivos forzados; suficiente daño sigue siendo letal.

Si se mejora dash mientras se enfría, se reescala proporcionalmente el tiempo restante. Si se mejora la duración de una ulti activa, se añade el segundo correspondiente a su tiempo pendiente. El resto de valores se consulta desde las estadísticas actuales.

## Pausa, secuencia y persistencia

La selección congela física de enemigos/proyectiles/armas lanzadas, animaciones relevantes, temporizadores, tweens y reloj de simulación. Por tanto no transcurren supervivencia, descanso, recarga, dash ni ulti. Se detiene el motor de la minigun y se exige soltar el ratón antes de volver a disparar. Las bajas de un mismo evento se registran antes de presentar las elecciones pendientes.

La ruleta activa termina antes de abrir cartas de nivel. Si una nueva ronda se solicita mientras hay elecciones pendientes, queda en cola. Los diálogos del jefe conservan su secuencia. Se comprobó una muerte de jefe con 99 XP previos: sus 150 XP llevan a nivel 3, conservan 31 XP y abren dos elecciones; después continúa el descanso y la ruleta de ronda 6.

Las estadísticas persisten al cambiar de ronda. Muerte, salida y cierre destruyen las cartas y sus callbacks; REINTENTAR crea un `Run`, `Progression`, `Ultimate` y `Dash` nuevos. No existe metaprogresión persistente entre partidas.

## Pruebas ejecutadas

| Ejecución | Resultado |
| --- | --- |
| `tsx --test tests/*.test.ts` | 51/51 aprobadas |
| `tsc --noEmit` | Correcto |
| `vite build` | Correcto; `dist/` actualizado |
| `node check-v09.cjs` | Correcto en Edge; sin errores JavaScript |
| `node check-v07.cjs` | Correcto: ruleta, inventario, minigun y RPG |
| `node check-v08.cjs` | Correcto: mapa, navegación, impactos, jefe, rendimiento y reintentos |
| `node check-v062.cjs` | Correcto: chaleco, ulti, HUD, rondas, menú y reinicios |

Los fixtures de las tres regresiones anteriores aíslan la concesión de XP para verificar el equilibrio base sin elegir mejoras aleatorias. La convivencia real con XP se verifica en `check-v09.cjs`, incluidas muertes normales, ejecuciones, explosiones, jefe, cartas y avance de ronda. Las otras suites históricas no se ejecutaron en esta actualización.

Verificaciones solicitadas cubiertas: concesión única; indicadores de XP; apertura de selección; tres opciones válidas; elección única con ratón/teclado y protección de callbacks; acumulación; exclusión de máximos; sobrante; niveles múltiples; pausa de movimiento, proyectiles, animaciones y temporizadores; persistencia entre rondas; modificadores de daño/cadencia/cargador de minigun y del resto del arsenal; límites defensivos y muerte; ausencia de solapamiento con ruleta; tres reintentos desde selecciones activas con progresión restablecida.

También se comprobaron exactamente los pesos 65/28/7 para la primera carta en un barrido determinista de 1000 sorteos, emergencias con recursos completos, pausa/ESC sin selección de cartas ocultas y golpe mejorado a corta distancia. Las verificaciones aceleran algunos relojes y transiciones mediante la API de escena; no sustituyen una sesión extensa de equilibrio manual.

La regresión visual mantuvo constantes las texturas con 24 enemigos y 12 luces; muestra headless de 120 intervalos: mediana 6,3 ms y percentil 95 de 8,5 ms. Vite conserva su aviso de bundle de Phaser superior a 500 kB, sin impedir compilar.

## Archivos añadidos o modificados

| Archivos | Cambio |
| --- | --- |
| `src/config/progression.ts` | XP, rarezas, estadísticas base y límites técnicos |
| `src/systems/UpgradeCatalog.ts` | Quince mejoras y tres emergencias configurables |
| `src/systems/Progression.ts` | XP única, niveles, ofertas ponderadas y elección |
| `src/systems/PlayerModifiers.ts` | Daño, cadencia, cargadores y enfriamiento derivados |
| `src/ui/LevelUpView.ts` | Tres cartas, ratón/teclas, pausa y selección secuencial |
| `src/systems/run.ts` | Estado por partida, máximos y botiquines |
| `src/systems/Armor.ts` | Capacidad ampliada y mitigación por tramo protegido |
| `src/systems/Ultimate.ts`, `src/ui/UltimateView.ts` | Parámetros variables y representación de la ulti |
| `src/systems/Dash.ts` | Enfriamiento configurable y reescalado |
| `src/systems/SurvivalSystem.ts` | Golpe básico, modificador melee y bloqueo durante selección |
| `src/weapons/arsenal.ts` | Capacidad opcional al crear/recargar; base preservada |
| `src/scenes/Game.ts` | Concesión por muerte, estadísticas, entradas y limpieza |
| `src/ui/CombatHud.ts` | XP/nivel, vida y chaleco con máximos variables |
| `src/systems/RoundDirector.ts` | Transiciones en cola durante elecciones |
| `src/ui/WeaponRoulette.ts`, `src/systems/UltimatePresentation.ts` | Secuencia segura con la pantalla de nivel |
| `src/scenes/Menu.ts`, `package.json` | Versión 0.9.0 y comando de prueba |
| `tests/progression.test.ts`, `check-v09.cjs` | Pruebas nuevas de progresión e integración |
| `check-v07.cjs`, `check-v08.cjs`, `check-v062.cjs` | Aislamiento explícito de XP en fixtures base |
| `README.md`, `VALIDACION-0.9.md`, `dist/` | Documentación y compilación actualizada |

No se añadieron dependencias ni recursos gráficos nuevos. Se reutilizan los iconos y sprites existentes. El alcance son las quince mejoras descritas; no se inventaron recetas de transformación de armas que la solicitud no especifica.

Capturas: `level-choice-v09.png`, `progression-hud-v09.png` y `emergency-cards-v09.png`. Para jugar, abrir la URL del servidor local; la verificación utilizó `http://127.0.0.1:5176`. `npm run test:browser:v09` requiere Edge y Playwright y acepta `GAME_URL`.
