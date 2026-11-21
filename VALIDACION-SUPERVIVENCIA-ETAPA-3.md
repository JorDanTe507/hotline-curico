# Hotline Curicó · Supervivencia Continua, etapa 3

## Base y alcance

Rama main, HEAD a29764b, versión 2.2.2. La copia de trabajo ya contenía cambios en economía física, escenarios, HUD, herramientas y las etapas 1 y 2. Se preservaron esos cambios. Esta entrega es local, sin commit, etiqueta, push ni despliegue.

## Ciudad y persistencia

La geometría reutiliza WorldModel, WorldStreamer, las fachadas y la red de calles existente. Cada sector mide 32 × 32 celdas de 48 px (1.536 px por lado). En Continua cada grupo de 3 × 3 sectores pertenece a un barrio determinado por la semilla. Las variantes residenciales incorporan casas y departamentos con dormitorio y comedor. El comercio reutiliza las plantillas de locales y el sector industrial incorpora bodegas y patios. Las avenidas de cuatro celdas enlazan sectores en coordenadas positivas y negativas.

La selección admite varios centros de interés. En esta etapa utiliza al protagonista y anticipa 0,65 segundos de desplazamiento. Busca candidatos en la vecindad 3 × 3. Carga un sector ordinario por fotograma y prioriza todos los que intersectan el encuadre más 48 px. Prepara la geometría del siguiente candidato y retira hasta un sector fuera de cámara por fotograma cuando su centro supera 1,65 sectores en algún eje. La caché lógica existente admite 64 geometrías. Una carga urgente al saltar grandes distancias puede superar el presupuesto ordinario.

Las monedas siguen en el registro espacial de la partida y su recogida sigue siendo física. El botín dormido reutiliza el almacenamiento temporal de sesión con respaldo en memoria. Continua conserva los registros incluso al superar 256 sectores sin almacenamiento de navegador. Las cajas intactas pueden regenerarse al descargar el sector. Las dañadas, abiertas o cobradas conservan su estado. Los suministros médicos normales se generan una sola vez. La estación especial entrega munición, tiene como máximo una ubicación candidata por grupo de 3 × 3 sectores y exige simultáneamente 18 minutos efectivos y cinco sectores nuevos desde la entrega anterior. Admite dos reposiciones después de la entrega inicial. El registro de exploración y reposiciones tiene representación serializable de versión 1. La recuperación completa de partida pertenece a la etapa 5.

## Clima, tráfico y encuentros

El ciclo utiliza tiempo efectivo. Comienza despejado, pasa por lluvia, tormenta y calma. Despejado y lluvia duran entre 60 y 120 segundos, tormenta entre 45 y 105 y calma entre 90 y 150. Se reutilizan lluvia, charcos, iluminación y ambiente sonoro. En tormenta aparecen destellos atmosféricos cada 1,9–6,8 segundos. Un intento de rayo peligroso exige suelo abierto y escapatoria. El círculo de 70 px se muestra 1,5 segundos efectivos antes de los 32 puntos de daño base. Los intervalos entre intentos son de 12–27 segundos después del primer intento.

El tráfico intenta circular cada 2–4 minutos. Se controla la ruta recta completa de 1.800 px sobre la calle. El aviso visual y de motor dura 2,3 segundos. El vehículo circula a 290 px/s, con 38 puntos de daño base y un impacto como máximo por actor. Se selecciona accidente para el 30 % de los vehículos aceptados. Los restos son visuales, sin colisión, y se desvanecen al final de sus 12 segundos. Esto conserva las salidas y las rutas de jefes. Hay como máximo un vehículo o resto y un aviso de rayo. El coordinador reserva la zona de peligro y añade cuatro segundos de separación, o nueve durante un encuentro doble.

El daño pasa por las defensas existentes. El dash protege del rayo y del atropello. Los jefes reciben como máximo un 3,5 % de su salud máxima por impacto, hasta el valor de daño del peligro. El calendario, la identidad y la persecución son los de la etapa 2. La baja ambiental conserva las monedas y la recompensa especial del jefe, con exclusión de experiencia y carga de definitiva. Tío Aceite y las reglas de compra de la caja de 500 HC conservan sus rutas existentes.

## Archivos de esta etapa

- Nuevos: src/world/ContinuousCity.ts, ContinuousCityState.ts y SectorFocus.ts en el mismo directorio, tests/continuousCity.test.ts y tools/check_continuous_city.cjs.
- Integración: src/world/WorldModel.ts, WorldStreamer.ts, ChunkLootStore.ts, FortuneObjects.ts y FortuneState.ts; src/atmosphere/CityAtmosphere.ts; src/scenes/Game.ts; src/systems/Ultimate.ts y ContinuousEncounters.ts; src/uroboros/Encounter.ts.
- Métricas de sesión: continuousCity.diagnostics() informa sectores activos, preparados, visitados y pendientes, grupos de moneda, registros de suministros, objetos de escena, duración de carga, actualización, fotograma y memoria JS si está disponible.

## Validación

TypeScript correcto. Vite compiló la distribución de producción. Persiste la advertencia de tamaño del paquete JavaScript. Suite de 322 pruebas aprobadas, cero fallos.

| Minutos simulados | Encuentros | Sectores distintos | Máximo de geometrías en caché | HC pendientes | HC recogidos |
|---:|---:|---:|---:|---:|---:|
| 30 | 6 | 27 | 27 | 85 | 55 |
| 60 | 12 | 53 | 53 | 170 | 105 |
| 120 | 24 | 104 | 64 | 340 | 190 |
| 240 | 48 | 207 | 64 | 685 | 360 |

La simulación lógica ejercitó revisitas, entregas, cobros, calendario y clima. A las cuatro horas registró 77 intentos de tráfico y 159 intentos de rayo. La suma de HC pendientes y recogidos fue igual a los 1.045 HC generados. El número de sectores descubiertos y los cambios persistentes crecen con la exploración. Limitar la caché gráfica no limita la cantidad de historia que una partida debe recordar.

En un recorrido automatizado de 10,514 segundos reales en Edge se visitaron los tres barrios, combinando saltos controlados entre sectores y movimiento por teclado. Se observaron hasta 10 sectores activos, 55 geometrías preparadas y 1.996 objetos de escena. La última muestra fue de 111.834.641 bytes de heap JavaScript y cero sectores pendientes. La carga individual más lenta registrada fue de 39,1 ms. Ese pico supera el presupuesto de un fotograma a 60 Hz. No es una medición de FPS sostenidos. El recorrido verificó lluvia, tormenta, aviso e impacto, dash, armadura, monedas y atribución, tránsito, accidente, limpieza y daño ambiental en un encuentro doble. La regresión de la etapa 1 comprobó pausa, ventajas, muerte, reinicio y regreso a Tradicional.

No se probó en teléfono físico ni durante cuatro horas reales de renderizado. Los recorridos de navegador fueron automatizados. La animación del accidente reutiliza el vehículo existente con tinte, giro y desvanecimiento. No se añadió arte nuevo.
En la comprobación final, tras incorporar las viviendas residenciales, el recorrido duró 10,594 s y alcanzó 10 sectores activos, 55 preparados y 1.960 objetos. Terminó con nueve sectores activos, cero trabajos pendientes y 140.417.455 bytes de heap JS. La carga máxima registrada fue de 40,1 ms. La regresión final de la etapa 2 pasó en Edge con los tres protagonistas y ambos modos, los seis jefes, la transformación de Wesker, el encuentro doble y el beneficio temporal acreditado una sola vez. Se ajustó la sincronización del comprobador tools/check_continuous_encounters.cjs para que la automatización no serializara objetos de escena al navegar. En una ejecución previa conjunta el aviso eléctrico no se reprodujo en el punto elegido; la repetición secuencial con comprobaciones de estado pasó. La prueba positiva cubre una posición válida, no garantiza rayos en todas las semillas o ubicaciones.
