# Hotline Curicó 2.0.1 — Correcciones de integración

Trabajo local del 2 de noviembre de 2026. Sin commits, push ni despliegues. Se conservaron los cambios locales previos.

## Causas y soluciones

### Sala cooperativa

Se reprodujo el estado indicado por el usuario: **J1 LISTO · J2 ESPERANDO ×**. El navegador puede exponer el mando por primera vez cuando se pulsa un botón. `PadState.poll` suprime deliberadamente los flancos de pulsación del primer fotograma de conexión para evitar disparos accidentales. La sala dependía exclusivamente de ese flanco para confirmar J2. No era una excepción de sprites ni un fallo de la creación del mundo.

La sala ahora permite confirmar LISTO con × mantenida, conservando la protección global de conexión. Los diálogos siguen requiriendo una nueva pulsación: mantener × no salta la presentación. Se valida el identificador de J1 con el catálogo, se excluye de la lista del compañero y se conserva el diálogo según el orden. La navegación de selección usa la longitud real de las tarjetas y respeta izquierda/derecha.

Antes de corregirlo, la prueba de primera detección agotó su espera en `J2 ESPERANDO ×`. Después, completó las seis combinaciones desde el menú, sin saltar a una ronda avanzada ni avanzar manualmente el reloj de la ruleta.

### Progresión permanente

Jordan estaba excluido explícitamente del catálogo, migración, aplicación de estadísticas y pestañas de la tienda. Se incorpora al mismo guardado `hotline-permanent-v1`, saldo HC y precio **200 + 150 × nivel actual**. Cada personaje mantiene sus niveles independientes. Se conservan moneda, compras previas y reclamaciones diarias.

| Mejora de Jordan | Por nivel | Niveles máximos |
|---|---|---:|
| Vitalidad | +10 HP máximos | 10 |
| Pulso firme | +3% daño de armas de fuego | 8 |
| Segundo aliento | +0,5 puntos porcentuales de curación por ejecución | 5 |
| Pulso temporal | +0,1 s entre ejecuciones | 5 |
| Reflejos | −3% enfriamiento normal del dash | 6 |
| Juicio prolongado | +0,5 s de duración | 4 |
| Segunda elección | +1 cambio de cartas | 4 |

Las mejoras de habilidad se suman a las temporales, respetando los límites confirmados: curación 12%, ventana 3,5 s y duración total 16 s. Sin compras, la base continúa en 8%, 2,5 s y 12 s. Se mantienen diez acciones y el golpe de jefe de 20%/25%, munición real y ausencia de regeneración/resistencia gratuita. No se modifican las definitivas de los otros personajes.

La tienda de escritorio y la táctil muestran Jordan, su retrato y siete opciones. Se reutilizan sus gráficos existentes; no se generan recursos nuevos.

### Logros

La visita a Copec solo emite el evento para Cervela, y el servicio de logros también comprueba su identidad. Se conserva `copec-memory` y sus fechas legítimas.

Se retira `jordan-copec` y se crea `jordan-known`: **Un viejo conocido**, común y secreto. Se concede al finalizar naturalmente una partida cooperativa de Jordan + Cervela, en cualquier orden, con al menos una ronda realmente completada según `RunEconomy.completedRounds`. No se concede al iniciar, abandonar, jugar otra pareja o caer sin completar ninguna ronda. No otorga HC y queda fuera del 100% general.

La migración no convierte el antiguo desbloqueo de Copec de Jordan en el nuevo logro. Icono provisional: **23**, el apretón de manos del logro cooperativo existente. Cantidad de logros de Jordan conservada; Boss Rush sigue reservado.

## Archivos de esta corrección

- `src/v19/CoopLobby.ts`: confirmación del mando recién detectado y validación de J1.
- `src/input/InputHub.ts`: navegación de selección por longitud del catálogo.
- `src/config/permanent.ts`, `src/config/progression.ts`: catálogo y estadísticas permanentes de Jordan.
- `src/systems/PermanentProgress.ts`: migración, compras independientes y aplicación de bonificaciones.
- `src/v20/Judgment.ts`: lectura de bonificaciones permanentes bajo los límites existentes.
- `src/scenes/Upgrades.ts`, `src/mobile/MobileMenus.ts`: pestaña, retrato, iconos y compras de Jordan.
- `src/v19/Goals19.ts`, `src/systems/Achievements.ts`: exclusividad de Copec y sustitución del logro.
- `src/v19/CoopSession.ts`, `src/scenes/Game.ts`: comprobación al terminar la partida cooperativa.
- `src/config/releaseNotes.ts`, `package.json`, `package-lock.json`: versión 2.0.1 e historial conservado.
- `tests/integration201.test.ts`, `tests/atmosphere173.test.ts`: seis pruebas nuevas y actualización de la expectativa de versión.
- `check-integration201.cjs`, `check-shop201.cjs`, `check-production201.cjs`: verificaciones de navegador reproducibles.

## Resultados

- TypeScript (`tsc --noEmit`): correcto.
- Suite (`tsx --test tests/*.test.ts`): **211/211**, sin fallos.
- `npm run build`: correcto. Vite mantiene el aviso de paquete mayor de 500 kB; no impide compilar.
- `git diff --check`: correcto.
- `check-integration201.cjs`: menú → selección → sala → diálogo → ambas ruletas de ronda 1 → combate, seis órdenes; primera detección con × mantenida sin saltar diálogo; ambas armas, reloj activo, física reanudada, cero excepciones.
- `check-shop201.cjs`: compra real mediante interfaces de escritorio y táctil, persistencia al recargar, saldo y compras heredadas intactas. Comprobación del evento real de final de partida con contador de rondas controlado: ambas órdenes Jordan/Cervela aceptadas; otra pareja y cero rondas rechazadas; sin HC adicional.
- `check-jordan20-combat.cjs`: movimiento y controles independientes, compañero dispara y consume munición durante Juicio, daño diferido aplicado una vez, diez ejecuciones y curación, agonía/reanimación de Jordan con 20 HP, dieciséis armas y cinco arrojadizos.
- `check-coop191.cjs`: HUD por personaje, cámara del superviviente/restauración suave, marcadores, salud crítica, muerte permanente y pantallas de derrota/reintento/menú.
- `check-coop19.cjs`: Cervela/Nicolás con movimiento, disparo, munición, botiquines y arrojadizos independientes; dos definitivas simultáneas; agonía de 120 segundos suspendida en pausa, reanimación con 20 HP; cartas separadas, reintento y ruletas, sin errores JavaScript.
- `check-jordan20-flows.cjs`: seis diálogos ordenados, respuestas a los cinco jefes y derrotas de Jordan con ambas parejas y órdenes, sin errores JavaScript.
- `check-production201.cjs`: producción local en `/hotline-curico/`, versión y notas, historial anterior, selección e inicio individual de Jordan en móvil emulado, 25 PNG de Jordan idénticos a los originales de `public`, sin errores HTTP/JavaScript ni cooperativo móvil.
- Capturas revisadas: `shop201-desktop.png` y `shop201-mobile.png`.

## Alcance de las pruebas

Se usó Edge automatizado con la API de mando simulada, incluida la aparición tardía del dispositivo. **No se probaron mandos físicos USB/Bluetooth ni dos mandos reales.** La reproducción demuestra el fallo de primera detección, pero no certifica todos los controladores del sistema del usuario. Android se emuló; no se probó en un teléfono real.

No se realizaron pruebas manuales de partidas completas en hardware real. Las verificaciones de logro al finalizar usan final de partida real y un contador de rondas controlado. El modo desarrollador continúa sin guardar logros ni progreso de pruebas.
