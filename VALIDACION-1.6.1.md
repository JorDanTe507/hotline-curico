# Hotline Curicó 1.6.1 — Correcciones y adrenalina

Actualización local sobre 1.6, conservando los cambios locales anteriores de 1.5.2/1.5.3. No se ejecutó commit, push ni despliegue. El HEAD continúa en `9b324b5e8741c86527762a1eef7e4a06673df491`; el remoto no fue modificado. No se borraron monedas, mejoras, fechas de logros ni datos del usuario. Las pruebas de almacenamiento usan contextos de navegador separados.

## Selector desarrollador

Se conserva la contraseña exacta `PROJECT507` y el aislamiento del saldo de pruebas. El panel presenta diez rondas por página, número de página y botones ANTERIOR/SIGUIENTE. No se impone un máximo en 30: después de 21–30 aparecen 31–40 y así sucesivamente, de acuerdo con las rondas continuas existentes. La presentación táctil utiliza la misma página y las acciones de la escena.

Mapa real conservado: ronda 5 Torturado, 10 Comandante, 15 Demoledor, 20 Verdugo, 25 Carnicero; ciclo posterior existente. Elegir una ronda usa el inicio habitual de Game/RoundDirector, incluyendo introducción, inicialización del jefe y limpieza de escena. No existe una IA simplificada para el desarrollador ni se conceden logros en ese modo.

Prueba de navegación con ratón/contraseña real: 1–10 → 11–20 → 21–30 → 31–40 → anterior. Selección real de 15, 20 y 25: jefe correcto, un solo ejemplar, sin proyectiles heredados ni notificaciones de logro. En emulación móvil se recorrieron páginas y se inició la ronda 20.

## Diagnóstico y corrección de opacidad

- El atlas original de los cuatro jefes nuevos es completamente opaco. El recorte anterior borraba cualquier color oscuro conectado al borde, incluyendo negro del contorno y uniforme del Comandante. El criterio nuevo distingue el fondo oscuro azulado del negro del personaje; los cuerpos, ropa y contornos se conservan. No se rellenó el rectángulo del fondo.
- El atlas de enemigos tiene interiores con alfa cercano a 251–253. Se normalizan a 255 los píxeles de cuerpo con alfa ≥128; se mantienen fondo 0 y bordes/efectos suaves por debajo de ese umbral.
- Los 14 fotogramas PNG preparados de El Torturado no tenían píxeles alfa 255: contenían 83.256 píxeles parcialmente transparentes y 207.048 transparentes. La preparación de Phaser aplica la misma normalización al cuerpo antes de crear las animaciones. Conserva dimensiones, RGB, claves y parámetros de combate.
- Inspección de archivos de Cervela: nueve fotogramas, alfa exclusivamente 0/255. Nicolás: 40 fotogramas normales/heridos, alfa exclusivamente 0/255. No se alteraron innecesariamente sus imágenes.
- El destello de daño conserva su breve reducción de alfa y restauración. Se cancelan tweens de daño anteriores antes de iniciar otro; los nuevos jefes recuperan alfa 1 cuando no hay un tween activo. Sombras, estelas, siluetas de selección, humo y efectos intencionales no se vuelven sólidos.

La prueba de navegador revisa fondos transparentes y cuerpo opaco en poses idle, caminar, disparo, daño y muerte de los cinco jefes, negro del Comandante conservado y retorno de alfa a 1 tras recibir daño. Se inspeccionaron capturas del Comandante y del menú. La revisión no equivale a una inspección visual manual de cada fotograma del juego.

## HC y caja misteriosa

El HUD de PC muestra **HC: cantidad** bajo el dash, leyendo `permanentProgress().data.currency`, la misma fuente de compras/guardado. Se actualiza cada frame normal y al refrescar el HUD. Android conserva el saldo existente en su HUD. El saldo temporal de desarrollador sigue separado.

La caja misteriosa cuesta ahora **500 HC**, configurados en `FORTUNE.mysteryCost`. La indicación de precio y fondos insuficientes lee esa misma constante. Se conserva el bloqueo de compras simultáneas, descuento único, recompensa única, reembolso si la ruleta no puede empezar y prohibición de avanzar durante la animación. Se verificó: 499 HC no compra; 1.000 → 500, incluso invocando de nuevo la interacción. El HUD refleja HC: 500.

No cambiaron rarezas, pesos de la ruleta, probabilidad legendaria de Requiem, cajas fuertes ni otras compras. La ruleta inicial gratuita sigue presente.

## Experiencia: hallazgo y ajuste exacto

La inspección encontró que el proyecto local solo concedía experiencia mediante `Progression.defeated`; **no había una fuente de XP por impactos**. Por ello no se puede afirmar que existiera una partida anterior con esa XP ni que la experiencia total aumente exactamente un 20%.

Se añadió una fuente configurable con `HIT_XP_BASE=2` y `HIT_XP_MULTIPLIER=1.20`: **2,4 XP por impacto válido**, acumulando fracciones sin perder el 20% por redondeo. Comparación controlada: cinco créditos válidos, base 10 XP frente a ajustado 12; 25 créditos, base 50 frente a ajustado 60. Las bajas siguen usando XP_BY_TIER/BOSS_XP y la curva xpRequired no cambia.

Reglas: daño positivo realmente aceptado por Game; ataque de disparo del jugador; una recompensa por combinación crédito/objetivo. Los perdigones compartidos, reprocesamiento y quemadura con el mismo crédito no repiten XP. Las explosiones secundarias de perks y melee no reciben esta fuente. Un disparo fallido no concede XP. Los objetivos de Requiem atravesados son distintos y cuentan una sola vez cada uno; se conserva su límite de cuatro y la reducción de daño. Los estados de jefe invulnerable por introducción/UI se rechazan antes de otorgar XP.

Se probó la apertura de la selección normal de perks al alcanzar el umbral por un impacto, elección con tecla 1 y reanudación. No se modificó la agresividad, daño, cantidad de enemigos o comportamiento de jefes. Queda pendiente una comparación humana de partidas completas; estas muestras no validan por sí mismas la velocidad total de progresión.

## Adrenalina

- Inventario por partida **0/1**, recogida mediante el sistema existente, sin cargar ni activar nada al recoger.
- Inventario lleno: la jeringa permanece en el suelo, disponible para después. Se conserva al cambiar de ronda y se reinicia a cero al reintentar/iniciar una partida; no se almacena como mejora permanente. Los drops dormidos aceptan su tipo en la persistencia de chunks.
- Uso permitido solo vivo, con una unidad, en estado jugable y sin definitiva llena, activa o pendiente de activación. Rellena `ultimate.charge` hasta `requiredHits`, consume una unidad y **no activa** la habilidad, prolonga duración ni concede invulnerabilidad.
- Si ya está cargada muestra **DEFINITIVA YA CARGADA** sin consumir. Si está activa/en transición tampoco consume. Respeta pausa, introducción de jefe, ruleta, cartas, ejecución y cinemática.
- Funciona con las implementaciones existentes de Última Calada y Modo Tryhard, incluidas las modificaciones de impactos requeridos.
- PC: **H**. G conserva lanzamiento de armas. Mando estándar: **R3**, índice estándar 11, independiente de curación/disparo/dash/ulti. Mandos no estándar utilizan la calibración existente; puede ser necesario incorporar esta nueva acción a su mapeo. Android: botón de jeringa **ADR 0/1**, con nombre accesible ADRENALINA; icono real de 32×32 y área táctil ≥44 px. En PC el HUD muestra ADRENALINA 0/1 [H/R3].

### Recompensas reales

Se conservan HC 20% y vacío 5%. El 75% restante se considera consumible y se distribuye 60/30/10:

| Recompensa de caja pequeña | Probabilidad total |
|---|---:|
| Munición | 45% |
| Botiquín | 22,5% |
| Adrenalina | 7,5% |
| HC | 20% |
| Nada | 5% |

No se cambia la tabla de cajas fuertes/misteriosas. La jeringa no se aplica al loot normal de enemigos ni se garantiza por caja. Se verificó una recompensa real de adrenalina usando una tirada controlada, recogida, rechazo por inventario lleno, uso H/R3/toque, protección contra consumo inválido, conservación entre rondas y reinicio sin duplicados.

## Nueva pantalla principal

El fondo inicial es la nueva ilustración de ambos protagonistas aportada por el usuario, copiada íntegra a `public/assets/v161/menu.png`. Escalado proporcional para mostrar toda la composición, con bandas cuando corresponda. Logo textual anterior conservado; botones/navegación/música siguen funcionando. Los botones están abajo, con oscurecimiento localizado que deja visibles los rostros. En móvil se mantiene la composición en el canvas y un menú táctil inferior transparente.

El video anterior ya no se coloca encima de la ilustración en la escena Menu; sus archivos/clase se conservaron, pero esta versión usa el fondo estático solicitado. No se redibujó la escena ni se añadieron animaciones costosas. Se probaron 1920×1080, 1600×900, 1366×768 y 800×600; móvil 915×412, 844×390 y 800×360. Los dos rostros permanecen visibles.

La jeringa original tenía el cuadriculado incrustado. Se preparó un recorte RGBA mediante la herramienta integrada ImageGen y se comprobó alfa real; ruta y prompt en `public/assets/v161/PROVENANCE.md`. No se sustituyó por un objeto genérico.

## Pruebas y compilación

- TypeScript comprobado después de cada etapa importante.
- Conjunto unitario: **150/150 correctas**, cero omitidas; seis pruebas nuevas de mantenimiento y tabla de suministros anterior actualizada al cambio intencional.
- `npm run build`: TypeScript y Vite correctos. Se mantiene la advertencia no bloqueante de bundle superior a 500 kB; no se añadió ninguna dependencia.
- Producción: los **326 archivos de `public`** están presentes y coinciden byte a byte en `dist`, incluidos los dos recursos nuevos y sus procedencias. `git diff --check` no detectó errores de espacios; Git solo avisa de la conversión LF/CRLF ya configurada.
- Diez suites de navegador local Edge/Playwright:

| Suite | Comprobaciones |
|---|---|
| `check-maintenance161.cjs` | Menú/resoluciones, contraseña y paginación, jefes 15/20/25, opacidad, XP exacta/no duplicada, cartas, saldo/pago 500, drop e inventario de adrenalina, H y R3, ambos protagonistas, rechazo durante definitiva y reinicio. |
| `check-maintenance161-mobile.cjs` | Menú nuevo y páginas mediante toque, jefe20, adrenalina por toques reales emulados con ambos protagonistas, inventario lleno y liberación sin acciones atascadas, icono 32 y botón ≥44 en tres resoluciones. |
| `check-fortune16.cjs` | Cinco jefes/ataques/vida/progresión, daño y evasión Carnicero, cajas/disparos/melee, fuertes vulnerables y persistentes, ruleta inicial/pago/no transición prematura, navegación/permisos, limpieza de escena y chunks. Fixture de precio actualizado. |
| `check-arsenal.cjs` | Dieciséis armas jugador/enemigos, munición, recarga, lanzamiento, fuego/explosiones, paredes, recogida exclusiva, persistencia y reintento. |
| `check-requiem153.cjs` | Penetración 1/4/5, paredes/jefe/rango/armas duales, exclusividad de ronda, Tryhard, notificación/guardado/fecha del logro. |
| `check-v13.cjs` | Mando estándar simulado, conexión/desconexión, sticks y acciones, ambas definitivas, menús y preferencias. |
| `check-mobile151-menus.cjs` | Menús táctiles, acciones, tres punteros, cartas, HUD, derrota/reintento y ambas definitivas. |
| `check-v15.cjs` | Logros y monedas persistentes, mejoras, ciudad/Tío, millón temporal y aislamiento del desarrollador con y sin inmortalidad. |
| `check-balance152.cjs` | Daño común ×0,55 una vez, defensas, Requiem, tres botiquines y generación/daño letal de rondas 1–5 con ambos protagonistas. |
| `check-mobile151-production.cjs` | Producción bajo `/hotline-curico/`, recursos, arranque/selección/intro/ruleta/HUD y pausa móvil sin globals de depuración. |

Se actualizaron las coordenadas/expectativas de menú de fixtures antiguos; arsenal y desafío Requiem aíslan la XP durante sus escenarios para que las cartas no interrumpan las pruebas de armas. La XP y las cartas se prueban explícitamente en las suites nuevas. Los fallos iniciales de esos fixtures fueron corregidos y repetidos. No se alteró el juego para saltarse sus resultados.

## Archivos de 1.6.1

Nuevos: `src/systems/Adrenaline.ts`, `src/items/adrenalineAssets.ts`, `src/characters/opacity.ts`, `public/assets/v161/{adrenaline.png,menu.png,PROVENANCE.md}`, `tests/maintenance161.test.ts`, `check-maintenance161.cjs`, `check-maintenance161-mobile.cjs` y este informe.

Modificados: `src/scenes/{Restricted,Game,Menu}.ts`; `src/systems/{run,Progression}.ts`; `src/config/{fortune,progression,releaseNotes}.ts`; `src/input/{PadState,PadControls}.ts`; `src/ui/CombatHud.ts`; `src/mobile/{MobileUI,MobileMenus}.ts`, `src/mobile/mobile.css`; `src/world/{fortuneAssets,ChunkLootStore}.ts`; `src/enemies/expansionAssets.ts`; `src/bosses/{NewBosses,torturadoAssets}.ts`; `src/main.ts`; `package.json`, `package-lock.json`, `README.md`; fixtures `tests/fortune16.test.ts`, `check-fortune16.cjs`, `check-arsenal.cjs`, `check-requiem153.cjs`, `check-v15.cjs`.

El estado Git también incluye cambios anteriores de 1.5.2/1.5.3/1.6 sin commit; no se atribuyen todos a esta actualización.

## Límites pendientes

No se probó un teléfono Android físico ni un mando físico por USB/Bluetooth. Se comprobaron emulación táctil y Gamepad API simulada; falta confirmar tacto, conexión, rendimiento y audio en hardware real. No se jugó manualmente una campaña completa ni se compararon dos partidas humanas: se hicieron escenarios automatizados/controlados. La progresión por impactos requiere ese ajuste práctico porque no existía una base anterior implementada. Los parámetros de jefes provisionales de 1.6 no se reequilibraron.

No quedan errores de TypeScript ni de las comprobaciones automatizadas informadas. **No se publicó nada.** Se espera una instrucción expresa antes de hacer commits o publicar.
