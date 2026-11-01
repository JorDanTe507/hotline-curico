# Hotline Curicó 1.5.3 — Penetración legendaria y nuevo logro

Actualización exclusivamente local del 31 de octubre de 2026, sobre la 1.5.2 presente en el directorio de trabajo. No se creó una segunda Requiem ni una versión 1.5.4. No se ejecutó `git push`, no se creó un commit y no se publicó en Pages. HEAD y la referencia local `origin/main` siguen en `9b324b5`.

## Verificación de la base

Antes de editar se comprobó Requiem en ID 9: legendaria, 90 de daño, cargador de seis balas, reserva inicial de 12, intervalo de 1000 ms y recarga de 2400 ms. El sprite ya existe en `public/assets/weapons/requiem/source.png` y se conserva sin regenerarlo.

Permanecen los valores de la 1.5.2: tres botiquines, multiplicador 0,55 para fuego de matones comunes, restricción probabilística de recogida de básicos, ruleta de Requiem al 1%, demás armas y configuración del jefe. No se modificaron módulos de teclado, ratón, mando o Bluetooth ni las implementaciones de Última Calada y Modo Tryhard.

## Penetración

Los porcentajes configurables están en `src/weapons/RequiemPenetration.ts`:

| Impacto válido | Multiplicador | Daño sin otros modificadores |
| --- | --- | --- |
| 1 | 100% | 90 |
| 2 | 85% | 76,5 |
| 3 | 70% | 63 |
| 4 | 55% | 49,5 |

Cada proyectil del jugador con ID 9 crea su propia instancia de `RequiemPenetration`, con contador y conjunto débil de objetivos alcanzados. El multiplicador siempre parte del daño original del disparo; no se encadena una reducción sobre la anterior.

`Game.advanceRequiem` comprueba el segmento recorrido entre fotogramas, ordena los objetivos por su posición en la trayectoria y aplica los impactos en ese orden. Un objetivo ya alcanzado, incluido un jefe, no se vuelve a dañar con ese proyectil. Tras el cuarto impacto se resuelve el disparo y se destruye su collider y sprite.

Con menos impactos continúa hasta agotar el alcance o encontrar un sólido. Se conservan los colliders de Arcade Physics y se comprueba además el recorrido contra la cuadrícula de sólidos, evitando atravesar una pared durante un salto entre fotogramas. Se probó tanto el barrido de cuadrícula como la colisión física real.

El daño pasa por `Game.hit`, conservando los modificadores capturados al disparar, críticos, bonificaciones de distancia y protección de los enemigos blindados. La resistencia del blindado reduce el primer impacto de 90 a 54, como corresponde al sistema anterior. Las otras armas conservan sus reglas, incluida la penetración previa de minigun y la carta Bala fantasma; no reciben la nueva habilidad de cuatro objetivos. Requiem utiliza su progresión exclusiva sin acumular la penetración genérica de esa carta.

## Sprite y efectos

Se reutiliza el PNG local de la 1.5.2: silueta plateada, cañón largo y empuñadura negra. No se sustituyeron animaciones de personajes ni se añadieron imágenes externas.

`requiemAssets.ts` mantiene las texturas de arma de 32×32. Añade una trazadora compartida de 16×3 y un icono `achievement-12` de 64×64, compuesto con el sprite existente y borde dorado. Los impactos intermedios usan un pequeño destello que dura 100 ms; no hay emisores de partículas continuos. El impacto final reutiliza la rutina existente.

## Réquiem por los muertos

- ID persistente: `requiem-round`.
- Nombre: **Réquiem por los muertos**.
- Descripción exacta: **Salud para los vivos. Réquiem para los muertos**.
- Rareza: **LEGENDARIO**.
- Posición: entrada 41 del catálogo. Se conservan las 40 anteriores; quedan 37 activas y cuatro reservadas.
- Marco y notificación: sistema legendario existente, con el nuevo icono basado en Requiem.

`RequiemRoundChallenge`, propiedad del director de rondas, registra la condición inicial, los enemigos realmente generados, los ataques emitidos, sus créditos, las muertes, el tiempo de combate observado y cualquier exposición al modo desarrollador.

Para ser elegible, Requiem debe estar activa cuando el director inicia la ronda. Recogerla después de esa frontera, incluida la primera ruleta de una partida comenzada desarmado, no concede elegibilidad retroactiva: hay que equiparla antes de la siguiente ronda.

Cada llamada real de disparo identifica su arma de origen. Un disparo ajeno invalida aunque falle; se registran individualmente ambas armas en Calada. Golpear, usar un arma melee, ejecutar, lanzar o activar una explosión ofensiva también invalida. Esto incluye una explosión de la carta Munición explosiva aunque se origine a partir de Requiem. Los impactos secundarios no pasan por disparos exclusivos válidos simplemente por conservar un ID 9.

Curación, recarga, dash, chaleco y activación de definitiva no invalidan. Dos Requiem durante Calada son válidas, con contadores por proyectil. Una Requiem y una escopeta invalidan al producirse el disparo ajeno. Nicolás conserva sus modificadores legítimos, incluida la multiplicación actual de daño por 1,35, y puede obtener el logro con Tryhard.

El desbloqueo se evalúa únicamente cuando el director confirma la ronda completada con salud positiva. Se exige combate con enemigos reales y al menos un disparo registrado; no hay mínimo de bajas personales. Las muertes producidas por enemigos no se consideran ofensivas del jugador. En exterminio y jefe se conserva el objetivo natural de la ronda, con evidencia de muertes reales. En supervivencia se comprueba el tiempo observado de simulación; cambiar únicamente el reloj o el contador no basta.

Saltar la secuencia de rondas, interrumpirla, perder o usar el modo desarrollador bloquea la concesión. El estado de invalidación no se recupera dentro de la ronda. La prueba automatizada comprueba el modo desarrollador con inmortalidad activada y desactivada.

El servicio de logros conserva `hotline-achievements-v1`, las fechas y el progreso anterior. El evento de concesión emitido por el director utiliza la rutina existente, que evita duplicar notificaciones. Volver a cargar la página conserva el desbloqueo sin mostrarlo de nuevo. No se borran monedas, mejoras o preferencias.

## Resultados de pruebas

| Prueba | Resultado |
| --- | --- |
| `npm run build` | Aprobado: TypeScript y Vite, 99 módulos |
| `tsx --test tests/*.test.ts` | **135/135 aprobadas**, ninguna omitida; 13 pruebas específicas nuevas |
| `check-requiem153.cjs` | Aprobado: penetración, obstáculos, definitivas, elegibilidad, notificación, menú y persistencia |
| `check-arsenal.cjs` | Aprobado: 16 armas, munición, recogida, sustitución, lanzamiento, reutilización, AoE/fuego y limpieza al reintentar |
| `check-v13.cjs` | Aprobado: teclado, ratón, mando estándar simulado, conexión/desconexión, acciones, menús y ambas definitivas |
| `check-v15.cjs` | Aprobado: logros previos, economía, compras, guardado, Tío Aceite y aislamiento del modo de pruebas |
| `check-mobile151-menus.cjs` | Aprobado: acciones y menús táctiles, tres punteros, reintento y ambos personajes; 915×412, 844×390 y 800×360 |
| `check-balance152.cjs` | Aprobado: balance 1.5.2, tres botiquines, flag de recogida, rondas 1–5 y ataque real de El Torturado |
| `check-mobile151-production.cjs` | Aprobado: paquete final bajo `/hotline-curico/`, carga, selección, introducción, ruleta, HUD y pausa en emulación Android |
| Recursos | Los **320 archivos públicos** aparecen idénticos en `dist` |

La prueba Phaser de penetración cubrió uno, cuatro y cinco objetivos alineados; daño progresivo; quinto objetivo intacto; parada por pared y alcance; jefe sin impactos repetidos; blindados y especiales; dos proyectiles independientes; disparo real de dos Requiem durante Calada; ausencia de la habilidad nueva en otras armas; Tryhard con su daño vigente.

Los 16 escenarios de seguimiento de ronda fueron: exclusiva válida, disparo ajeno fallado, Calada mixta, Calada doble Requiem, Calada con una sola Requiem, curación/dash/recarga, puñetazo con impacto, melee fallado, ejecución, lanzamiento, explosión, desarrollador inmortal, desarrollador con daño, arma inicial incorrecta, completado artificial y salto de ronda. Se comprobó además una ronda válida con Nicolás en Tryhard.

Las rondas de integración usan enemigos del director, disparos, daño y muertes del juego, con posiciones y pasos de reloj preparados. No constituyen una partida humana prolongada ni una validación de hardware. La duración de supervivencia se cubre mediante simulación y pruebas unitarias, sin afirmar haber esperado una ronda completa en tiempo real.

Se revisaron las capturas `requiem153-achievement.png` y `requiem153-toast.png`: nombre, cita, icono, rareza, marco dorado y notificación legibles. Los escenarios finales terminaron sin errores de JavaScript o carga de recursos. Se adaptaron los fixtures históricos que esperaban 36 activos y una posición fija de las notas 1.5.1; no se alteraron esos menús para satisfacer las pruebas.

Las regresiones históricas se ejecutaron contra un servidor local en 5180 mediante un adaptador de puerto para los scripts que fijaban 5176. La producción se probó en 5181 con la base real. No se ejecutaron todas las suites históricas del repositorio: solo las enumeradas aquí.

## Archivos de esta actualización

| Área | Archivos añadidos o modificados en 1.5.3 |
| --- | --- |
| Penetración | nuevo `src/weapons/RequiemPenetration.ts`, `src/scenes/Game.ts` |
| Seguimiento de ronda | nuevo `src/systems/RequiemRoundChallenge.ts`, `src/systems/RoundDirector.ts` |
| Detección de ofensivas | `src/weapons/WeaponCombat.ts`, `src/systems/SurvivalSystem.ts` |
| Logro y recursos | `src/systems/Achievements.ts`, `src/weapons/requiemAssets.ts`, `public/assets/weapons/requiem/PROVENANCE.md` |
| Versión y documentación | `package.json`, `package-lock.json`, `src/scenes/Menu.ts`, `src/config/releaseNotes.ts`, `README.md`, este informe |
| Pruebas | nuevo `tests/requiem153.test.ts`, nuevo `check-requiem153.cjs`, `tests/v15.test.ts`, `check-v15.cjs`, `check-mobile151-menus.cjs` |

Los archivos de la 1.5.2 que ya estaban modificados o sin seguimiento siguen presentes y se conservaron. El sprite PNG no cambió en 1.5.3. No hay nuevas dependencias.

## Límites y pendientes

No hay errores de compilación o pruebas pendientes. Vite conserva el aviso previo de paquete grande de Phaser: JS final aproximado de 1,71 MB, 420 KB comprimidos.

No se realizó una nueva prueba en Android físico ni con mandos USB/Bluetooth físicos; se usaron emulación táctil y mando simulado. Quedan para comprobación manual el rendimiento sostenido, comodidad y sensación de juego con hardware real.
