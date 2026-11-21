# Estabilización local de Supervivencia Continua, etapa 3

## Estado y alcance

Rama main, HEAD a29764b, versión 2.2.2. Se conservaron los cambios de trabajo anteriores. El inventario por archivo tomado al inicio está en test-results/stabilization-initial.txt. Trabajo local, sin commit, etiqueta, push ni despliegue. La etapa 4 sigue pendiente.

## Cambios y causa de los picos

- WorldModel.ts. Cada validación de conectividad de un obstáculo recorría el sector, construía conjuntos y listas por celda y aplanaba la cuadrícula. La búsqueda conserva las mismas cuatro conexiones y reutiliza dos buffers por sector. Se compararon 144 sectores de tres semillas antes y después mediante SHA-256 sobre el contenido completo. Ambas series dieron 37fd3dfd3e6e7c0272a9f123b64d671008adbd99e5be540c55a30d9e352412db. Para generación lógica, mediana/p95/p99/máximo en ms pasaron de 3,04/4,95/6,92/11,96 a 0,97/1,84/3,22/6,01 en sendas ejecuciones.
- WorldStreamer.ts. La preparación lógica de un vecino no urgente ocupa una actualización y su activación puede ocurrir en la siguiente. Los sectores visibles siguen teniendo prioridad inmediata con sus colisiones. Las capas visuales ya no recalculan caras de colisión por cada tile. Las colisiones físicas siguen usando los rectángulos existentes. Las sombras estáticas de props de Continua comparten un gráfico por sector. Las muestras de fases de carga se acotan a 256 por categoría.
- Archivos de verificación: tests/fortune16.test.ts y tools/check_continuous{,_city,_encounters,_streaming,_hazards}.cjs, además de tools/check_traditional_routes.cjs. Se añadió una dirección configurable a dos comprobadores para ejecutarlos contra el servidor local existente.

## Rendimiento en Edge de escritorio

| Métrica | Referencia anterior | Repetición del circuito corto | Teclado y dash | Tormenta, jefe y disparos |
|---|---:|---:|---:|---:|
| Duración real | 10,6 s | 10,745 s | 42,433 s | 78,835 s |
| Mayor carga desde el inicio | 40,1 ms | 37,3 ms | 29,3 ms | 48,2 ms |
| Máximo de objetos muestreados | 1.960 | 1.618 | 1.927 | 2.036 |
| Heap JS final, MB decimales | 140,4 | 129,8 | 142,1 | 166,7 |
| Sectores activos máximos muestreados | 10 | 9 | 12 | 12 |
| Geometrías preparadas máximas muestreadas | 55 | 55 | 12 | 27 |

El circuito corto usa saltos entre coordenadas y semillas variables. Los otros dos recorridos usaron movimiento real por teclado, dash y cambio de sentido, cruzando otra vez el origen. Visitaron 5 y 9 sectores distintos respectivamente. La prueba intensa adelantó el reloj de encuentros, activó la tormenta y equipó armadura adicional únicamente en el perfil temporal. Se descartó como medición sostenida un intento con muerte. El pico de 48,2 ms ya constaba en la primera muestra del ensayo intenso. Hubo otras comprobaciones locales durante parte de las pruebas. Las diferencias entre estas sesiones no permiten atribuir cada milisegundo a un cambio específico.

| Distribución durante el recorrido, ms | Mediana | p95 | p99 | Máximo |
|---|---:|---:|---:|---:|
| Intervalo entre actualizaciones, teclado | 5,9 | 8,2 | 10,1 | 26,3 |
| Carga de sector, teclado | 5,9 | 12,4 | 15,2 | 15,2 |
| Intervalo entre actualizaciones, estrés | 8,8 | 14,8 | 20,5 | 81,2 |
| Carga de sector, estrés | 7,0 | 17,2 | 20,5 | 20,5 |

Se midieron 161,2 y 106,0 actualizaciones Phaser por segundo en Edge headless. La pantalla física puede presentar a otra frecuencia. Los percentiles de sector se basan en pocos cruces y p99 puede coincidir con el máximo. El máximo de fotograma puede incluir GC, navegación, física, render y otros trabajos. No se atribuye entero al streaming.

En estrés, los p95 por fase fueron 6,1 ms en generación, 0 en recuperación de caché, 5,9 en tiles, 11,5 en sprites/fachadas, 1,4 en física y 1,8 en interactivos. La navegación medida en la instancia de rutas del jugador/enemigos tuvo p95 de 0,3 ms. La actualización de streaming completa tuvo p95 de 0,1 ms en la ventana final, que incluye muchos pasos sin trabajo. Las mediciones inclusivas pueden solaparse. Los datos por muestra están en test-results/stabilization-final-travel.json y test-results/stabilization-armored.json.

## Persistencia y regresiones

- TypeScript correcto. Vite compiló 228 módulos con un aviso de tamaño de bundle. Suite completa de 323 pruebas, todas correctas.
- La nueva regresión de cajas expulsa el sector de la caché y verifica identidad, posición, tipo, daño, apertura y cobro único. La generación utiliza semilla y coordenadas. El sorteo de botín ocurre al abrir o destruir por primera vez, detrás de la comprobación de cobro. Las pruebas existentes cubren pago, fondos insuficientes, suministros dormidos y reposición por tiempo y exploración.
- Simulación lógica a 30/60/120/240 minutos: 6/12/24/48 jefes; 27/53/104/207 sectores visitados; 140/275/530/1.045 HC generados. A las cuatro horas, 685 HC pendientes + 360 recogidos = 1.045. Caché lógica máxima de 64 sectores. El registro de visitas crece con la exploración.
- Rayos: tres semillas por ejecución, tres biomas por semilla. Se comprobaron puntos exteriores válidos, interiores, sólidos, reserva entre peligros, aviso todavía activo a 1.499 ms y resolución a 1.500 ms del reloj de juego. Una ejecución final de 19,988 s incluyó tres ciclos de muerte, reinicio, segunda muerte y salida al menú. Las tres partidas tuvieron 73 listeners de escena, dos cuerpos dinámicos y cero temporizadores en el punto de control. El comprobador anterior asumía una casilla fija y avanzaba varios relojes de eventos. Ahora verifica que el punto tenga salida y resuelve el aviso anterior antes de comprobar el siguiente encuentro. La causa de la incidencia histórica exacta no se pudo reconstruir sin su semilla.
- En la comprobación de ciudad se validaron dash, armadura, daño ambiental, tránsito a 290 px/s después de 2,3 s de aviso, un impacto por actor examinado, limpieza visual de restos y la reserva adicional del encuentro doble. El vehículo y el aviso reutilizan objetos de escena.
- Jefes: 13,10 s en el comprobador final de encuentros. Se probaron seis apariciones, Wesker transformado y dos jefes simultáneos. El comprobador aleja jugador y cámara por tres posiciones, comprueba descarga efectiva, invoca la persecución lejana y regresa. Verifica registro de encuentro, controlador, sprite, cuerpo habilitado, salud y recompensa única. Es una prueba acelerada de transición.
- Tres protagonistas en Tradicional y Continua con disparo inicial. Regresión de Continua con pausa, perks, muerte, reinicio y salida en 11,91 s. Rutas de teclado y mando de Tradicional, solo y cooperativo, en 7,62 s.

## Límites y riesgos

El presupuesto de 16,7 ms aún se supera en estrés y en arranques urgentes. Los sprites, rótulos y fachadas siguen siendo el grupo de mayor coste. No se midió en teléfono físico. En estrés el heap pasó de 89,2 a 166,7 MB con más sectores preparados y enemigos presentes. Los listeners permanecieron en 74 y los temporizadores en cero durante ese recorrido. Los cuerpos estáticos pasaron de 521 a 583 y los dinámicos de 3 a 8, con máximo de 22 dinámicos. En el recorrido normal los cuerpos estáticos pasaron de 541 a 545. Son observaciones de corto plazo, sin instantáneas de heap tras recolección forzada. Las cuatro horas son simuladas. Sigue pendiente caracterizar la retención en sesiones gráficas de horas y la cola de fotogramas lentos en equipos de menor potencia.
