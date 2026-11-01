# Hotline Curicó 1.6 — Sangre y Fortuna

Implementación exclusivamente local sobre los cambios existentes de 1.5.3. Sin commit, push ni publicación. Se conserva el remoto y el HEAD `9b324b5e8741c86527762a1eef7e4a06673df491`. Los informes 1.5.2 y 1.5.3 permanecen disponibles. No se borró almacenamiento del usuario ni se cambiaron las claves de progreso.

## Jefes

| Ronda | Jefe | HP inicial | Ataque integrado |
|---|---|---:|---|
| 5 | El Torturado | 450 | IA, escopeta, carga y parámetros anteriores conservados |
| 10 | El Comandante | 650 | Ráfaga de ocho proyectiles, puntería anunciada y enfriamiento |
| 15 | El Demoledor | 850 | Salva de tres granadas con explosión y señal de zona |
| 20 | El Verdugo | 1.000 | Láser de preparación, disparo a la posición fijada y recuperación |
| 25 | El Carnicero | 1.300 | Carga, golpe de área y giro cercano anunciados |

Los HP nuevos proceden de la lámina proporcionada. La inspección no encontró IA/configuraciones anteriores para esos cuatro encuentros: se añadieron en `src/bosses/NewBosses.ts` y `src/bosses/expansion.ts`, reutilizando navegación, proyectiles, explosiones, daño, introducción, botín y barra de jefe existentes. No se crearon nuevas entradas de armas del jugador. Los nombres y sprites exclusivos del jefe representan la minigun, lanzagranadas, precisión y melee correspondientes mediante esos sistemas.

Parámetros provisionales configurables, pendientes de ajuste mediante partidas humanas:

| Jefe nuevo | Velocidad | Daño base | Preparación | Recuperación | Cargador |
|---|---:|---:|---:|---:|---:|
| Comandante | 100 | 12/proyectil | 700 ms | 1.800 ms | 32 |
| Demoledor | 82 | 90/granada, caída por distancia existente | 900 ms | 2.300 ms | 1 salva |
| Verdugo | 105 | 85 | 1.100 ms | 1.700 ms | 5 |
| Carnicero | 70 | 55/golpe; giro ×0,65 | 900 ms | 1.900 ms | — |

Ráfaga: intervalo 90 ms. Carga: hasta 1.500 ms a velocidad ×4,5; alcance para iniciarla 550. Radios de golpe/giro: 110/140; giro 1.000 ms, pulsos cada 350 ms. Contacto de emergencia tras agotar reservas: 28 cada 1.100 ms. A partir del siguiente ciclo de 25 rondas: HP +25%, daño +12%, velocidad +4% por ciclo. El Torturado continúa utilizando su propia configuración anterior.

Cada encuentro tiene nombre, retrato, diálogos por protagonista, HUD y guardia contra duplicados. Las rondas de jefe requieren registrar su muerte y no tener enemigos vivos. Se ajustó el cuerpo físico al tamaño de los nuevos sprites sin alterar el del Torturado. Como la lámina no contiene secuencias dedicadas de muerte/daño/recarga, algunas poses son reutilizaciones provisionales; véase `public/assets/v16/PROVENANCE.md`.

## Cajas y ruleta

- Suministros: 30 HP, colisión física, disparos y melee existentes, destrucción breve y una sola recompensa: 45% munición, 30% botiquín, 20% HC, 5% nada. Recompensa HC provisional: 50 de la moneda actual. Botiquines llenos permanecen en el suelo; máximo tres.
- Cajas fuertes: interiores transitables, sin colisión bloqueante. Mantener interacción seis segundos; alejarse o soltar pausa el progreso. El jugador puede moverse, combatir y recibir daño. Se admiten E, clic mantenido sobre la caja, cruz de mando y botón táctil. Premio mediante la creación de armas existente, con cargador y reserva correspondientes.
- Rarezas de caja fuerte: 55 rara / 35 épica / 9 legendaria / 1 mítica. Actualmente no hay armas míticas: se normalizan las categorías disponibles a 55/99, 35/99 y 9/99; no se inventan armas para completar el pool.
- Caja misteriosa: recorte del cofre grande con interrogación dorada y estado abierto. Disponible durante el descanso por 1.500 HC; utiliza la misma ruleta ponderada existente, incluida Requiem al 1%. Fondos insuficientes no abren; la activación descuenta una sola vez. No se cambia de ronda mientras gira. Tras el premio quedan al menos cinco segundos para recogerlo.
- La ruleta gratuita inicial de ronda 1 permanece. Las rondas siguientes ya no disparan una ruleta automática. Descanso configurable de 30 segundos; punto SIGUIENTE RONDA para avanzar sin pagar. Hay un cofre disponible cerca al completar cada ronda y candidatos procedurales interiores/exteriores.
- Generación provisional por chunk: hasta dos tiradas de caja pequeña al 65%, una de caja fuerte al 28% y una misteriosa al 12%, sujetas a encontrar posición válida. No son probabilidades de recompensa ni garantizan esos objetos en cada sector. Se respetan puertas, props, vendedores, interiores y corredores. La pequeña exige un anillo libre de 3×3.
- Un registro por partida conserva vida, progreso, apertura y recompensa al descargar chunks. Solo las vistas/cuerpos cargados ocupan el escenario. Al terminar o reintentar se limpia el registro. No se introduce guardado permanente de cajas entre partidas.

## Enemigos, daño y logro

`enemyGroundWeaponAllowed` filtra tanto búsqueda como reclamación final. Los comunes solo aceptan categoría explícita `common`; categoría ausente/desconocida, poco común, rara, épica, legendaria y mítica se rechazan. El 10% de básicos sin permiso sigue determinado una sola vez al generarlos. Especiales/jefes y armas iniciales conservan sus reglas.

Los ocho primeros registros del catálogo no tenían metadatos de rareza. Se completaron explícitamente: pistola/subfusil comunes; revólver poco común; escopeta/rifle de asalto raros; precisión épica; RPG/minigun legendarios. No se cambió ninguna rareza que ya estuviera definida, daño base, cadencia ni entrada del catálogo para forzar el pool de cajas. Los comunes siguen excluyendo los pickups melee según la regla previa de IA.

El multiplicador común de armas de fuego sigue siendo **0,55 una sola vez**, antes de chaleco, resistencia y definitiva. No se aplica a jefes, explosiones, melee ni ataques especiales. Penetración Requiem: cuatro objetivos, 100/85/70/55%; ambos protagonistas y definitivas conservados.

Logro `requiem-round`: **Salud para los vivos, Requiem para los muertos**. Descripción: **Completa una ronda de combate utilizando exclusivamente la Requiem.** Se mantienen ID, icono, marco legendario, condiciones de 1.5.3, exclusión del modo desarrollador y estado/fecha guardados. Se amplió únicamente su notificación para el título largo. Los demás logros no cambian.

## Pruebas ejecutadas

1. `npm run build`: correcto, TypeScript y Vite sin errores. Advertencia de tamaño del bundle (~1,73 MB minificado); no impide compilar. Se mantiene `base: '/hotline-curico/'`.
2. `tsx --test tests/*.test.ts`: **144/144 correctas**, cero omitidas. Nueve pruebas nuevas de jefes, permisos, probabilidades, registro, moneda, generación/collision revision y logro conservado; regresiones anteriores incluidas.
3. Ocho suites de navegador Edge/Playwright correctas:

| Suite | Resultado comprobado |
|---|---|
| `check-fortune16.cjs` | Cinco jefes/HP/nombre/introducción/ataques, guardia de duplicados, espera hasta muerte y transición a descanso; golpe de Carnicero 55 y evasión por distancia. Colisión Arcade real proyectil-caja, melee, cuatro resultados de suministros, recompensa única y eliminación de sólido. Caja fuerte vulnerable, pausa/reanudación, E, ratón real, mando simulado y toque mantenido real emulado. Pago único, fondos insuficientes, premio y bloqueo de transición mientras gira; ruleta inicial y ausencia de ruleta automática posterior. Máximo tres botiquines, logro y cambio de escena sin errores. |
| `check-arsenal.cjs` | Dieciséis armas jugador/NPC, munición, recarga, melee, AoE, paredes, lanzamiento, reclamación exclusiva y persistencia. Fixture de reclamación actualizado a pistola común. |
| `check-requiem153.cjs` | Penetración 1/4/5 objetivos, muro/rango, jefe sin duplicar, disparos duales independientes; desafíos válidos/inválidos, Tryhard, notificación, icono, guardado y fechas previas sin duplicación. |
| `check-balance152.cjs` | Daño por fuente y defensas, Requiem finita, tres botiquines, Torturado 20 por perdigón, apariciones reales de rondas 1–5 con ambos protagonistas, daño 12 y daño letal sin inmortalidad. |
| `check-v13.cjs` | Mando estándar simulado: sticks, botones, definitivas de ambos, menús, desconexión en caliente y preferencias. |
| `check-mobile151-menus.cjs` | Toques en menús/acciones, tres punteros simultáneos, cards, derrota/reintento, ambos protagonistas y definitivas, HUD/botones en 915×412, 844×390 y 800×360. |
| `check-v15.cjs` | Logros, eventos, guardado tras menú/recarga, ocho familias urbanas, Tío exterior accesible y modo desarrollador aislado sin escrituras reales. |
| `check-mobile151-production.cjs` | Paquete final bajo `/hotline-curico/`: arranque móvil emulado, CSS, selección, intro, ruleta inicial, retrato HUD, pausa/reanudación; sin globals de depuración ni errores JS/HTTP. |

Las suites antiguas con puerto fijo 5176 se ejecutaron con un adaptador local ignorado que solo cambia la URL a 5180. Las pruebas emplean contextos de navegador aislados; no borran el guardado de la sesión normal del usuario.

Generación determinista en 289 chunks de prueba (seed 507): 374 cajas pequeñas, 75 fuertes y 25 misteriosas; estas últimas cinco interiores y veinte exteriores. Pruebas de mapa verifican conexión de pisos/puertas y continuidad existente. Recorrido adicional de 18 desplazamientos: nueve chunks cargados, máximo 19 vistas de cajas, 11 sólidos al final; registro de 123 objetos conservado sin crear sprites para sectores descargados. Salir de la escena deja el registro vacío. No es una medición de FPS en hardware móvil.

Inspección visual de capturas: sprites/HUD de jefes, cofre y título completo del logro en menú y notificación. Comparación de producción: los 322 archivos de `public` presentes en ese momento coincidían byte a byte con `dist`; ambos atlas nuevos incluidos. El archivo de procedencia añadido después es documentación, no un recurso necesario para jugar.

## Alcance y comprobaciones manuales pendientes

- No se dispuso de teléfono Android real ni mando físico USB/Bluetooth. La integración de sus acciones pasa en navegador/emulación; falta confirmar conexión, tacto, audio y rendimiento en esos dispositivos.
- La prueba 1–5 verifica apariciones, daño y mortalidad con ambos protagonistas, pero **no juega ni supera cinco rondas completas**. No se afirma una dificultad humana validada ni tiempos reales de supervivencia. Falta jugar esas rondas sin inmortalidad y ajustar únicamente parámetros que lo requieran.
- Falta una partida humana completa hasta ronda 25 y evaluar evasión/legibilidad de todos los ataques en escenarios variados. Los parámetros nuevos están centralizados y son provisionales.
- El registro de cajas crece con sectores visitados para conservar su estado en la misma run; sprites, cuerpos físicos, mapas cargados y caché de mundo permanecen acotados. No se realizó una prueba de horas ni un benchmark en teléfono.
- Las poses provisionales descritas arriba pueden sustituirse por secuencias dedicadas cuando estén disponibles. No hay errores de compilación o pruebas automatizadas pendientes.

## Archivos de esta actualización

Nuevos: `src/bosses/{expansion,NewBosses}.ts`, `src/config/fortune.ts`, `src/world/{FortuneState,FortuneObjects,fortuneAssets}.ts`, `public/assets/v16/{fortune.png,bosses.png,PROVENANCE.md}`, `tests/fortune16.test.ts`, `check-fortune16.cjs` y este informe.

Integración modificada: `src/main.ts`; `src/input/InputHub.ts`; `src/scenes/{Game,Menu,Achievements}.ts`; `src/systems/{RoundDirector,SurvivalSystem,PermanentProgress,Achievements}.ts`; `src/ui/{BossDialogue,CombatHud}.ts`; `src/mobile/MobileUI.ts`; `src/weapons/{arsenal,WeaponCombat}.ts`; `src/world/{WorldModel,WorldRoutes,WorldStreamer}.ts`; `src/config/{enemyBalance,releaseNotes}.ts`; `package.json`, `package-lock.json`, `README.md`.

Fixtures actualizados por comportamiento intencional/nuevo texto: `check-arsenal.cjs`, `check-balance152.cjs`, `check-requiem153.cjs`, `check-mobile151-menus.cjs`, `tests/requiem153.test.ts`. Los cambios locales anteriores de 1.5.2/1.5.3 siguen sin commit; el diff completo contra GitHub también los incluye y no debe confundirse con cambios exclusivos de 1.6.
