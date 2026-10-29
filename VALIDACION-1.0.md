# Hotline Curicó 1.0 — Cervela y Nicolás jugables

27 de octubre de 2026. Actualización incremental del proyecto Phaser 3/TypeScript; se conserva el arsenal completo 0.9.1, la progresión, el mundo por sectores y el video del menú.

## Funcionalidad entregada

El recorrido es MENÚ → JUGAR → SELECCIONAR PERSONAJE → introducción propia → PARTIDA. No se inicia la partida desde JUGAR sin confirmar protagonista. VOLVER/Escape regresa al menú. La música Neon Noir continúa durante la selección; el video del menú conserva reproducción en bucle y audio silenciado.

La selección muestra las siluetas negras de los sprites reales de Cervela y Nicolás, a izquierda y derecha. El cursor revela colores, brillo, nombre y habilidad mediante transiciones de 240 ms. Salir revierte la revelación. El sonido suave solo se dispara al cambiar de foco. Flechas o A/D permiten navegar; Enter confirma. Hay bloqueo de entradas durante la confirmación de 380 ms. El cursor estático heredado del botón JUGAR no revela automáticamente un personaje ni roba el foco del teclado.

`CharacterConfig` centraliza identidad, conjuntos de poses normales/heridas, retratos, frases, estadísticas, sonido, presentación y módulo de habilidad. `PlayerAppearance` resuelve las poses y el estado herido. Movimiento, salud, colisiones, arsenal, inventario y progresión siguen compartidos. Una factoría de habilidades elige el módulo configurado; no existen dos controladores completos de jugador ni habilidades simultáneas.

Cervela conserva traje, retratos, diálogos y Última Calada: 40 impactos base, regeneración de 20 HP/s durante 12 s, munición infinita, dos armas y reducción del 40% del daño, con las mejoras existentes.

Nicolás usa su polerón café y gráficos propios. Incluye reposo, espalda, movimiento, carrera/dash, pistola, armas largas, melee, daño, poca salud, muerte y retratos. No utiliza retratos, humo ni frases de fumar de Cervela. El diálogo del Torturado también cambia para no atribuirle ese hábito.

### Modo Tryhard

- X reserva la carga y muestra una sola presentación con el retrato especial, sonido propio y «Acabemos pronto, que tengo que ir a hacer los jefes».
- Carga base de 40 impactos válidos, con la deduplicación existente por ataque/enemigo. La carta de carga también funciona para Tryhard y se llama Tryhard acelerado.
- Duración inicial de 8000 ms. Cada enemigo eliminado añade 750 ms, una sola vez por baja; el final nunca supera 14000 ms desde el comienzo de esa activación.
- Daño con armas ×1,35, incluida melee; los disparos conservan el modificador en su crédito de impacto.
- Movimiento ×1,25 sobre la velocidad resultante de las mejoras. Dash con enfriamiento temporal de 500 ms; al terminar vuelve al enfriamiento general mejorado de la partida.
- Sin regeneración, munición infinita, disparo doble ni reducción de daño. Conserva recarga y munición reales; un ataque suficiente sigue siendo letal. La invulnerabilidad breve del dash y las reglas de ejecución existentes siguen compartidas.
- Aura roja/magenta, destello de activación y estelas de velocidad. Al terminar, morir o reiniciar desaparecen las bonificaciones.

Las mejoras específicas de regeneración y duración de Última Calada no se ofrecen a Nicolás. Las mejoras generales siguen disponibles. La reserva de munición de emergencia tampoco intenta añadir munición ficticia a armas melee.

Con vida igual o inferior al 25% del máximo, Nicolás utiliza las seis frases solicitadas y retratos heridos. Los diálogos duran 3 segundos y tienen 20 segundos de espera entre activaciones. El aviso sonoro conserva su límite independiente. Recuperarse restaura inmediatamente el retrato normal; el umbral funciona también después de mejorar la vida máxima.

La muerte muestra nombre, retrato y animación del protagonista. REINTENTAR envía explícitamente su identificador y comienza una partida nueva con salud 100, chaleco 0, nivel 1 y carga 0. Volver al menú abre de nuevo la selección y permite cambiar de protagonista.

## Archivos y recursos

Nuevos:

- `src/characters/catalog.ts`: configuración central de personajes y poses.
- `src/characters/assets.ts`: carga de recursos y animaciones de muerte por configuración.
- `src/characters/abilities.ts`: factoría de habilidades.
- `src/characters/PlayerAppearance.ts`: componente visual compartido.
- `src/scenes/CharacterSelect.ts`: selección con ratón/teclado, revelación y confirmación.
- `src/systems/Tryhard.ts`: habilidad de Nicolás con presupuesto temporal máximo.
- `tools/extract_nicolas.py`: extracción reproducible con rectángulos explícitos y limpieza del fondo.
- `public/assets/characters/nicolas/`: 40 cuadros de poses normales/heridas y ocho retratos; `crops.json` documenta el origen de cada recorte.
- `public/assets/audio/tryhard.wav`: sonido de activación sintetizado localmente, con perfil en `tools/generate_audio.py`.
- `tests/characters.test.ts` y `check-characters.cjs`: pruebas nuevas.

Modificados:

- `src/main.ts`, `src/scenes/Menu.ts`, `src/scenes/Game.ts`: registro de escena, flujo, paso del identificador, creación de componentes, daño, movimiento, disparo, muerte y reintento.
- `src/systems/Ultimate.ts`, `UltimatePresentation.ts`, `CriticalHealth.ts`, `Dash.ts`: capacidades de habilidad, presentación configurable, retratos/frases y enfriamiento temporal.
- `src/systems/Progression.ts`, `UpgradeCatalog.ts`: recompensas pertinentes a la habilidad seleccionada.
- `src/systems/SurvivalSystem.ts`, `src/weapons/WeaponCombat.ts`: poses del personaje y modificadores de melee.
- `src/ui/CombatHud.ts`, `UltimateView.ts`, `BossDialogue.ts`, `LevelUpView.ts`: nombre, retratos, habilidad, munición, efectos y diálogo correctos.
- `src/systems/AudioSystem.ts`, `tools/generate_audio.py`: registro del sonido de Tryhard.
- `check-v062.cjs`: incorpora el nuevo paso obligatorio de selección y espera el desbloqueo real del audio.
- `package.json`, `README.md` y este informe: versión, comandos y documentación.

Hojas utilizadas, entregadas por el usuario:

1. `D:/Descargas/Hoja de sprites de Nicolás sin fumar.png`: la mayoría de poses normales y retrato normal sin cigarrillo.
2. `D:/Descargas/Hoja de sprites de Nicolás herido.png`: poses de poca salud, reacciones, muerte y seis retratos dañados.
3. `D:/Descargas/Hoja de personaje pixel art de Nicolás.png`: carrera normal y retrato especial de la habilidad.

Los recursos existentes de Cervela se reutilizan sin reemplazar sus archivos originales. No se usan las hojas completas como textura de gameplay ni se recolorea a Cervela para representar a Nicolás.

## Validación

- `tsc --noEmit`: correcto.
- `vite build`: correcto, paquete de producción generado. Persiste el aviso conocido de tamaño del paquete principal de Phaser; no impide compilar.
- `tsx --test tests/*.test.ts`: **67/67 aprobadas**, incluidas seis nuevas sobre configuración/recursos, carga/consumo/duración de Tryhard, máximo de 14 segundos, exclusión de efectos de Calada, mejoras y dash temporal.
- `check-characters.cjs`: recorrido real desde JUGAR; siluetas iniciales; revelar/ocultar con cursor; selección de Cervela con teclado y de Nicolás con ratón; bloqueo del segundo clic; poses propias; los 16 ataques funcionales con cada personaje; experiencia, tres cartas y aplicación de mejora con ambos; jefe con diálogo, escopeta y muerte; continuidad hasta ronda 6 y sectores industriales; estado crítico y recuperación; activación por X con retrato y frase; daño real ×1,35, velocidad ×1,25, dash de 500 ms, extensión por baja, consumo normal, ausencia de curación/reducción/disparo doble y restauración al terminar; muerte durante Tryhard; reintentos de ambos y cambio posterior a Cervela. Sin texturas/animaciones faltantes, errores HTTP de recursos ni errores JavaScript.
- `check-arsenal.cjs`: correcto. Recuperación de las 16 armas, munición exacta, reclamación exclusiva, caída al morir, G, persistencia y limpieza al reintentar.
- `check-v09.cjs`: correcto. Experiencia y mejoras acumuladas de Cervela, cartas, modificadores, daño letal y reintentos.
- `check-v062.cjs`: correcto. Última Calada conserva regeneración, duración y reducción sin inmortalidad; chaleco, botín, HUD, rondas, jefe, menú y reintentos.
- `check-v07.cjs`: correcto. Ruleta y minigun conservan preparación, 20 disparos/s, recarga, penalización, penetración y combinación con RPG durante Última Calada.
- `check-world.cjs`: correcto. 17 comprobaciones del mundo, recorrido físico hasta industria, rutas, botín, progresión, rondas y reintentos. Nueve sectores cargados, caché de 64, 20 capas, hasta 444 cuerpos; en esta ejecución local con 24 enemigos, mediana 6,9 ms y percentil 95 de 9,2 ms por actualización. No es una garantía de FPS para otros equipos.

También se verificó movimiento físico con WASD y animación propia de Nicolás en las calles industriales.

Capturas: `characters-silhouettes.png`, `characters-nicolas-reveal.png`, `nicolas-critical.png`, `nicolas-tryhard-activation.png`, `nicolas-death.png` y `nicolas-industrial.png`.

## Límites gráficos

Las láminas son composiciones de presentación, con fondos incrustados y cuadros de tamaños distintos. Se recortaron y normalizaron sobre lienzos de 68×128 con los pies alineados. La limpieza conserva máscaras locales del cabello y calzado para evitar borrar sus tonos oscuros; pueden quedar bordes discretos. No es un atlas original con transparencia perfecta.

La pose de recarga reutiliza el reposo de Nicolás porque las hojas no incluyen una secuencia independiente de recarga. La recarga mecánica sí utiliza el sistema real de cada arma. Los ataques combinan sus poses específicas con el arma equipada y efectos existentes. La selección amplía el sprite completo real; no utiliza ilustraciones humanas genéricas.
