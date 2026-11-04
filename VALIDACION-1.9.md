# Hotline Curicó 1.9 — Doble o Nada

Versión local, 2 de noviembre de 2026. No se hicieron commits, push ni despliegues. Se conservaron los cambios locales anteriores de 1.7.4, 1.8 y 1.8.1. El commit de referencia sigue siendo `e0a2c75`.

## Implementación

- **29 mejoras temporales nuevas**, más las 24 anteriores: 53 opciones distintas antes de los respaldos de emergencia. Nuevas: 2 comunes, 4 poco comunes, 5 raras, 8 épicas y 10 legendarias. Las exclusivas se filtran por protagonista. Las nuevas son únicas por partida. No se añadió Manos rápidas ni un árbol permanente nuevo.
- Rarezas: 60% común, 22% poco común, 13% rara, 4,5% épica y 0,5% legendaria; la selección se ajusta a las opciones elegibles. Los valores, límites, duraciones y exclusiones se muestran en las descripciones de las cartas y en `src/v19/UpgradeCatalog19.ts`.
- Efectos acotados: Máquina de matar hasta +40%/12 s; Humo y plomo hasta +20%/2 s; Uno contra todos hasta tres cargas/8 s; Tanque improvisado hasta +15%/3 s; El último cigarro hasta +5 s por activación; Jefe de incursión hasta 50% de vida temporal máxima recuperada por activación; máximo dos incendios derivados. Las salvaciones mortales se resuelven de una en una por golpe.
- **15 logros nuevos**. Golpe de gracia, Arsenal ambulante, Qué recuerdos…, Compañeros de Curicó, Interrupción, Comunicación rota, Suministro en camino, Explosión de cadena, Todo arde, Ceguera masiva, Choque total, Fragmentos de Curicó, Acero silencioso, Daño colateral y Al día. Se conectaron los tres logros anteriores de Comandante, Demoledor y los cinco jefes.
- Catálogo: 56 definiciones, 55 activas; 54 cuentan en el porcentaje principal incluyendo el logro final. Compañeros de Curicó se muestra y persiste, pero no cuenta en el 100%. El reservado anterior Sin ventajas continúa reservado. El antiguo logro de diez armas se llama ahora Arsenal variado, conservando su ID, condición y guardado para distinguirlo del nuevo Arsenal ambulante.
- Arsenal ambulante verifica todas las fuentes de daño al jefe y ambos jugadores: armas, golpes, barriles directos, daño sin crédito y ataques de NPC descalifican el intento. El golpe final con cuchillo se verifica independientemente.
- **Tres desafíos diarios**, elegidos de forma determinista por fecha UTC entre nueve objetivos de juego individual. El avance persiste y las recompensas completadas pendientes sobreviven al cambio de día. Paginación en PC y lista desplazable en móvil. Cuenta regresiva UTC en ambas interfaces.
- Recompensas: 50 bajas/150 HC; 20 bajas con arrojadizos/200 HC; cinco rondas/150 HC; un jefe/150 HC; 20 bajas con escopeta/150 HC; cinco barriles/100 HC; cinco cuchillos recuperados/100 HC; una llamada interrumpida/150 HC; una radio usada/100 HC. El monedero existente registra la reclamación para impedir cobros duplicados, incluso si se interrumpe el guardado del diario. No se cambia el precio del cofre de 500 HC. Los modos de pruebas no conceden progreso persistente.
- **Radioperador** desde la ronda 3, cada tres rondas no destinadas a jefe. Sin arma, ataques ni recogida de armas. Patrulla, detecta mediante proximidad y línea de visión, muestra alerta y llama durante cuatro segundos. Una llamada añade cuatro refuerzos y actualiza objetivo y pendientes de Exterminio. Después huye usando la última posición vista y navegación; puede desaparecer fuera de cámara.
- Si muere antes de completar su llamada, tiene 75% de posibilidad de soltar una radio; después de completarla, ninguna. Una única recompensa por radioperador. La radio se consume una vez mediante la interacción existente y solicita un suministro accesible tras 1,5 s. Abrirlo una vez genera un botiquín y munición, más 8% de posibilidad de arma rara, épica o legendaria. No entrega HC.
- **Cooperativo local independiente, exclusivo de PC**. J1 usa teclado/ratón y J2 el mando existente. Ambos confirman; el segundo utiliza el protagonista restante. Se conservaron las cuatro frases iniciales exactas. La ruleta existente realiza dos giros consecutivos y entrega armas independientes.
- Un mundo, un conjunto de enemigos y unas rondas compartidos. Salud, chaleco, armas, munición, botiquines, adrenalina, arrojadizos, XP, cartas, dash y definitivas separados. Las cartas de J2 solo aceptan su mando, incluyendo cambiar cartas. Los cuchillos recuperables comparten un registro de objetos con tokens distintos por jugador, sin compartir inventario.
- **HUD J1 arriba a la izquierda y J2 arriba a la derecha**, incluso al intercambiar personajes; retratos existentes y objetivos globales centrales. Cámara común, zoom mínimo 0,75 y separación máxima de 780 unidades. En cooperativo: +15% HP de enemigos normales, +40% HP de jefes y objetivo de Exterminio ×1,25 redondeado hacia arriba. No se modifican esos valores en individual.
- Agonía durante 120 s usando la muerte existente y respiración sutil. Mantener interacción 3,5 s cerca del compañero y con línea de visión reanima con 20 HP. El temporizador se congela en pausa, sigue entre rondas y permite continuar al superviviente tras una muerte definitiva. Ambos incapacitados terminan la partida.
- Definitivas independientes sin congelar la otra entrada: franja superior de Cervela e inferior de Nicolás, simultáneas si corresponde. Presentaciones individuales conservadas. Jefes sin diálogos solo en cooperativo; sus diálogos individuales permanecen definidos y conectados.

## Equivalencias preservadas

No se duplicaron seis propuestas:

| Propuesta | Equivalente conservado y ajuste |
| --- | --- |
| Paso ligero | Reflejos felinos: se conserva +5% por nivel en vez de añadir otra carta de +8%. |
| Bolsillos profundos | Ya existía: +20% de reserva recibida por nivel. No se inventa un límite máximo nuevo para un sistema de reserva sin ese límite. Minigun no recibe el incremento. |
| Segunda oportunidad de escudo | Blindaje de emergencia: 25/35/45 de protección bajo 30% de vida, una vez por ronda. También se conserva la antigua salvación mortal Segunda oportunidad. |
| Sed de sangre | Original: Cervela 3/5/7 HP y Nicolás 2/3/4 HP por baja, con enfriamiento de un segundo. No se añade otro efecto de 15 HP por cinco bajas. |
| Munición perforante | Bala fantasma: 15/25/35% de penetración y segundo impacto al 50%; las incompatibilidades anteriores se conservan. |
| Instinto asesino | Se conserva su velocidad temporal y se añade la reducción del 20% del enfriamiento restante del dash. |

## Recursos

104 PNG individuales de las cinco láminas nuevas, con manifiesto de procedencia y recorte en `public/assets/v19/manifest.json`; generador reproducible `tools/prepare_assets19.py`. No se carga ninguna lámina completa como textura del juego. Los fondos blancos del radioperador/suministros se eliminan solo por conectividad al borde; no se eliminan colores oscuros de ropa. Los iconos conservan sus paneles y contornos originales, con alfa exterior y filtrado nearest.

Se integraron animaciones del radioperador, radio, marcador de llegada, seis estados de apertura del suministro, marcos, iconos de logros, diarios y mejoras. La revisión visual corrigió los límites desiguales de los iconos legendarios para evitar retratos cortados y fragmentos de la celda siguiente.

- Humo y plomo y Tanque improvisado no tienen iconos identificables en la lámina: usan provisionalmente los retratos de definitiva existentes de sus protagonistas.
- El icono genérico «Mejora especial» no se asignó a un efecto inventado.
- Munición del infierno y Sobredosis aparecen en la fila épica de la referencia; son legendarias según la instrucción aprobada. La carta muestra rareza legendaria sin recolorear el dibujo original.
- Se mantienen las siete máscaras artísticas de armas antiguas documentadas en `VALIDACION-1.8.1.md`; no se atribuye su reparación a esta actualización.

## Archivos de esta actualización

Nuevos módulos: `src/v19/{Events,Progress19,DailyDefinitions,DailyService,DailyChallenges,Goals19,UpgradeCatalog19,Rogue19,RadioSystem,CoopInput,CoopSession,CoopLobby,CoopHud,CoopPresentation,assets}.ts`.

Integración en archivos existentes:

- `src/scenes/{Game,Menu,CharacterSelect,Achievements}.ts`, `src/main.ts`: escenas, estado por jugador, conexión de eventos, recursos y menús.
- `src/input/InputHub.ts`: selección del contexto de entrada, navegación y reutilización del singleton; `src/mobile/{MobileUI,MobileMenus}.ts`: diarios táctiles y ocultación del cooperativo.
- `src/systems/{Achievements,PermanentProgress,RoundDirector,Ultimate,UltimatePresentation,SurvivalSystem,UpgradeCatalog}.ts`: persistencia, recompensas, fuentes de daño, refuerzos, estadísticas y componentes reutilizados.
- `src/ui/LevelUpView.ts`, `src/ui/DeathSequence.ts`: propietario de cartas y reintento cooperativo; `src/weapons/Burning.ts`: quemadura compartida por objetivo con crédito de jugador.
- `src/chaos/{ChaosSystem,DamageBudget}.ts`: mejoras de arrojadizos, crédito, límites por jugador y recuperación de cuchillos. `src/world/FortuneObjects.ts`: Chatarrero y propietario de la destrucción de cajas.
- `src/config/{progression,releaseNotes}.ts`, `src/enemies/config.ts`, `src/atmosphere/CityAtmosphere.ts`: rarezas, XP del nuevo enemigo, notas y ambos actores en la iluminación.
- `package.json`, `package-lock.json`, pruebas de catálogo/compatibilidad existentes y `tests/double19.test.ts`; cinco comprobaciones nuevas de navegador `check-{coop,radio,menus,world,production}19.cjs`.

El árbol Git también contiene trabajo previo a 1.9. Esta lista identifica la integración actual y no implica que todos los cambios locales pertenezcan a esta versión.

## Pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| TypeScript y `npm run build` | Correctos. Aviso de Vite por tamaño del bundle; no impide compilar. |
| `tsx --test tests/*.test.ts` | 196/196 correctas. Incluye estabilidad UTC, rollover, reclamación tras guardado interrumpido, exclusión del 100%, 53 cartas sin duplicados, exclusivas, límites y fuentes de daño de jefes. |
| `check-coop19.cjs` | Movimiento/disparo simultáneos; munición, botiquines y arrojadizos separados; cuchillo recuperado por el compañero una vez; XP de J2; cámara/separación; definitivas simultáneas; agonía, pausa, reanimación con 20 HP; muerte definitiva/superviviente; dos ruletas; retratos intercambiados; cartas y cambio de cartas de J2; jefe sin diálogo. |
| `check-radio19.cjs` | Sin detección tras obstáculos, llamada única de cuatro segundos, cuatro refuerzos/objetivo/pendientes, radio previa y ninguna posterior, suministro accesible de un solo uso, botiquín/munición y sin HC. |
| `check-menus19.cjs` | Selección cooperativa, confirmación real de teclado y mando simulado, ambas parejas de frases exactas, diario persistente y cobro único; menú diario y reloj UTC táctiles, cooperativo oculto en móvil. |
| `check-world19.cjs` | Presentación y transición a combate de los cinco jefes individuales; absorción del chaleco y recogida de armas/munición independientes; IA elige J2; salvación mortal evita agonía. |
| `check-chaos18.cjs` | Regresión de arrojadizos, cuchillos, barriles, efectos, resistencias y reinicios: correcta, sin errores JS/HTTP. |
| `check-chaos18-mobile.cjs` | Mantener/soltar táctil, trayectoria, cinco contadores, cambio, cancelación por blur y pausa: correctos. |
| `check-polish181.cjs` | RPG/reserva/recarga, sonidos válidos y cancelaciones, alerta crítica PC y móvil: correctos. |
| `check-production19.cjs` | Build servido localmente en `/hotline-curico/`: notas 1.9 e historial, 166 sprites v18/v19 cargados, archivos de origen iguales a los incluidos en dist, audio incluido, HUD táctil y cambio de arrojadizo; sin global de depuración ni errores JS/HTTP. |

Los escenarios automatizados de combate usan estado controlado y saltos de reloj para comprobar transiciones; no equivalen a una partida humana completa de 25 rondas. El mando fue simulado mediante la API estándar del navegador. No se probaron USB/Bluetooth físicos ni Android real. La legibilidad del HUD intercambiado, los recursos y las franjas se revisó mediante capturas locales. Sigue siendo recomendable una sesión humana para valorar dificultad y ergonomía.

## Estado final

Las 18 etapas funcionales están implementadas y verificadas por las comprobaciones indicadas. No hay una fase de implementación dejada a medias. Quedan pruebas de hardware real y valoración humana de equilibrio; no se presentan como realizadas. El guardado anterior permanece en sus claves, con diarios en una clave adicional y reclamaciones dentro del monedero existente. El progreso de localhost no se comparte automáticamente con otros dominios.

Para probar: ejecutar `npm run dev` dentro de esta carpeta. El cooperativo aparece como entrada distinta de JUGAR en PC; conectar el mando y pulsar un botón antes de confirmar J2. Esta entrega es exclusivamente local.
