# 1.5.2 — Requiem & Balance

Actualización exclusivamente local, realizada el 31 de octubre de 2026 sobre la 1.5.1. No se creó ningún commit ni se hizo push o despliegue de la 1.5.2. HEAD sigue en `9b324b5`, correspondiente al informe de publicación anterior; los cambios permanecen en el directorio de trabajo.

## Arma reemplazada y valores

Se identificaron el Revólver básico (ID 1) y el Revólver Magnum (ID 9). Se reemplazó **el Magnum, ID 9**, por Requiem: su perfil previo era el más apropiado para un revólver pesado, y así se conserva el revólver básico con sus valores originales (35 de daño, 6/36 balas, 520 ms, recarga de 1500 ms).

| Requiem, ID 9 | Valor base |
| --- | --- |
| Rareza | LEGENDARIA |
| Daño del protagonista | 90 por proyectil |
| Cargador / reserva inicial | 6 / 12 |
| Intervalo de disparo | 1000 ms |
| Intervalo mínimo con mejoras | 800 ms |
| Recarga | 2400 ms |
| Alcance / dispersión | 850 / 0,018 radianes |
| Retroceso visual | Rotación inicial de 0,20 rad que decae en 170 ms; sacudida de cámara de 110 ms, intensidad 0,004 |
| Probabilidad de ganar la ruleta | 1% |

Los modificadores existentes de daño, cargador, cadencia, reserva y definitivas continúan aplicándose. Se mantiene la identidad del arma al recoger, sustituir, lanzar, aterrizar y volver a recoger; no se rellena la munición en esas transferencias.

Para mantener la suma de pesos de ruleta en 100, Requiem pasa de peso 7 a 1 y la pistola común de 18 a 24. Los demás pesos no cambian. En las selecciones ordinarias de arma (que excluyen RPG y minigun), Requiem usa peso 1 de un total de 98: aproximadamente 1,02% de esas selecciones de arma. Esto no significa 1% de todos los enemigos eliminados. No se altera el 1% de RPG/minigun del botín normal ni el 10% especial de RPG del jefe.

El Matón con lentes empezaba con ID 9. Ahora empieza con el revólver básico ID 1 para evitar una Requiem garantizada cada vez que muere. Su daño de IA de referencia (15), cadencia y demás estadísticas permanecen iguales antes del nuevo multiplicador común. Ningún enemigo empieza equipado con Requiem; puede recogerla del suelo siguiendo las reglas existentes.

## Referencia gráfica

Se comprobó que existe `D:/Descargas/Hoja de sprites del revólver Requiem.png`. Se usó como referencia con la herramienta integrada image_gen para obtener una silueta transparente sin manos, títulos ni estadísticas.

- Recurso guardado: `public/assets/weapons/requiem/source.png`.
- Modo y prompt completo: `public/assets/weapons/requiem/PROVENANCE.md`.
- `src/weapons/requiemAssets.ts` normaliza la silueta proporcionalmente a 32×32 con nearest-neighbor y alpha, generando las claves de equipamiento, suelo, HUD y disparo. La prueba de navegador comprueba tamaño, píxeles visibles y esquinas transparentes.
- Las imágenes antiguas del Magnum permanecen como recursos históricos, pero el cargador ya no las utiliza para ID 9. No se reemplazaron sprites de los protagonistas.

## Recogida de enemigos

`enemyPickupPermission` realiza una sola tirada al generar cada matón básico de tier 0. Con valores aleatorios menores que 0,10, `canPickupWeapons` queda en falso durante toda la vida de ese enemigo, incluidos sus cambios de posición. No se decide de nuevo al buscar armas ni por fotograma.

La IA comprueba esa propiedad antes de buscar o reclamar objetos. Un enemigo bloqueado no reserva un arma ni impide que otro la recoja. El resto de los básicos conserva el comportamiento anterior. Otros tiers mantienen su permiso configurado; los jefes siguen con su IA propia.

La frecuencia es probabilística: no se garantiza exactamente uno de cada diez dentro de una ronda concreta.

## Separación del daño

`COMMON_FIREARM_DAMAGE_MULTIPLIER = 0.55`, centralizado en `src/config/enemyBalance.ts`.

El daño base de las otras quince armas del protagonista no cambia. WeaponCombat conserva el cálculo previo de daño de cada enemigo según su arma inicial y la que utiliza; después aplica el factor común una sola vez al crear el ataque enemigo.

El factor afecta armas de fuego no explosivas de matones con comportamiento `normal`, excluyendo explícitamente al de élite (tier 4). En la configuración actual esto incluye los tiers 0, 1, 2, 5, 6 y 10 cuando disparan. Ejemplos de daño fuente:

| Ataque | Antes | Ahora |
| --- | --- | --- |
| Pistola de matón básico que la recoge | 15 | 8,25 |
| Matón con pistola | 12 | 6,6 |
| Matón con subfusil | 15 | 8,25 |
| Matón con escopeta, por perdigón | 14 | 7,7 |
| Matón con rifle | 16 | 8,8 |
| Matón con lentes, con su arma inicial | 15 | 8,25 |

Se conserva la ventana de gracia existente; el daño total recibido depende también de impactos, dispersión y esa ventana. No se suman todos los perdigones como si cada uno ignorara la protección temporal.

No se aplica automáticamente a jefes, élites, blindados, atletas, tanques, médicos, francotiradores, perros, incendiarios, melee, RPG ni granadas. Explosiones y quemaduras conservan sus reglas. El daño fuente llega después a `receiveDamage`, que aplica Calada, placas, resistencia de chaleco y sobrante a salud mediante el sistema anterior, sin volver a multiplicar por 0,55.

El Torturado conserva 450 HP en ronda 5, daño de 20 por perdigón, cinco perdigones normales, ocho especiales, carga, ataque cuerpo a cuerpo y recarga. Su archivo y configuración no se modificaron.

## Botiquines y datos

`MEDKIT_CAPACITY` cambia de 2 a 3. Inventario y recogida usan esa constante; HUD de escritorio, HUD táctil y botón táctil muestran el nuevo límite. Se empieza con un botiquín, como antes. Recoger un cuarto se rechaza. La curación base sigue siendo 40 HP, con los modificadores existentes, sin reparar chaleco.

No se cambian claves, esquemas ni valores guardados de monedas, mejoras, logros o preferencias. Los botiquines pertenecen a la partida, no al guardado permanente; cantidades anteriores 0/1/2 siguen siendo válidas y pueden completarse hasta tres. La regresión de economía y logros comprobó persistencia al volver al menú y recargar, además del aislamiento del modo de pruebas.

## Pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| TypeScript / `npm run build` | Aprobado; 97 módulos |
| `tsx --test tests/*.test.ts` | 122/122 aprobadas; ninguna omitida |
| `check-balance152.cjs` | Aprobado: recurso real de Requiem, HUD, daño, retroceso, recarga finita, lanzamiento y recuperación, bandera de recogida, IA sin reclamaciones bloqueadas, daño por fuente, chaleco, Calada, tope de botiquines y ataque real del jefe |
| `check-arsenal.cjs` | Aprobado: las 16 armas, disparos del jugador y enemigos, munición, transferencias, suelo, quemaduras/explosiones, armas dobles y limpieza al reintentar |
| `check-v13.cjs` | Aprobado: mando estándar simulado, conexión/desconexión, sticks, botones, teclado, menús y ambas definitivas |
| `check-v15.cjs` | Aprobado: logros, economía, compras, persistencia, Tío Aceite y modo de pruebas |
| `check-mobile151-menus.cjs` | Aprobado: acciones y menús táctiles, tres punteros simultáneos, derrota/reintento y ambas definitivas |
| `check-mobile151-production.cjs` | Aprobado: producción local bajo `/hotline-curico/`, recursos, selección, introducción, ruleta, HUD y pausa sin global de depuración |
| Recursos de producción | Los 320 archivos de `public` son idénticos en `dist`, incluido Requiem |

Las suites de regresión se ejecutaron contra un servidor temporal local en 5180 con base `/`, usando un adaptador local de puerto para los scripts históricos que fijaban 5176. La producción se comprobó en 5181 con la base real `/hotline-curico/`. No se contactó el sitio publicado para sustituirlo o probar la 1.5.2 allí.

Se ajustaron dos fixtures: los escenarios de recogida del arsenal habilitan expresamente a sus enemigos de prueba; la prueba táctil de scroll usa la entrada histórica larga 1.5.1 porque las notas nuevas 1.5.2 caben en pantalla. El primer intento de esa prueba falló por asumir que cualquier entrada debía desbordar; la repetición con el fixture correcto pasó, sin cambios a los menús del juego.

La muestra automatizada inició rondas 1–5 con ambos protagonistas: exterminio con 15/20 enemigos en rondas 1/3, supervivencia con 2/3 enemigos iniciales en 2/4 y El Torturado en 5. Modo desarrollador e inmortalidad desactivados. Se verificó daño real, daño letal y el disparo del jefe. Se aceleraron relojes y prepararon posiciones: **no constituye una partida humana completa ni demuestra por sí sola el equilibrio subjetivo o la tasa de supervivencia de un jugador**.

Móvil: emulación Android de navegador, resoluciones 915×412, 844×390 y 800×360. **No se probó en un teléfono físico.** El mando también fue simulado; no se afirma una nueva prueba de hardware USB/Bluetooth.

La compilación conserva el aviso previo de tamaño del paquete de Phaser (JS aproximado de 1,71 MB, 418 KB comprimido), sin errores. Un intento de lanzar el script mediante pnpm dentro del aislamiento falló por permisos de enlaces; se completó correctamente mediante `npm run build`. No hay errores de compilación pendientes.

## Archivos modificados o añadidos

| Grupo | Archivos |
| --- | --- |
| Armas y recursos | `src/weapons/arsenal.ts`, `src/weapons/WeaponCombat.ts`, nuevo `src/weapons/requiemAssets.ts`, `public/assets/weapons/requiem/source.png`, `public/assets/weapons/requiem/PROVENANCE.md`, `src/main.ts` |
| Balance y enemigos | nuevo `src/config/enemyBalance.ts`, `src/config/roulette.ts`, `src/config/instinct.ts`, `src/enemies/config.ts`, `src/scenes/Game.ts`, `src/systems/SurvivalSystem.ts` |
| Interfaz y versión | `src/ui/CombatHud.ts`, `src/ui/WeaponRoulette.ts`, `src/mobile/MobileUI.ts`, `src/scenes/Menu.ts`, `src/config/releaseNotes.ts`, `package.json`, `package-lock.json` |
| Pruebas | nuevo `tests/balance152.test.ts`, nuevo `check-balance152.cjs`, `tests/instinct.test.ts`, `tests/roulette.test.ts`, `check-arsenal.cjs`, `check-mobile151-menus.cjs` |
| Documentación | `README.md`, este `VALIDACION-1.5.2.md` |

No se modificaron controles compartidos, lógica de las definitivas, algoritmos del mundo, configuración del jefe, música, video del menú ni workflow de publicación.
