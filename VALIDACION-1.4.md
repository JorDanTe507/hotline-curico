# Hotline Curicó — entrega y validación 1.4

Fecha: 28 de octubre de 2026. Proyecto: `D:/Escritorio/ruletadbd/hotline-curico`.

## 1. Estado real e implementación verificada

Se extendió el proyecto existente Phaser 3 + TypeScript + Vite. No se reconstruyó el juego ni se sustituyeron sus gestores. La inspección inicial encontró cinco clases de enemigo, quince cartas y seis mejoras permanentes por protagonista. No existían Tío Aceite, los tres vehículos específicos, cambios de cartas, notas estructuradas ni el modo desarrollador. Esas diferencias se resolvieron en esta actualización.

- **16 arquetipos** con parámetros centrales de salud, daño, velocidad, rango, detección, cadencia, agresividad, peso y ronda de introducción. Se preservan navegación y colisiones. Médico cura aliados, blindado resiste balas, atlético prioriza velocidad; armas, salud y ritmos diferencian a los demás. Francotirador avisa con línea de apuntado antes de disparar.
- **Perro**: preparación de 350 ms, dirección fijada, carga recta de 280 ms y recuperación. Puede recibir daño y morir cargando. Se probó físicamente su colisión contra una pared. No utiliza la invulnerabilidad del jugador.
- **Incendiario**: encuentro de resistencia superior; fuera de la selección ordinaria. Desde ronda 6, probabilidad configurada del 8% por ronda elegible, nunca en rondas de jefe y máximo uno vivo por generación. Cono de 175 px, daño por intervalos de 150 ms, consumo/recarga de combustible y movimiento más lento al disparar. Recompensa adicional de 50 HC y 100 XP configurados para su clase. No sustituye a El Torturado.
- **Armas recuperables**: cuchillo, bate, blindado, perro y especialistas fijos no buscan armas. Los compatibles recuperan armas de fuego. La caída conserva instancia y munición; se mantiene el almacenamiento de botín de sectores.
- **Vehículos**: Aveo gris averiado con motor visible, Spark blanco compacto y Lanos gris hatchback de tres puertas. Sprites cenitales individuales, estáticos; sustituyen automóviles genéricos del exterior y del estacionamiento original. Misma semilla, huellas sólidas y rutas del mapa; sin conducción.
- **Tío Aceite**: puesto ocasional en plazas y sectores comerciales, fuera de edificios y calles. La generación busca espacio y comprueba conectividad antes de aceptarlo. Toldo azul/blanco y cartel amarillo TÍO ACEITE; espera/atención/preparación/entrega mediante poses del puesto y retratos de diálogo. E/cruz interactúa. Es un objeto/NPC amistoso independiente de los enemigos y no recibe su IA.
- **24 cartas**: siete épicas, ocho raras y nueve comunes; selección por rareza 65/28/7, tres opciones distintas y elegibilidad por nivel/personaje. Se mantienen los quince IDs anteriores. Nicolás no recibe Recuperación extrema de Calada; Tiempo prestado sí tiene variante Tryhard y respeta 14 s. Los máximos se excluyen y se conservan opciones de emergencia al agotar el catálogo.
- **Nueve efectos nuevos**: segunda oportunidad una vez por run (1 HP, inmunidad 2 s); bala fantasma 15/25/35%, segundo objetivo 50%; sed de sangre con valores propios y enfriamiento de 1 s; blindaje temporal 25/35/45 una vez por ronda; explosión secundaria 5/8/12%, sin cadenas ni daño propio; velocidad por bajas que renueva 3 s sin apilar; recarga hasta −25%; lanzamiento hasta +30 daño/+750 ms de aturdimiento; reserva recibida hasta +80%, sin modificar cargador ni duplicar munición al cambiar dueño.
- **Cambios de cartas**: uno gratuito por nivel, reiniciado para cada elección pendiente; descarta el grupo previo, respeta restricciones y no consume si no hay alternativas. La selección bloquea dobles eventos. **Segunda elección** añade hasta cuatro cambios por personaje: total máximo cinco, coste acumulado 1.700 HC. Persiste en el guardado existente; las seis compras previas conservan costes y niveles.
- **Cinemáticas**: sistema único con datos por personaje. Los dos banners originales son copias idénticas a los suministrados, con escala proporcional. Permanecen 2.250 ms, con salida gradual; se pausa combate/temporizadores/entrada de juego, se puede pausar la presentación y la habilidad empieza a contar al salir. No permite dobles reservas. Cervela conserva regeneración automática; Nicolás no fuma ni recibe regeneración pasiva o munición infinita.
- **Dash y HUD**: procesamiento previo al paso físico y daño central protegido durante 180 ms; al acabar vuelve la vulnerabilidad. El cooldown no modifica esa duración. Retrato de diálogo/HUD ampliado de 34 a 74 px, conservando proporción y estados críticos, con barras recolocadas.
- **Modo desarrollador**: acceso exacto PROJECT507, inmortalidad de salud y chaleco, copia de mejoras y saldo inicial de 9.999 HC en memoria, selección 1–10 y ambos protagonistas. Se probó el jefe de ronda 5. Continúa al volver al menú, cambiar personaje y reiniciar. Recargar descarta modo, compras y saldo de prueba. No escribe recompensas ni compras en el dinero real y el botín de las runs de prueba tampoco usa sessionStorage.
- **Notas de actualización**: botón inferior izquierdo, fecha y versión, categorías desde datos estructurados, desplazamiento, cerrar y navegación por ratón/teclado/mando. La interfaz admite entradas futuras sin inventar versiones anteriores.

## 2. Archivos creados o modificados

Rutas relativas a la carpeta del proyecto indicada arriba.

| Área | Archivos |
|---|---|
| Configuración | `src/config/aceite.ts`, `cinematics.ts`, `releaseNotes.ts` (nuevos); `dynamicRounds.ts`, `permanent.ts`, `progression.ts` |
| Enemigos | `src/enemies/EnemyBehaviors.ts`, `expansionAssets.ts` (nuevos); `config.ts`, `maton.ts` |
| Progresión/combate | `src/systems/RunPerks.ts`, `DeveloperSession.ts` (nuevos); `UpgradeCatalog.ts`, `Progression.ts`, `PermanentProgress.ts`, `PlayerModifiers.ts`, `RoundDirector.ts`, `SurvivalSystem.ts`, `Armor.ts`, `Dash.ts`, `Tryhard.ts`, `Ultimate.ts`, `UltimatePresentation.ts`, `Perception.ts`, `CriticalHealth.ts`, `run.ts` |
| Escenas/entrada | `src/scenes/Restricted.ts`, `ReleaseNotes.ts` (nuevos); `Game.ts`, `Menu.ts`, `Upgrades.ts`; `src/input/InputHub.ts`; `src/main.ts` |
| Mundo | `src/world/TioAceite.ts` (nuevo); `WorldModel.ts`, `WorldStreamer.ts`; `src/maps/MapVisuals.ts` |
| Interfaz/armas | `src/ui/LevelUpView.ts`, `CombatHud.ts`; `src/weapons/WeaponCombat.ts`, `arsenal.ts` |
| Recursos | `public/assets/v14/enemies.png`, `cars.png`, `aceite.png`, `cervela-banner.png`, `nicolas-banner.png`, `provenance.json` |
| Pruebas | `tests/v14.test.ts`, `check-v14.cjs`, `check-v14-menus.cjs`, `check-v14-world.cjs` (nuevos); expectativas de `tests/characters.test.ts`, `progression.test.ts`, `survival.test.ts`; fixtures `check-v12.cjs`, `check-v09.cjs` y menú de mando adaptados a filas/armadura nuevas |
| Entrega | `package.json`, `index.html`, `README.md`, `VALIDACION-1.4.md`; auditoría de procedencia `tools/v14_provenance.py` |

## 3. Recursos gráficos

Las tres referencias de enemigos, automóviles y Tío Aceite se usaron para preparar hojas transparentes con ImageGen. El cargador recorta celdas individuales, elimina únicamente márgenes transparentes y normaliza proporcionalmente; no borra negro del pelo, ropa o vehículos. Se crean 64 poses de enemigo, tres vehículos, tres poses del puesto y tres retratos. Las hojas completas no se colocan como objetos del escenario.

Los banners `Hagamos esto una vez más (1).png` y `Gamer neón contra los jefes.png` se copiaron sin modificación. SHA-256, dimensiones, rangos alfa y correspondencia con originales constan en `public/assets/v14/provenance.json` y se verifican en pruebas. No quedan referencias gráficas obligatorias sin archivo.

Las animaciones adaptadas de enemigos usan reposo, paso, ataque y caída, con espejo horizontal; no se presenta esto como un juego nuevo de animaciones de ocho direcciones. Los sprites y animaciones de combate anteriores de Cervela y Nicolás se conservan.

## 4. Correcciones verificadas

- Inicio del dash antes de colisiones físicas y referencia temporal ajustada al frame de activación, para no consumir su duración por un frame largo anterior.
- Daño central respeta dash y segunda oportunidad; el modo inmortal retorna antes de consumir salud, chaleco o segunda oportunidad.
- Limpieza de escena marca la run terminada antes de cancelar ruleta/cinemática: evita reanudar animaciones ya destruidas en un reinicio directo.
- Entrada de menús por eventos discretos y deduplicación de eventos nativos en la contraseña; Enter no envía a la vez la clave y una letra del teclado en pantalla.
- El lanzamiento brutal aplica efectivamente los 750 ms adicionales, además de su daño.
- Tiempo prestado puede extender una activación Tryhard en curso, sin superar el límite absoluto de 14 s.
- Se corrige el suelo interno del cooldown especial para respetar Reflejos permanente: base 500 ms; 410 ms con Reflejos completo, sin alterar los 180 ms de dash.
- Se conserva identidad de armas y munición al descargar sectores y se evita aplicar varias veces el bono de reserva al mismo objeto.
- Favicon local de datos evita solicitudes 404 del navegador.

## 5. Resultados

| Prueba | Resultado |
|---|---|
| TypeScript `tsc --noEmit` | PASS |
| `tsx --test tests/*.test.ts` | **94/94 PASS** |
| `vite build` | PASS; advertencia habitual del bundle Phaser mayor de 500 kB, sin error de compilación |
| `check-v14.cjs` | PASS: dash, segunda oportunidad, cambios de cartas, cinemáticas/pausa, munición fantasma/explosiva, recarga/reserva/lanzamiento, perro/médico/fuego/restricciones, encuentro único, NPC/curación, Sed de sangre absoluta de Nicolás, notas, clave, compras de prueba, inmortalidad, ronda 5, retorno/reinicio/recarga y guardado real intacto |
| `check-v14-menus.cjs` | PASS: notas y desplazamiento con mando, séptima mejora/persistencia independiente, cambio de cartas por mando y ventana 960×640 |
| `check-v14-world.cjs` | PASS: perro cargando contra pared y daño durante carga; los tres modelos en un estacionamiento procedural real; 24 enemigos de arquetipos variados y memoria acotada |
| `check-arsenal.cjs` | PASS: 16 armas de jugador/NPC, munición, drops únicos, recuperación/lanzamiento, recarga, efectos, colisiones y persistencia de instancias |
| `check-world.cjs` | PASS: 17 comprobaciones de continuidad, paseo físico hasta industria, persecución, jefe/rondas, botín, XP, streaming y tres reintentos limpios |
| `check-v13.cjs` | PASS: mando simulado, dos sticks, botones, definitivas, menús, desconexión y preferencias |
| `check-v12.cjs` | PASS: economía normal, mejoras compartidas/independientes, persistencia, recompensas y reintento |
| `check-v11.cjs` | PASS: vida temporal proporcional, daño letal normal, alarma crítica, pausa, muerte y audio |

Las expectativas históricas que exigían quince cartas, exclusión de Tiempo prestado de Nicolás o cero protección al comprar Blindaje se ajustaron a las reglas 1.4. Se conservaron las pruebas de las mecánicas que no cambian.

Rendimiento local del estrés de 24 enemigos variados: mediana **11,9 ms**, P95 **19,3 ms**, nueve chunks, caché máxima 64, 434 cuerpos estáticos y 1.012 objetos observados. Es una medición del entorno de pruebas, no una garantía para otros equipos. El recorrido general mantuvo 20 capas y tres reintentos sin fugas.

Revisión visual mediante capturas: `v14-enemy-preview.png`, `v14-world-vehicles.png`, `v14-tio-aceite.png`, `v14-cervela-cinema.png`, `v14-nicolas-cinema.png`, `v14-test-upgrades.png`, `v14-developer-boss5.png`, `v14-release-notes.png`, `v14-upgrades-small.png`, `v14-reroll-pad-small.png`.

## 6. Configuración provisional y límites

- **Tío Aceite no tiene precio definitivo aprobado.** Configuración experimental explícita: +40 HP directos, coste 0 HC, dos porciones por puesto durante la run; no crea botiquines ni repara chaleco. Probabilidad 45% en celdas de colocación elegibles separadas dos chunks, limitada además por bioma, espacio y conectividad. Ajustable en `src/config/aceite.ts`.
- Bolsillos profundos aumenta reserva recibida por suministros y por primera adquisición de un arma; no crea cargadores ni permite multiplicar el mismo arma al soltarla y recuperarla.
- Se mantienen los perfiles visuales de las referencias mediante recursos adaptados; no se añade conducción ni tráfico.
- La compatibilidad física USB/Bluetooth de un DualShock sigue pendiente de una prueba con hardware real. Se verificó Gamepad API con mandos simulados; esta limitación anterior no se oculta.
- No existía un sistema persistente de récords o progreso de rondas y no se inventó uno. El modo de pruebas mantiene separado todo el progreso permanente que sí existe. Es una herramienta local, no autenticación de seguridad.
- Guardado normal local al navegador/origen. La falta de almacenamiento mantiene la sesión en memoria y el aviso existente; no hay sincronización entre equipos.

No quedan funciones esenciales nuevas 1.4 identificadas sin integrar. El equilibrio económico definitivo de la comida queda expresamente pendiente de aprobación, utilizando el modo provisional solicitado.

## 7. Cómo probar

1. Abrir `http://127.0.0.1:5176/` y pulsar JUGAR; elegir Cervela o Nicolás. Teclado/ratón y mando mantienen sus controles.
2. MEJORAS muestra siete líneas por personaje. Comprar Segunda elección con HC normal añade cambios al siguiente nivel; los cambios se reinician por subida, no se acumulan entre niveles.
3. Explorar zonas comerciales/plazas para encontrar Tío Aceite; E/cruz sirve comida sin gastar HC. El puesto no aparece sobre edificios ni calles.
4. Cargar la definitiva con impactos válidos; X/triángulo presenta el banner antes de activar los efectos.
5. NOTAS DE ACTUALIZACIÓN, abajo a la izquierda, admite rueda, PageUp/PageDown y botones de desplazamiento; mando o flechas/Enter seleccionan botones. Escape/círculo vuelve.
6. ACCESO RESTRINGIDO, abajo a la derecha: escribir **PROJECT507**, elegir personaje y ronda. RONDA 5 inicia correctamente a El Torturado tras la ruleta y el diálogo. MEJORAS DE PRUEBA gasta únicamente la copia temporal. Volver al menú y reiniciar conserva el modo; **recargar la página lo desactiva y restaura el progreso normal**.
7. Comandos disponibles: `npm test`, `npm run build`, `npm run test:browser:v14`, `npm run test:browser:v14:menus`. En la terminal de este entorno npm no está en PATH: se ejecutaron sus equivalentes locales `node_modules/.bin/tsx.cmd`, `tsc.cmd` y `vite.cmd`, sin reinstalar dependencias.

