# Hotline Curicó 2.0.2 — segunda etapa

Validación local: 4 de noviembre de 2026. Se conserva el commit de primera etapa `2dde84a314b7623b4b3a95fca2ed787de029ff49`, las novedades anteriores y la versión 2.0.2.

## Implementación

- Fachadas: reutilización de las ocho fachadas urbanas y la de Copec. Capas proporcionales, máscara sobre el acceso existente, transparencia gradual hasta 13%, histéresis y restauración cuando ninguno de los jugadores necesita ver detrás. Gestión independiente por edificio y descarga con los sectores; no modifica celdas ni colisiones. Los apagones modifican el tinte sin reemplazar la transparencia.
- Radar: un canvas ligero compartido, sin segunda cámara, actualización hasta 10 Hz, alcance base de 900 px, verde oscuro, flecha roja individual, colores existentes en cooperativo, enemigos amarillos y jefes magenta. Los caídos tienen cruz y conservan la flecha exterior existente. Entre 1 y 4 enemigos realmente pendientes y tras 15 s sin bajas aparecen direcciones lejanas; Supervivencia no activa esa búsqueda.
- Preferencias: Mostrar minimapa y Mostrar ayudas del HUD, independientes y activadas por defecto, persistidas en `hotline-ui-v1`. No se borran monedas, mejoras, logros ni desafíos. Ocultar ayudas conserva salud, escudo, munición, consumibles, definitivas, agonía y confirmaciones de pago.
- Navegación: `canReach` verifica una ruta real, invalida caché al cambiar obstáculos y permite avanzar por tramos reales en persecuciones largas. Se elimina el reciclado que teletransportaba enemigos comunes lejanos. No se eliminan enemigos para resolver atascos. Se conserva la retirada intencional anterior del radiooperador tras llamar y huir fuera de pantalla.
- Reanimación: automática por proximidad y línea de visión; conserva 85 px, 3,5 s, 20 HP y 120 s de agonía. Alejarse o interponer una pared reinicia el progreso. Funciona en ambos puestos de las tres parejas, sin autorreanimación.
- Cajas fuertes: progreso automático de 6 s por proximidad, se reinicia al alejarse o descargarse el sector. Dos jugadores no duplican avance ni recompensa. Suministros de radio: apertura gratuita automática tras 2 s cerca, una vez que llega el suministro; recoger la radio sigue requiriendo interacción.
- Caja misteriosa: conserva 500 HC, precio visible y segunda interacción explícita de confirmación por el mismo jugador. Alejarse, pausar, terminar descanso o caducar cancela la confirmación. Una compra entrega una sola arma al suelo junto al propietario, conservando el sistema de recogida y equipamiento.

## Probabilidades exclusivas de la caja misteriosa

El revólver de rareza poco común participa en la categoría común de esta caja. No cambia su rareza en el catálogo ni los pesos de otros botines. Las categorías vacías se excluyen y renormalizan.

| Categoría | Configurado | Sorteos (200.000, semilla 20260202) | Observado |
|---|---:|---:|---:|
| Común | 5% | 10.031 | 5,0155% |
| Rara | 35% | 69.901 | 34,9505% |
| Épica | 45% | 89.963 | 44,9815% |
| Legendaria | 15% | 30.105 | 15,0525% |

| Armas | Probabilidad individual |
|---|---:|
| Pistola, Revólver, Subfusil, Mini Uzi, Bate, Palanca | 0,833333% cada una |
| Escopeta, Rifle de asalto, Escopeta recortada, Hacha | 8,75% cada una |
| Rifle de precisión, M79, Lanzallamas | 15% cada una |
| RPG | 6,3% |
| Minigun | 1,2% (2.443/200.000 = 1,2215% observado) |
| Requiem | 7,5% |

La prueba automatizada usa además 200.000 sorteos deterministas con semilla 507. No gasta HC. La compra de navegador sí verifica descuento exacto de 500 HC y una sola recompensa, con bloqueo de confirmación por el otro jugador. Las mejoras permanentes mantienen 200 HC iniciales y su progresión.

## Comprobaciones realizadas

- TypeScript sin errores; 222/222 pruebas Node aprobadas, incluidas 9 pruebas nuevas de preferencias, radar, fachadas, probabilidades, cajas y rutas.
- `check-tactical202.cjs`: radar individual/compartido, alcance, búsqueda real, jefes lejanos, cuatro combinaciones de preferencias, fachadas individuales y dos edificios con ambos jugadores vivos, seis reanimaciones sin botón y bloqueadas por pared, una caja gratuita y una compra por pareja, limpieza al reiniciar, sin errores JS.
- `check-navigation202.cjs`: persecución con física real alrededor de una pared de doce tiles y enemigo a más de 3.500 px que avanza sin teletransporte ni eliminación.
- `check-radar-mobile202.cjs`: 844×390, 740×360 y 640×360; radar dentro de pantalla, separado del botón de adrenalina, controles táctiles conservados, preferencias restauradas tras recargar.
- `check-dev-mobile202.cjs`, `check-maintenance202.cjs`: herramientas Jordan, estadísticas base, radio programada/manual, cinco jefes y aislamiento del progreso.
- `check-jordan20-combat.cjs`: Juicio Final, compañero activo, daño temporal una sola vez, diez ejecuciones, muerte/reanimación, 16 armas y 5 arrojadizos.
- `check-shop201.cjs`: compra y migración del guardado en escritorio/táctil y créditos cooperativos.
- `check-integration201.cjs`: seis asignaciones reales de personajes desde los menús hasta la ronda 1, con mando estándar simulado, sin errores JS.
- `check-fortune16.cjs`: cajas, daño, botines, proximidad/cancelación, pago, cinco jefes y progresión, colisiones, streaming, botiquines y emulación táctil. Actualizadas sus expectativas para el nuevo progreso automático.
- `check-radio19.cjs`: llamada de 4 s, refuerzos únicos y suministro gratuito con botiquín/munición; sin cambio de frecuencia.
- Regresión de clima de `check-atmosphere173.cjs` ejecutada mediante copia local con expectativas de versión actualizadas: apagón global, recuperación, niebla móvil, lluvia, desbloqueo/volumen/limpieza de audio, 20 enemigos y efectos acotados; sin errores JS/HTTP.

## Recursos y límites

No hay una fachada completa compatible para la bodega industrial ni el apartamento inicial: conservan su estructura funcional actual. Para ampliarlos hacen falta capas completas con fondo transparente y acceso alineado a su planta. No se inventaron puertas ni imágenes.

Pruebas de navegador con Edge/Chromium automatizado; móvil y mando fueron emulados. No se comprobó un teléfono Android ni un DualShock físico. No se garantiza ausencia de atascos en todas las semillas posibles; se corrigieron y verificaron los casos reproducibles descritos.

La compilación conserva la advertencia de Vite por el tamaño del bundle; no es un error de compilación. Los guardados de localhost y GitHub Pages son independientes por origen.

## Archivos de esta etapa

- `check-fortune16.cjs`
- `check-navigation202.cjs`
- `check-production202.cjs`
- `check-radar-mobile202.cjs`
- `check-radio19.cjs`
- `check-tactical202.cjs`
- `src/chaos/ChaosSystem.ts`
- `src/characters/colors.ts`
- `src/config/releaseNotes.ts`
- `src/input/InputHub.ts`
- `src/mobile/MobileUI.ts`
- `src/mobile/mobile.css`
- `src/scenes/Game.ts`
- `src/scenes/Menu.ts`
- `src/systems/MysteryLottery.ts`
- `src/systems/Navigation.ts`
- `src/ui/CombatHud.ts`
- `src/ui/HudPreferences.ts`
- `src/ui/RadarModel.ts`
- `src/ui/TacticalRadar.ts`
- `src/ui/WeaponRoulette.ts`
- `src/v19/CoopHud.ts`
- `src/v19/CoopSession.ts`
- `src/v19/CoopSignals.ts`
- `src/v19/RadioSystem.ts`
- `src/world/DynamicFacades.ts`
- `src/world/FacadeVisibility.ts`
- `src/world/FortuneObjects.ts`
- `src/world/FortuneState.ts`
- `src/world/WorldRoutes.ts`
- `src/world/WorldStreamer.ts`
- `tests/fortune16.test.ts`
- `tests/tactical202.test.ts`

## Producción y publicación

Compilación de producción aprobada: 163 módulos; `dist/assets/index-BLAEP8Ov.js` y `index-CPrhWJZC.css`. `check-production202.cjs` aprobado bajo `/hotline-curico/`: novedades de ambas etapas e historial, radar visible, tres retratos, entrada y gameplay de Jordan, 25 PNG oficiales íntegros en dist, sin errores JS/HTTP y sin global de depuración en producción.

Origen y rama verificados: `https://github.com/JorDanTe507/hotline-curico.git`, `main`. Antes de publicar, remoto y local coinciden en `2dde84a`. Este informe acompaña el nuevo commit de la segunda etapa. Se utilizará push normal sin sobrescribir historial; el resultado real del workflow y la comprobación pública se comunicarán después del despliegue.
