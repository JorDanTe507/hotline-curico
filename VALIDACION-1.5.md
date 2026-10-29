# Hotline Curicó 1.5 — Expansión urbana y logros

Fecha de entrega: 28 de octubre de 2026. Proyecto existente: Phaser 3 + TypeScript + Vite. No se modificó el proyecto de ruleta de la carpeta superior ni se añadieron dependencias.

## Funcionalidades implementadas

- Biblioteca determinista de ocho familias: hotel, Banco de Curicó, farmacia, comisaría, supermercado, taller mecánico, fuente de soda y tienda de conveniencia.
- Dimensiones variables, seis módulos interiores y circulación central por edificio, dos accesos, orden de habitaciones variable, mobiliario por función y materiales propios. Las aberturas interiores varían su posición para alternar recorridos.
- Banco con cajas, oficinas, espera, vestíbulo y bóveda; farmacia con ventas, medicamentos, mostrador, bodega, consultorio y baño; comisaría con recepción, oficinas, espera, interrogatorio y celdas. Supermercado, taller, restaurante y tienda incluyen sus áreas registradas.
- Hotel como una familia adicional: recepción, individual, doble, baño, estar y una variante de servicio/deteriorada/cerrada. Dos tipos de cama, posiciones variables y material desgastado. Se conserva el complejo inicial y sus salidas.
- Selección de familias mediante una retícula determinista que evita repetir la plantilla inmediatamente vecina dentro de cada conjunto de biomas. Se mantienen patios industriales, vehículos y calles existentes.
- Contenedores, basura, cajas, pallets, barriles, neumáticos, escombros, bancas, jardineras, faroles, semáforos, señales, hidrantes, tapas, rejillas, postes, rejas, barreras, conos, grafitis, generadores, cabinas, casetas y baños públicos.
- Sólidos validados contra ocupación y conectividad; grafitis, tapas, rejillas y escombros visuales separados de la colisión. Reservas de accesos para evitar obstrucciones.
- Tío Aceite con validación del área exterior completa de 5×5 tiles: puesto/toldo/NPC de 3×3, laterales y dos filas de acceso. Se comprueban edificios y objetos, se reserva antes de decorar y se mantiene como máximo un puesto por sector elegible. Si no cabe, se omite. Se conserva su cartel e interacción.
- Catálogo de 40 logros con IDs, rarezas, iconos, condiciones, progreso, secretos, disponibilidad y fechas. **36 disponibles y cuatro inactivos**: Comandante, Demoledor, cinco jefes distintos y llegar sin mejoras temporales. Estos cuatro no aparecen como pendientes normales ni cuentan para el logro del catálogo activo.
- LOGROS en el menú principal: filtros Todos/Obtenidos/Pendientes, paginación, porcentaje, iconos oscurecidos o a color, rarezas y secretos ocultos. Navegación mediante ratón, teclado y mando.
- Notificaciones en cola, entrada de unos 300 ms, salida suave, aproximadamente cuatro segundos, icono, descripción y un sonido específico. Una escena independiente mantiene el combate sin pausarlo.
- Guardado de logros en `hotline-achievements-v1`, separado de `hotline-permanent-v1`. Eventos centralizados para inicio, bajas, daño, armas, ejecución, curación, nivel, cambios de cartas, compras, definitivas y rondas.
- Precisión contabilizada por disparo, con los perdigones agrupados: se espera la resolución de proyectiles en orden y un fallo corta la racha. Dash cuenta ataques realmente evitados durante su ventana; no basta con pulsar el botón.
- PROJECT507 concede **1.000.000 HC iniciales temporales**. INMORTALIDAD empieza activada y puede desactivarse antes de jugar. El estado y las compras de prueba sobreviven al menú, muerte y reintento durante la misma página. Desactivarla permite daño, absorción del chaleco y muerte normales.
- Todos los logros y sus escrituras quedan bloqueados durante todo el modo de pruebas, con independencia del interruptor. Recargar elimina el modo y recupera el progreso real.
- Notas de versión 1.5 añadidas, con la entrada 1.4 conservada. Menú animado, música, protagonistas, armas, habilidades, rondas y jefe existentes conservados.

## Archivos nuevos

- `src/world/BuildingTemplates.ts`: familias, metadatos y selección de plantillas.
- `src/maps/urbanAssets.ts`: preparación individual de los dos atlas aprobados.
- `src/systems/Achievements.ts`: catálogo, migración, eventos, contadores, desbloqueos y persistencia.
- `src/scenes/Achievements.ts`: menú y notificaciones independientes.
- `tests/v15.test.ts`: 16 pruebas adicionales de logros, aislamiento y generación.
- `check-v15.cjs`: integración de eventos, interfaz, recursos, guardado y modo desarrollador.
- `check-v15-world.cjs`: mando, secretos, notas, interior accesible, streaming y rendimiento.
- `tools/v15_resources.py`: generación reproducible del sonido y auditoría de procedencia de las imágenes.
- `public/assets/v15/achievements.png`, `city.png`, `provenance.json`; `public/assets/audio/achievement.wav`.
- Este informe.

## Archivos existentes modificados

| Área | Archivos |
|---|---|
| Ciudad | `src/world/WorldModel.ts`, `src/world/WorldStreamer.ts`, `src/world/TioAceite.ts` |
| Arranque y menús | `src/main.ts`, `src/scenes/Menu.ts`, `src/scenes/Restricted.ts`, `src/input/InputHub.ts` |
| Pruebas y economía | `src/systems/DeveloperSession.ts`, `src/systems/PermanentProgress.ts` |
| Eventos de combate y progresión | `src/scenes/Game.ts`, `src/systems/Ultimate.ts`, `src/systems/SurvivalSystem.ts`, `src/systems/UltimatePresentation.ts`, `src/systems/RoundDirector.ts`, `src/ui/LevelUpView.ts`, `src/weapons/WeaponCombat.ts`, `src/weapons/Burning.ts` |
| Sonido e historial | `src/systems/AudioSystem.ts`, `src/config/releaseNotes.ts` |
| Verificación y documentación | `tests/world.test.ts`, `check-world.cjs`, `check-v14.cjs`, `package.json`, `README.md` |

`tests/world.test.ts` ahora distingue los props sólidos de los decorativos. La prueba de saldo de `check-v14.cjs` se adaptó al millón solicitado; los importes de daño se conservan. La espera de movimiento del jefe usa su posición real para evitar depender de un único cuadro de carga.

## Recursos gráficos integrados

Las dos imágenes proporcionadas se copiaron sin sustituirlas por otros diseños. `provenance.json` registra sus referencias, SHA-256 y coincidencia exacta con los originales.

- Atlas de logros: 12 iconos base de 64×64 y seis marcos individuales. Sus estados usan color, oscurecimiento y ocultación. El banner y los controles se componen con Phaser siguiendo la paleta de la referencia.
- Guía de Curicó: 29 texturas individuales de objetos y ocho muestras de fachada, escaladas proporcionalmente con filtrado desactivado. Los fondos oscuros conectados al borde de los recortes urbanos se eliminan sin borrar globalmente sus colores oscuros internos.
- Los iconos, objetos y fachadas son texturas reutilizables preparadas una vez al arrancar. Las láminas completas nunca se dibujan como escenario ni como pantalla de interfaz.
- Suelos, paredes, mobiliario y vehículos anteriores se combinan con estos recursos. Se conservan tiles fuente de 32×32 y la escala de 48 unidades del mundo.
- Sonido nuevo: arpegio PCM mono de 650 ms para los desbloqueos, respetando el volumen de efectos existente.

No quedan recursos esenciales de esta actualización sin integrar. No se crearon recursos de los jefes futuros, un tercer personaje ni Boss Rush.

## Errores corregidos

1. Edificios procedurales repetidos con mobiliario genérico: familias y módulos con identidad propia.
2. Puestos en habitaciones: exclusión de geometría de todos los edificios y reserva del área completa, no solo del centro.
3. Objetos sólidos superpuestos o bloqueando circulación: máscara de ocupación, reservas de puertas y validación de conectividad.
4. Decoración de suelo tratada como obstáculo: separación explícita entre sólido y decorativo.
5. Fachadas sin relación con el local: carteles, colores y materiales asociados al tipo.
6. Modo de pruebas siempre inmortal: interruptor independiente del acceso a pruebas y del saldo temporal.

Durante las pruebas también se ajustaron dos fixtures: la recogida de arma se aisló del botín aleatorio y la medición de texturas compara el regreso al mismo sector, pues distintos edificios contienen diferentes cantidades de texto. Para inspeccionar eventos, las pruebas consultan las instancias registradas por el juego y evitan duplicar módulos de Vite mediante importaciones dinámicas.

## Pruebas ejecutadas

`npm` no está disponible en la terminal de ejecución utilizada. Se ejecutaron directamente los binarios locales equivalentes:

| Comprobación | Resultado |
|---|---|
| `.\node_modules\.bin\tsc.cmd --noEmit` | Aprobada |
| `.\node_modules\.bin\tsx.cmd --test tests/*.test.ts` | **110/110 aprobadas**, cero omitidas |
| `.\node_modules\.bin\vite.cmd build` | Aprobada, 91 módulos |
| `node check-v15.cjs` | Aprobada |
| `node check-v15-world.cjs` | Aprobada |
| `node check-world.cjs` | Aprobada: recorrido completo, jefe, streaming y tres reintentos |
| `node check-v14.cjs` | Aprobada: habilidades, dash, cartas, enemigos, Tío Aceite y aislamiento |
| `node check-v13.cjs` | Aprobada: mando simulado, acciones, menús, desconexión, preferencias y ambas definitivas |
| `node check-arsenal.cjs` | Aprobada: 16 armas, munición, NPC, proyectiles, caídas, colisiones y limpieza |

Las pruebas nuevas comprueban los 40 IDs y los 36 activos, migración y guardado independiente, secretos, duplicados, condiciones por partida y acumuladas, retos de jefe, precisión con proyectiles en vuelo, definitivas por activación, rachas de armadura y bloqueo integral en pruebas. La generación comprueba tres semillas en un área de 13×13 sectores, además de las pruebas existentes de 500 sectores y coordenadas negativas.

El navegador comprobó acciones reales de inicio, recogida, baja, cambio de cartas, daño y curación; notificación visible; persistencia tras volver al menú y recargar; clave exacta; compra temporal; ambos estados del interruptor; muerte y reintento con daño normal; recuperación del progreso normal al recargar. Los snapshots reales de dinero/mejoras y logros permanecen iguales durante el modo desarrollador.

En el mundo se comprobaron salida física del complejo, recorrido continuo hasta industria, persecución entre chunks, entrada física a un banco, acceso al botín, jefe con disparos y muerte, selección de mejoras y ronda siguiente. No se detectaron errores JavaScript, texturas ausentes ni errores HTTP en las suites que los registran.

Rendimiento local en Edge sin interfaz, con 24 enemigos y nueve sectores: una muestra final del recorrido completo midió **6,4 ms de mediana y 8,1 ms de percentil 95**. La prueba específica de 32 desplazamientos midió **5,5/10,3 ms**, regresó al mismo número de texturas (617), mantuvo la caché en 64 y alcanzó 1.958 hijos y 895 cuerpos estáticos como máximos en esa muestra. Las cantidades varían con la semilla; no se observó crecimiento acumulativo al regresar ni cuerpos de sectores anteriores después de reiniciar. Estas mediciones describen este entorno de pruebas, no una garantía para todo equipo.

La compilación conserva el aviso de tamaño del bundle de Phaser superior a 500 kB. No hay errores de compilación.

## Decisiones y límites

- El complejo inicial se conserva como inicio narrativo; la diversidad nueva está en la ciudad exterior. El hotel ya no es el edificio genérico de cada sector nuevo.
- Los interiores son módulos compactos compatibles con el tamaño y la navegación existentes, sin transiciones a escenas separadas.
- La comida del Tío Aceite mantiene la regla provisional de 1.4: +40 HP, gratuita y dos porciones por puesto y partida. No se cambió su economía ni repara el chaleco.
- Los logros no se conceden retroactivamente a partir de suposiciones sobre partidas anteriores. Empiezan a registrarse mediante eventos de esta versión; el dinero y las mejoras previas se conservan.
- Los cuatro logros futuros permanecen inactivos deliberadamente. No se implementaron los nuevos jefes, sus armas, otro protagonista ni Boss Rush.
- El mando se probó mediante la API estándar simulada; no se conectó hardware USB/Bluetooth físico en esta actualización.
- No se conoce ninguna funcionalidad esencial de 1.5 pendiente. Las pruebas cubren muestras deterministas y recorridos reales, sin pretender enumerar todas las semillas del mundo infinito.

## Cómo comprobarlo manualmente

1. Abrir `http://127.0.0.1:5176/` con el servidor local activo.
2. Entrar en LOGROS; usar filtros y siguiente/anterior. Los secretos muestran `???` y los futuros no cuentan.
3. Jugar con cualquier protagonista: se desbloquea su logro inicial y aparece el banner sin pausar. Salir del complejo para recorrer la nueva ciudad.
4. Buscar un puesto exterior del Tío Aceite y pulsar E o cruz con salud incompleta.
5. En ACCESO RESTRINGIDO escribir PROJECT507. Comprobar el millón temporal, comprar mejoras y probar INMORTALIDAD en ambos estados antes de elegir ronda.
6. Con daño normal se puede morir y reintentar conservando el estado de pruebas. Recargar vuelve al progreso real. Los logros nunca avanzan en ese modo.

Capturas: `v15-menu.png`, `v15-achievements.png`, `v15-achievements-secret-960.png`, `v15-unlock.png`, `v15-city.png`, `v15-bank-interior.png`, `v15-tio.png`, `v15-developer.png` y `v15-dev-death.png`.
