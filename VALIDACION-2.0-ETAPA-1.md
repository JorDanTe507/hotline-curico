# Hotline Curicó 2.0 — El tiempo se detiene

Etapa 1: Jordan, tercer protagonista. Entrega local del 2 de noviembre de 2026 sobre el trabajo de 1.9.1. No se hicieron commits, push ni despliegues. Boss Rush y Wesker no se implementaron.

## Integración de Jordan

- Tercer personaje en el catálogo y selección existente, con silueta, revelado e ilustración oficial. Tres tarjetas en PC y móvil; flujo individual de introducción y ruleta conservado.
- Diálogo inicial exacto: «Curicó... No estuve aquí, por lo menos hasta que pasó aquello...».
- Atlas direccional de 96×112, escala uniforme, ancla de pies y cuerpo de colisión equivalente al de los protagonistas anteriores. Reposo, caminar, correr, golpe, reacción y muerte utilizan los recortes reales. Disparo, armas pesadas, recarga, cambio, lanzamiento y consumibles reutilizan las capas de armas y acciones del motor anterior, como Cervela y Nicolás; no se inventaron nuevas poses para cada arma.
- Retrato facial del recurso de diálogo, variantes herida/crítica del sprite sheet y retrato especial. HUD existente con nombre, vida, chaleco, inventarios, XP y definitiva; cian para nombre, alerta, agonía y señalización cooperativa. Las tres frases de salud crítica y las cinco parejas de frases contra jefes son las solicitadas. Los diálogos anteriores se conservan y siguen desactivados en cooperativo.
- No se añadió un árbol de compras permanentes para Jordan. Sus siete mejoras son temporales por XP. Las compras y el guardado previo de Cervela/Nicolás se conservan.

## Juicio Final

| Parámetro | Valor |
| --- | --- |
| Carga base | 40 impactos válidos; compatible con la mejora general de carga |
| Duración base | 12 s |
| Cadena base | 2,5 s, reiniciada por acción especial válida |
| Máximo de acciones | 10, incluyendo golpes especiales a jefes |
| Curación por ejecución común | 8% de vida máxima, limitada a la salud que falta |
| Golpe a jefe | 20% de su vida máxima, una vez por jefe y activación; puede rematarlo |
| Munición | Real; sin munición infinita, disparo dual ni reducción de daño propios de Calada |

Jordan se desplaza físicamente hasta el objetivo: no se teletransporta. El botón de ejecución existente sirve para marcar enemigos comunes cercanos sin aturdirlos, con indicador y corte cian. Un jefe recibe daño porcentual en lugar de ejecución instantánea; consume una acción, reinicia la cadena y no cuenta como ejecución común ni cura como tal.

La habilidad termina por tiempo total, cadena, diez acciones, caída/muerte del dueño o transición de ronda. El campo temporal comparte el reloj de jugador, pero conserva y desplaza los relojes de IA, recarga, ataques de jefes, percepción, llamadas y estados enemigos. Guarda velocidades y escala de animaciones, congela únicamente enemigos y proyectiles enemigos y las restaura al finalizar. Lluvia, sectores, jugadores, disparos del compañero e interacciones continúan.

Las ejecuciones comunes se marcan y se resuelven al regresar el tiempo. Prioridad de cierre:

1. Restaurar movimiento y animaciones.
2. Resolver los enemigos marcados, una sola vez y con crédito de Jordan.
3. Aplicar daño pendiente a objetivos todavía vivos, con el autor y modificadores originales.
4. Resolver el cierre de los disparos aplazados conservando sus créditos de impacto, precisión y XP.

Un objetivo ejecutado no vuelve a morir por una bala pendiente. El compañero gasta sus recursos normalmente. Los proyectiles enemigos no avanzan ni golpean durante la detención. Al regresar se desvanece el filtro, aparece una onda de retorno y se reutiliza audio existente. La muerte del dueño también resuelve marcas y restaura el campo antes de la limpieza de derrota; las bajas aplazadas no reviven a un jugador caído mediante Sed de sangre.

## Mejoras exclusivas

| Mejora | Rareza | Niveles y límite |
| --- | --- | --- |
| Pulso temporal | Común | 4 × 0,25 s; cadena máxima 3,5 s |
| Segundo aliento | Rara | 10% / 12% de curación por ejecución |
| Tiempo prestado | Rara | 2 × 1 s |
| Golpe inevitable | Épica | Única; golpe a jefe al 25% |
| El último instante | Épica | Única; protección del 15% de vida máxima al cerrar, durante 5 s |
| Diez segundos eternos | Legendaria | Única; +2 s |
| Paradoja | Legendaria | Única; recuperar hasta 3 s al llegar a cinco ejecuciones, una vez por activación |

La duración inicial máxima es 16 s y también se impone un techo absoluto de 16 s desde la activación; Paradoja no puede superar ese techo ni rellenar por encima del temporizador máximo vigente. No aumenta las diez acciones. El escudo se concede una vez, sin acumular otro escudo completo en cada ejecución.

Se conservan las probabilidades 60 / 22 / 13 / 4,5 / 0,5. El catálogo tiene 60 IDs: los 53 anteriores y siete de Jordan. La carta general anterior llamada Tiempo prestado se excluye para Jordan en favor de su versión exclusiva; permanece para los otros personajes. La regeneración general de Calada no aparece para Jordan. Las ofertas elegibles de cada personaje no tienen nombres duplicados. El respaldo curativo de emergencia se muestra como Auxilio de emergencia para Jordan para distinguirlo de Segundo aliento.

## Logros

Ocho registros nuevos, sin recompensas adicionales de HC:

- El tiempo es oro: activar Juicio Final.
- Las vueltas de la vida: visitar la Copec con Jordan, común secreto.
- Uno menos...: cinco ejecuciones en una activación.
- Segunda oportunidad: recuperar realmente al menos 50% de la vida máxima en una activación.
- A contrarreloj: diez ejecuciones en una activación.
- Ni lo vio venir: matar un jefe con el golpe temporal.
- Cuando el tiempo se detuvo: diez ejecuciones y completar esa ronda sin daño a Jordan. Se espera al cierre de ronda para que el daño posterior a la cadena también invalide el intento.
- Doce segundos de eternidad: reservado e inactivo. Su contador de jefes distintos por activación y el evento futuro están preparados, pero no se concede ni cuenta en el 100% sin Boss Rush.

Ahora hay 64 definiciones, 62 activas y 61 incluidas en el porcentaje principal contando el logro final. Se mantienen las exclusiones de Compañeros de Curicó y de los logros reservados. Se conservaron IDs, fechas y progreso anterior; la migración incorpora el contador de cambios de cartas de Jordan sin borrar los de los otros protagonistas. Activar Juicio Final no desbloquea logros de Calada o Tryhard accidentalmente.

## Cooperativo

Se admiten Cervela/Nicolás, Cervela/Jordan y Nicolás/Jordan, en ambos órdenes. J1 selecciona en el menú existente; J2 puede cambiar entre los dos personajes restantes con izquierda/derecha del mando antes de confirmar. No se permiten duplicados. Se conservaron confirmación de ambos y dos giros de ruleta.

Los seis pares de diálogos ordenados se verificaron exactamente. Los nuevos están en `src/v20/dialogues.ts`; las conversaciones originales de Cervela y Nicolás permanecen. Jordan es cian independientemente de J1/J2. Los HUD laterales, inventarios y entradas continúan independientes. Las franjas se asignan sin solaparse: Cervela arriba, Nicolás abajo y Jordan en la posición opuesta disponible según su pareja.

Jordan usa la agonía de 120 s y la reanimación mantenida de 3,5 s con 20 HP. Cámara libre del superviviente, flecha, contorno, bordes críticos y limpieza de 1.9.1 se conservan. El reintento mantiene el modo y la pareja.

Las derrotas nuevas se eligen por los integrantes, sin depender del orden. Se conserva la imagen Cervela/Nicolás. Las ilustraciones con botones dibujados usan zonas transparentes alineadas; el móvil individual de Jordan también usa la ilustración completa con sus dos zonas táctiles, sin duplicar botones visibles.

## Recursos reales utilizados

25 PNG de ejecución en `public/assets/v20`, más el manifiesto de fotogramas `jordan-frames.json`. Generación reproducible en `tools/prepare_jordan20.py`.

| Archivo suministrado | Uso |
| --- | --- |
| Hoja de sprites pixel art de Jordan.png | Atlas, poses y variantes de retrato herido/crítico/especial |
| Jordan y el tiempo detenido.png | Ilustración de Juicio Final |
| Pantalla de derrota en neón.png | Derrota individual de Jordan |
| Caídos bajo las luces de Curicó.png | Derrota Cervela/Jordan |
| Han Caído_ Nicolás y Jordan.png | Derrota Nicolás/Jordan |
| Jordan ensangrentado bajo luces neón.png | Retrato grande de selección con alfa preparado |
| Diálogo pixelado de Jordan.png | Recorte facial, sin reutilizar su texto dibujado como instrucción |
| Logros y mejoras de Jordan.png | Ocho iconos de logros y siete de mejoras |

La lámina tiene cantidades reales distintas de algunos rótulos: se extrajeron 181 fotogramas completos, normalmente 4–6 por dirección/pose. Se segmentaron los cuerpos completos para no cortar las muertes tendidas ni incluir al vecino; no se rellenaron artificialmente filas hasta ocho. Se conserva el orden de caída, invirtiendo las filas de perfil derecho que vienen dibujadas al revés. Las poses de agonía/reanimación presentes también se extraen; el juego conserva la regla aprobada de muerte existente más respiración, sin animación de un compañero ayudando.

El fondo blanco se elimina solo por conectividad al borde y el negro exterior del retrato mediante recorte conectado; no se eliminan globalmente colores oscuros de pelo, ropa o armas. Se conserva alfa, nearest-neighbor y proporciones. Las ilustraciones de derrota y definitiva se copian sin regenerarlas. No se carga la lámina completa como escenario o personaje.

## Archivos de implementación

- Nuevos `src/v20/Judgment.ts`, `TemporalField.ts`, `upgrades.ts`, `dialogues.ts`, `assets.ts`.
- `src/characters/{catalog,abilities,directional}.ts`: tercer protagonista y su atlas; `src/main.ts`: carga y alias.
- `src/scenes/{CharacterSelect,Game,Menu}.ts`, `src/input/InputHub.ts`: selección de tres, intro, campo temporal y crédito de disparos.
- `src/v19/{CoopLobby,CoopSession,CoopHud,CoopSignals,Goals19}.ts`: selección de pareja, HUD, franjas, señales, muerte/Copec y compatibilidad.
- `src/ui/{BossDialogue,DeathSequence,UltimateView}.ts`, `src/mobile/{MobileMenus,MobileUI,mobile.css}`: diálogos, derrotas, temporizadores y menús táctiles. MobileUI conserva sus controles anteriores; la nueva composición se conecta mediante MobileMenus/CSS.
- `src/systems/{Ultimate,SurvivalSystem,Perception,Progression,UpgradeCatalog,Achievements,PermanentProgress,RunPerks,CriticalHealth,RoundDirector}.ts`: habilidad, progresión, persistencia, salvaguardas y relojes.
- `src/bosses/{Torturado,NewBosses}.ts`, `src/enemies/EnemyBehaviors.ts`, `src/weapons/Burning.ts`, `src/chaos/ChaosSystem.ts`: pausa reversible de temporizadores enemigos y estados.
- `src/config/{cinematics,releaseNotes}.ts`, `package.json`, `package-lock.json`: presentación, versión 2.0.0 y scripts.
- `tests/jordan20.test.ts` y ajustes de recuentos/versiones en las pruebas anteriores; `check-jordan20{,-flows,-combat,-mobile,-production}.cjs`.

El árbol local contiene trabajo previo no confirmado. Esta lista describe la integración de esta etapa, no atribuye todo el diff acumulado a 2.0.

## Comprobaciones realizadas

| Comprobación | Resultado |
| --- | --- |
| TypeScript y `npm run build` | Correctos; aviso informativo de tamaño de bundle de Vite |
| Suite unitaria | 205/205 correctas: límites, cadena, curación, jefe, Paradoja, escudo, exclusivas, persistencia y logro reservado; daño posterior invalida el logro de ronda limpia |
| `check-jordan20.cjs` | Tres retratos, intro, sprites, ejecución sin teletransporte, 8% de curación, caída y crédito único; jefe 20%, golpe no repetible y remate; proyectiles restaurados y daño pendiente |
| `check-jordan20-flows.cjs` | Seis parejas ordenadas, doce frases cooperativas exactas, diez frases de jefe de Jordan y cinco casos de derrota individual/conjunta según el orden |
| `check-jordan20-combat.cjs` | Bucle real: teclado y mando simulado se mueven durante Juicio Final; compañero dispara, gasta munición y registra tres impactos pendientes, resueltos una vez; diez ejecuciones, 80 HP de curación, prioridad sobre daño letal pendiente, muerte cancela el campo y reanimación real de Jordan con 20 HP; despacho de las 16 armas y cinco arrojadizos |
| `check-jordan20-mobile.cjs` | Selección de tres, intro exacta, activación/ejecución/curación táctiles, pantalla oficial y reintento individual sin cooperativo |
| `check-jordan20-production.cjs` | Producción servida en `/hotline-curico/`, notas 2.0 e historial 1.9.1, selección e inicio de Jordan; los 25 PNG nuevos cargan y son idénticos a dist; sin global de depuración, errores HTTP ni JS |
| `check-coop19.cjs` | Controles e inventarios independientes, dos ruletas, cartas de J2, ambas definitivas originales, agonía/reanimación, HUD y jefe sin diálogo conservados |
| `check-coop191.cjs` | Cámara, etiquetas, alertas, contornos, limpieza y derrotas anteriores conservadas |
| `check-radio19.cjs` | Llamada/refuerzos, radio, suministro único con botiquín/munición y sin HC conservados |
| `check-chaos18.cjs` | Cinco arrojadizos, cuchillos, barriles, resistencias, efectos y reinicios conservados |
| `check-polish181.cjs` | RPG, reserva, recarga/audio, alertas de Cervela/Nicolás y móvil individual conservados |

Las pruebas de combate usan escenarios controlados y, donde se indica, pasos de reloj para límites y prioridades; las pruebas de movimiento, disparo y reanimación también usan el bucle real. Se revisaron capturas de selección, atlas, iconos, HUD, franja temporal, móvil y derrota. No se hizo una partida humana completa de 25 rondas. El mando fue simulado y Android emulado; no se declara probado hardware físico nuevo.

## Estado

Etapa 1 implementada localmente, sin errores bloqueantes detectados por estas comprobaciones. Pendiente validación humana de dificultad/ergonomía con mando y móvil reales. El aviso de tamaño de bundle permanece como advertencia informativa. Las máscaras artísticas antiguas pendientes de 1.8.1 siguen documentadas en su informe y no se atribuye su reparación a esta etapa.

Boss Rush y Wesker quedan para otra etapa; el logro reservado no es una función jugable anunciada. Para probar, ejecutar `npm run dev` dentro del proyecto. No se modificaron el remoto ni el historial Git y no se publicó nada.
