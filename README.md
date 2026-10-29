# Hotline Curicó — versión 1.5.1 · Compatibilidad móvil

Juego local para PC con Phaser 3, TypeScript y Vite. La ruleta existente se conserva intacta en la carpeta superior.

## Ejecutar

Desde esta carpeta, con Node.js 22 o posterior y npm:

```sh
npm install
npm run dev
```

Abrir la dirección que indique Vite. Alternativamente usar `pnpm install` y `pnpm dev`. En este equipo las dependencias ya están instaladas. `npm run build` genera dist; `npm run preview` sirve la compilación. No abrir index.html mediante doble clic. Es una aplicación web local, sin instalador de Windows. SALIR se omite porque el navegador no permite cerrar de forma fiable la pestaña.

## Controles

WASD mover; ratón apuntar; mantener clic izquierdo disparar o golpear si estás desarmado; R recargar; E recoger; Q alternar entre dos armas; F botiquín; ESPACIO dash; G lanzar arma; V ejecutar aturdido; X habilidad del protagonista; ESC pausa. Con dos armas, E sustituye el arma activa. Dos botiquines como máximo. La salud persiste entre rondas. Ambos comienzan desarmados: recoge con E el premio de la ruleta.

## Funcionalidades conservadas de 1.1

Modo Tryhard multiplica temporalmente por cinco la capacidad de salud de Nicolás y conserva el porcentaje al entrar y salir: 80/100 → 400/500; 250/500 → 50/100. Las mejoras de vida siguen operando sobre el máximo normal; el chaleco no se multiplica. El HUD muestra la capacidad vigente con una barra especial. Se conservan daño, velocidad, dash, duración, extensiones por bajas y munición real.

Ambos protagonistas tienen alerta de salud con pitido cada 1,2 segundos y bordes rojos pulsantes: entra al 25% y se detiene al superar el 30%, usando el máximo vigente. Respeta el volumen de efectos y se silencia al pausar, morir o abandonar. La derrota detiene el combate inmediatamente y reproduce animación/fundido musical y visual antes de mostrar una ilustración individual, frase propia y botones reales de reintento/menú. Consulta [la validación 1.1](VALIDACION-1.1.md) para archivos, recursos y resultados de pruebas.

La selección utiliza exclusivamente los dos retratos oficiales nuevos, grandes y proporcionados. Cervela aparece a la izquierda y Nicolás a la derecha, con siluetas, revelación de 250 ms, resplandor y descripción de habilidad. Los recursos de selección están separados de gameplay, diálogos, daño y ulti; no se sustituyeron las animaciones de combate. Consulta [la validación visual 1.0.1](VALIDACION-1.0.1.md).

JUGAR abre la selección de Cervela y Nicolás. Mueve el cursor sobre su silueta para revelarlo o utiliza ←/→ (A/D) y Enter; Escape o VOLVER regresa al menú. Confirmar muestra la introducción del protagonista elegido y comienza su partida. Reintentar conserva al personaje y reinicia sus estadísticas; volver al menú permite elegir otro.

Cervela conserva Última Calada. Nicolás utiliza sus sprites y retratos propios, sin fumar, y Modo Tryhard: 40 impactos iniciales, 8 segundos, +35% de daño con armas, +25% de velocidad y dash de 500 ms; cada baja añade 750 ms hasta un total máximo de 14 segundos. Consume munición, no cura y no reduce el daño recibido. Ambos comparten las 16 armas, inventario, protección, niveles y mundo. Las cartas de regeneración y duración de Última Calada se excluyen para Nicolás; la de carga reduce los impactos de Tryhard. Consulta [la validación 1.0](VALIDACION-1.0.md) para archivos, recursos, pruebas y límites.

Arsenal de 16 armas funcionales: las siete originales, La Barredora y Mini Uzi, Magnum, recortada, M79, lanzallamas, bate, palanca y hacha. Los enemigos armados sueltan siempre su instancia con munición real; Cervela y los matones pueden recuperarla. E intercambia y deja el arma sustituida en el suelo; G permite arrojarla, aturdir y recuperarla. Se conservan identidad y munición entre sectores. Consulta [la validación del arsenal 0.9.1](VALIDACION-ARSENAL-0.9.1.md), que describe los comportamientos actuales, pruebas y limitaciones. Las secciones de versiones anteriores documentan su evolución.

El complejo inicial tiene salidas hacia un mundo continuo de calles, comercios, plazas y zonas industriales. Los sectores se generan por semilla y se cargan alrededor de Cervela; las armas y el botín pendientes se conservan al regresar. Hacia el este se llega a la zona industrial. Se mantiene toda la progresión 0.9, además de armas, ruleta, dash, protección, jefes y música. Consulta [el informe de expansión 0.8.5](VALIDACION-MUNDO-0.8.5.md) para generación, archivos y limitaciones; [el informe 0.9](VALIDACION-0.9.md) detalla la progresión.

## Implementado

Menú y controles en español, introducción con retrato, escenario fijo de 12 espacios conectados con umbrales de puertas abiertos, obstáculos y cámara. Siete armas configurables con munición, recarga, dispersión, alcance y RPG sin reserva con explosión y daño propio. Inventario y objetos aleatorios en celdas accesibles. Cinco clases de enemigos con detección, persecución mediante búsqueda de rutas y línea de visión. Rondas sin límite y cinco variantes de jefe cada cinco rondas. Ataques pesados con aviso por destello, barra de jefe, HUD, pausa, estadísticas y reinicio completo.

## Organización

src/scenes: pantallas y coordinación. src/maps: escenario, colisiones y rutas. src/weapons: arsenal y recarga. src/enemies y src/bosses: estadísticas y selección. src/systems: estado de partida y curación. Las carpetas entities, ui y config quedan reservadas para extraer componentes a medida que crezca el proyecto; la coordinación de combate está actualmente en Game.ts.

## Recursos y limitaciones de esta versión

Las imágenes originales no son hojas uniformes: Cervela mide 1536 × 1024 y el personaje neón 1222 × 1287. extract_assets.py documenta los rectángulos explícitos; public/assets/characters/recortes.json contiene sus coordenadas. El retrato se carga por separado y nunca se usa como personaje de gameplay.

El cuadriculado está incrustado en las imágenes. Se eliminó por umbral de color en los recortes pequeños; puede afectar detalles blancos de camisa y producir bordes. Se necesitan PNG con transparencia real y fotogramas separados para movimiento en cuatro direcciones, disparo, recarga, daño y muerte. Esta versión alterna dos recortes al caminar y usa poses estáticas para los demás estados, además de efectos por código. El arma se orienta como trazo hacia el cursor. El Matón genérico ahora usa la nueva lámina (1536 × 1024), con reposo, marcha en cuatro direcciones, puñetazo, daño y muerte. Las clases avanzadas y los jefes reutilizan este personaje con tintes; todavía necesitan sus gráficos definitivos. Nicolás se conserva en public/assets/enemies/maton.png y en public/assets/enemies/nicolas/nicolas-original.png, y ya no se carga como enemigo.

Las siete armas tienen recortes individuales visibles en suelo y equipadas; también se extrajeron los iconos de botiquín y munición. tools/extract_neon.py contiene recortes no uniformes y limpieza del fondo oscuro conectado al borde. public/assets/asset-crops-v2.json documenta cada rectángulo. No se utiliza la lámina completa como arma. Los fotogramas extraídos tienen tamaños y poses irregulares; están centrados sobre lienzos transparentes comunes, sin interpolación. Quedan bordes oscuros y algunos destellos incorporados en la lámina; PNG separados con transparencia real mejorarían el acabado. El bate opcional de la lámina no se incorpora: el Matón conserva puñetazos.

AudioSystem.ts centraliza la carga y reproducción mediante Phaser. Hay siete disparos distintos, explosión de RPG, recarga, recogida, daño, eliminación y voz electrónica. Todos son WAV originales sintetizados localmente con tools/generate_audio.py, sin servicios externos y con licencia CC0 documentada en assets/audio/LICENSE.txt. CONTROLES permite ajustar EFECTOS con − y +, incluyendo silencio al 0%; el ajuste se conserva en este navegador. AudioSystem.voiceVolume ajusta el nivel relativo de la voz. El audio se habilita mediante la interacción inicial del usuario, según las políticas del navegador.

Typewriter.ts muestra el diálogo progresivamente cada 38 ms y emite una sílaba electrónica cada tres caracteres no vacíos. Enter o clic completa primero la frase y detiene el sonido; una segunda entrada continúa. El componente cancela temporizadores y sonido al cerrar la escena. Faltan gráficos definitivos de jefes, mobiliario, tiles y animaciones completas de Cervela. La banda sonora V0.3 se describe a continuación.

## Corrección de REINTENTAR

Causa reproducida antes del cambio: al morir con cámara en scroll (640,624), el panel de derrota tenía scrollFactor=0 y sus botones interactivos scrollFactor=1. Phaser comprobaba el clic en una posición distinta a la visible. El reintento anterior se había probado cerca del origen, donde no se manifestaba el error.

Los botones ahora usan scrollFactor=0. REINTENTAR usa scene.restart(), bloquea clics repetidos durante la transición y cada nueva partida reactiva explícitamente entrada y física. La salida de escena cancela temporizadores y tweens, limpia referencias y reinicia teclas. Phaser destruye los objetos y cuerpos de la partida anterior al cerrar la escena. No se añadieron manejadores globales por cada partida.

## Verificación

`npm test`: siete pruebas de sistemas y recursos: arsenal y recarga, conectividad de cada celda transitable, jefes y crecimiento de rondas, curación y estado nuevo, regresión de todas las estadísticas originales de armas, archivos gráficos y conservación de Nicolás, WAV válidos y diferenciados. `npm run build`: comprobación TypeScript y compilación Vite.

`npm run test:browser` ejecuta check.cjs contra GAME_URL (por defecto http://127.0.0.1:5174). Requiere Vite en ejecución y Playwright con Microsoft Edge. Si no hay Playwright local, utiliza el runtime disponible en este equipo.

Prueba automatizada en Edge: texto progresivo y voz durante escritura, Enter completa sin avanzar y detiene voz, segunda entrada inicia partida; Matón cargado y Nicolás excluido; disparos de las siete armas y sus texturas equipadas; eventos de audio para recarga, daño, eliminación y recogida; cuatro ciclos consecutivos de muerte y reintento con cámara desplazada. En cada ciclo se comprueban salud 100, ronda 1, pistola 10/80, inventario inicial, posición (240,320), contadores cero, tiempo reiniciado, destrucción de enemigos/proyectiles anteriores y capacidad de mover y disparar. También se comprueban MENÚ PRINCIPAL, ajuste de volumen, vuelta al diálogo sin manejadores Enter duplicados y ausencia de errores JavaScript.

Las pruebas de audio comprueban carga y llamadas de reproducción; el carácter contundente y agradable de los efectos necesita escucha humana con altavoces/auriculares. El posicionamiento del Matón y arma equipada se revisó en captura de ejecución (gameplay-v2.png). La prueba anterior verificó por avance acelerado el primer jefe en ronda 5; las reglas de ronda no se modificaron.

Pendiente de prueba manual: acabado de todos los fotogramas en movimiento, mezcla y percepción sonora en distintos equipos, balance en partidas prolongadas y todos los patrones de jefe. No se ha realizado una partida normal completa hasta ronda 5 ni una prueba de rendimiento de rondas muy altas.

## Actualización V0.3

Se conserva el proyecto y sus sistemas. Archivos principales modificados: src/main.ts (carga), src/scenes/Menu.ts (ilustración y volúmenes), src/scenes/Game.ts (movimiento, dash, música y reinicio), src/systems/AudioSystem.ts (efecto dash), tools/generate_audio.py, package.json y check.cjs (regresión adaptada a la posición nueva de los botones). Archivos nuevos: src/config/player.ts, src/systems/Dash.ts, src/systems/MusicManager.ts, tests/dash.test.ts y check-v03.cjs. Recursos nuevos en public/assets/music y public/assets/backgrounds; dash.wav en audio.

### Música

Los cuatro MP3 suministrados están disponibles y se copiaron sin conversión: Neon Noir para el menú (incluida su pantalla CONTROLES); Neon Combat, Combat Loop y Underground Thriller para partidas. La introducción queda sin música para escuchar el diálogo. MusicManager pertenece al juego y no se destruye al reiniciar una escena. Mantiene una sola instancia musical, detiene/destruye la anterior antes de reproducir otra y espera al desbloqueo de audio de Phaser mediante interacción del usuario. No se aplica ninguna modificación a la velocidad de las canciones.

JUGAR reinicia la sesión musical. Partida inicial: Neon Combat. Reintentos: Combat Loop → Underground Thriller → Neon Combat, repitiendo. Cada pista empieza desde cero y se reproduce en bucle. No cambia en rondas ni jefes. Al morir se desvanece durante 250 ms; un reintento o regreso al menú durante ese desvanecimiento cancela la pista anterior antes de iniciar la nueva. MENÚ PRINCIPAL reproduce Neon Noir. El menú inicialmente puede permanecer en silencio hasta el primer clic, según el navegador.

CONTROLES tiene ajustes independientes de EFECTOS y MÚSICA, guardados en este navegador. Los MP3 y la ilustración son aportados por el usuario; la licencia CC0 de audio/LICENSE.txt corresponde únicamente a los WAV sintetizados, no a estos MP3 ni a la ilustración.

### Fondo

La ilustración se copia íntegra a assets/backgrounds/menu.png; se comprobó que su hash coincide con el original. Se presenta con una escala uniforme que cubre 1280 × 720, y Phaser FIT adapta la pantalla conservando proporciones. Las opciones están a la derecha con sombreado, para dejar visible a Cervela. No se modificó ni regeneró la imagen.

### Movimiento y dash

PLAYER_SPEED en src/config/player.ts pasa de 220 a 253 px/s (+15%). No cambian enemigos, estadísticas de armas, tiempos globales ni animaciones. ESPACIO ejecuta un dash de 180 ms a 759 px/s (3×), con enfriamiento de 2000 ms desde su activación. WASD determina una de ocho direcciones normalizadas; sin WASD usa la última dirección de movimiento (abajo si todavía no hubo movimiento). La dirección queda fija durante el dash.

El dash usa el mismo cuerpo Arcade y colisionadores estáticos. Las paredes, mobiliario y límites lo bloquean; los accesos del mapa siguen abiertos como antes, sin añadir una mecánica de puertas. Se rechaza daño mientras el dash está activo, sin extender la ventana al terminar ni modificar el periodo de protección normal tras recibir daño. Suspende el disparo, conserva munición y salud, muestra estela y reproduce un sonido corto sintetizado. El resto del inventario permanece disponible. HUD: DASH LISTO / DASH RECARGANDO y barra. En pausa se detienen movimiento y reloj del dash; la entrada de dash durante pausa/derrota se descarta. La introducción no procesa dash. REINTENTAR crea un estado Dash nuevo, sin enfriamiento pendiente.

### Verificación V0.3

`npm test`: diez pruebas automáticas, con regresión de estadísticas y nuevos casos de velocidad, parámetros, ocho direcciones normalizadas, dirección fija, última dirección, cooldown, progreso y reinicio de dash. TypeScript y Vite compilan correctamente.

`npm run test:browser:v03`: contra GAME_URL (por defecto http://127.0.0.1:5174), con servidor local activo y Playwright/Edge. Comprueba fondo con escalas iguales, reproducción real reportada por Phaser, volúmenes independientes, silencio musical en introducción, secuencia de cuatro reintentos, ausencia de pistas simultáneas, desvanecimiento al morir, continuidad de la misma instancia musical entre ronda y jefe, velocidad normal 253 y dash 759. Ejecuta las ocho direcciones mediante teclado, daño durante y después del dash, dirección anterior, cooldown, bloqueo de disparo, paredes, mobiliario y límites. Comprueba pausa y reinicio de salud/inventario/dash, menú y nueva sesión desde Neon Combat. No se detectaron errores JavaScript. Se conserva check.cjs para las pruebas V0.2 de audio, diálogo, armas y cuatro reintentos.

La ilustración y los cuatro MP3 se compararon por SHA-256 con sus originales: copias idénticas. Captura del menú: menu-v03.png.

Pendiente de prueba manual: mezcla y volumen percibidos con altavoces/auriculares, continuidad audible del punto de bucle de cada MP3, sensación del dash en una partida prolongada y validación en otros navegadores/equipos. No se ha esperado una canción completa para escuchar su unión al bucle; se verificó la configuración loop de Phaser. El escenario actual no contiene puertas cerradas. No se han añadido nuevas mecánicas fuera de esta actualización.

## Actualización V0.4 — Brutalidad y supervivencia

Controles nuevos: G lanza el arma activa hacia el cursor; V ejecuta al enemigo normal aturdido más cercano dentro de 40 px. E permite recuperar el arma lanzada. Se conserva la música, su rotación, dash, inventario, botiquín, arsenal, jefes, rondas y reintento.

### Archivos

- src/systems/SurvivalSystem.ts (nuevo): estados/prioridades de IA normal, reserva exclusiva de armas, transferencia de munición, lanzamiento físico, aturdimiento y ambas ejecuciones.
- src/systems/CriticalHealth.ts (nuevo): barra de salud, advertencia, bordes y alerta sonora con intervalo mínimo.
- src/config/survival.ts (nuevo): parámetros de balance y multiplicadores de velocidad.
- src/scenes/Game.ts: integración, objetos que conservan el estado Gun, recogida atómica, inventario vacío, controles nuevos y reinicio/limpieza.
- src/scenes/Menu.ts: controles G/V y versión 0.4.
- src/systems/AudioSystem.ts, tools/generate_audio.py y nuevos WAV: lanzamiento, ejecución y alerta. Límite de tres efectos simultáneos por sonido; límite general de dieciséis para efectos secundarios, reservando las alertas y voz. La música no cuenta en esos límites.
- tests/survival.test.ts, tests/assets.test.ts y check-v04.cjs: pruebas de regresión, recursos y nuevas mecánicas. package.json: versión y script test:browser:v04.

### Comportamiento y parámetros

Los enemigos normales se mueven un 20% más rápido: Matón 126, Pandillero 102, Veterano 108, Blindado 78 y Élite 144 px/s. Se aplica NORMAL_ENEMY_SPEED_MULTIPLIER=1.2; BOSS_SPEED_MULTIPLIER=1 conserva las velocidades anteriores de los jefes. Cervela permanece en 253 px/s. No se modifican las estadísticas del arsenal.

Un Matón desarmado detecta armas a 160 px, comprueba una ruta por la cuadrícula y reserva el objetivo. Las prioridades son: muerto → objetivo de ejecución → aturdido → preparación de ejecución → ataque en curso → buscar/recoger arma → atacar/perseguir/esperar. No recoge durante aturdimiento, preparación ni una animación de ataque activa. El combate cercano tiene prioridad sobre buscar armas. Las otras clases conservan su ataque anterior, salvo el aumento de velocidad y las nuevas oportunidades de ejecución cuando están cerca.

Al recoger, el arma desaparece de la lista de objetos antes de transferirse; dos enemigos o el jugador no pueden reclamarla a la vez. El Matón conserva daño, cadencia, cargador, reserva, perdigones, dispersión, alcance y tiempos de recarga del arma. Apunta con una representación visible y solo dispara con línea de visión. Si agota cargador, recarga con su reserva finita; si agota toda la munición, busca otra arma o pelea cuerpo a cuerpo. Los puntos dentro de paredes/fuera del mapa se descartan.

G lanza físicamente la instancia del arma equipada, sin gastar munición. Viaja a 620 px/s hasta 360 px o el primer impacto. Colisiona con paredes y cae en una celda de suelo válida; conserva exactamente cargador y reserva al recuperarla. Si había segunda arma, queda activa; si no, el HUD muestra DESARMADO y todos los controles toleran inventario vacío. Puede lanzarse el RPG y las otras seis armas: no hay exclusiones de arsenal. El lanzamiento del RPG no dispara ni detona su proyectil. No se lanza durante dash, una ejecución propia, pausa, derrota o diálogo.

El impacto aturde a un enemigo normal durante 1500 ms: no se mueve, ataca, recoge ni prepara ejecuciones; aparece ★ ATURDIDO ★. Los jefes son inmunes a este aturdimiento y a V para conservar sus mecánicas especiales. No se les añade ninguna ejecución enemiga.

Los enemigos normales tienen 20% de probabilidad de preparar una ejecución a 48 px o menos. Preparación visible de 500 ms, con pose de ataque, destello y rótulo ¡EJECUCIÓN! · ALÉJATE. Un enfriamiento GLOBAL de 5000 ms entre oportunidades (incluso una tirada fallida) evita encadenamientos por varios enemigos o tiradas por cada fotograma. La ejecución se cancela al alejarse, romper línea de visión, hacer dash, herir/aturdir/matar al enemigo o iniciar una ejecución propia. Solo si persisten las condiciones inflige daño letal; se mantiene la protección del dash y de la ejecución propia.

V selecciona al aturdido normal más cercano a un máximo de 40 px y con línea de visión. Durante 500 ms bloquea movimiento, dash, disparo e interacciones, muestra EJECUTANDO y alterna poses provisionales de Cervela. Le da protección temporal, elimina al objetivo al finalizar, contabiliza la baja y aplica la probabilidad de botín anterior. Después devuelve el control. No puede comenzar durante recarga u otra ejecución.

La salud crítica comienza entre 1 y 25 puntos: barra roja, VIDA CRÍTICA y bordes discretos. Un aviso sonoro breve se repite como máximo cada 8000 ms mientras continúe la condición. No hay alertas al morir; un botiquín que supere 25 desactiva el aviso y detiene su sonido. Los estados, objetos lanzados, reclamaciones, ejecuciones y enfriamientos de alertas se limpian al reiniciar. Se utilizan relojes de partida que se congelan en pausa, evitando temporizadores de acciones que sigan atacando durante ella.

### Verificación y problemas corregidos

- TypeScript y Vite: compilación comprobada. Once pruebas de lógica/recursos pasan, incluida regresión de todas las velocidades normales, preservación de velocidades de jefes/Cervela y estadísticas de armas.
- check-v04.cjs (`npm run test:browser:v04`): velocidades; dos Matones reclamando un arma sin duplicarla; conservación de munición; daño correcto del arma recogida; ausencia de disparo a través de paredes; rechazo de arma en pared; G, caída y aturdimiento; aturdido que no recoge ni se mueve; recuperación con E; V, protección temporal, baja y devolución del control; advertencia enemiga y cancelación por dash/daño; ejecución letal tras preparación; alerta crítica limitada y curación; inmunidad de jefes a nuevas acciones; segunda arma y pausa; cuatro reintentos, con cámara desplazada. Sin errores JavaScript.
- Se ejecutaron también check-v03.cjs (música, ocho dashes, colisiones, pausa y cuatro reinicios) y check.cjs (diálogo, voz, arsenal y cuatro reinicios): pasaron sin errores JavaScript. Requieren servidor Vite activo y Playwright con Edge; GAME_URL permite cambiar el puerto, por defecto 5174.

Se corrigieron supuestos anteriores que siempre esperaban un arma equipada (HUD, recarga, cambio y disparo), que habrían causado errores al lanzar la última. Los objetos de arma ahora transfieren su munición en lugar de regenerar un cargador al recoger. La recogida del jugador también comprueba línea de visión para impedir recuperar armas a través de paredes. Un arma lanzada debe recuperarse aunque haya treinta objetos aleatorios: el límite anterior se conserva para generación aleatoria y no destruye las armas del jugador. Se conserva la corrección previa de los botones de derrota y se prueba de nuevo con cámara desplazada.

Todas las mecánicas solicitadas están implementadas. Las pruebas usan escenas y posiciones controladas y fuerzan alguna tirada aleatoria para verificar ejecuciones; no equivalen a una partida prolongada ni a evaluar su frecuencia natural. Pendientes de revisión manual: dificultad y justicia percibida, mezclado sonoro en combates densos, recorrido de búsqueda de armas en todas las habitaciones y actuación de las cinco variantes de jefe en partidas reales. Animaciones de ejecución y aturdimiento son provisionales con los recursos existentes; faltan fotogramas específicos para el acabado definitivo.

## Actualización V0.5 — Instinto de supervivencia

Se conserva el juego y las mecánicas anteriores. Nuevo control: X activa ÚLTIMA CALADA cuando su barra llega al máximo. F sigue curando 40 puntos y ahora el inventario admite dos botiquines (se empieza con uno, como antes).

### Navegación y detección

GridRoutes.ts construye componentes transitables y rutas completas de cuatro direcciones. Respeta las paredes y muebles del mismo mapa físico; no corta esquinas. Navigation.ts sigue los centros de las celdas usando el centro del cuerpo Arcade, en lugar del origen visual del sprite. Esto corrige la oscilación de la versión anterior, que recalculaba solo el siguiente paso y podía apuntar directamente al jugador a través de las esquinas de obstáculos.

Las rutas se reutilizan mientras el destino siga en la misma celda y se actualizan al cambiar de destino, con intervalo de 450 ms. Hay caché acotada a 256 rutas y presupuesto de cuatro planes por fotograma. Si un actor que debe moverse avanza menos de cuatro píxeles durante 750 ms, se reinicia su ruta. La separación local por cuadrícula evita que varios enemigos se queden empujando en un acceso; su fuerza está limitada para que no anule el avance. Se conservan los colisionadores del escenario y no se usan teletransportes. No se añaden colisiones sólidas entre enemigos que puedan bloquear permanentemente una puerta.

Perception.ts requiere proximidad Y línea de visión para adquirir a Cervela. Radios configurables: Matón 300, Pandillero 320, Veterano 340, Blindado 280 y Élite 360 px; jefes 360 px. Se comprueba cada 150 ms. Tras perder visión, solo persiguen la última posición observada durante un máximo de 3500 ms; al llegar a ella sin ver al jugador o agotarse la memoria, esperan. No actualizan mágicamente el objetivo detrás de paredes. Los patrones de ataque especiales de los jefes se conservan; también usan percepción y navegación nuevas.

Un Matón desarmado prioriza un arma accesible a 160 px, salvo amenaza visible inmediata a 65 px, aturdimiento, ataque en curso o ejecución. El objetivo reservado se mantiene para evitar oscilaciones. Las búsquedas se espaciaron a 650 ms y la conectividad se comprueba sin recorrer el mapa en cada fotograma. Un arma con cargador o reserva disponible no se abandona para buscar otra.

### Vida crítica, retratos y diálogos

Entre 1 y 25 de salud se muestra VIDA CRÍTICA grande en el HUD, barra roja intensa, borde rojo pulsante y retrato herido. La alerta sonora moderada conserva el intervalo mínimo de 8000 ms. Al curarse por encima de 25 o morir se apagan los efectos y se detiene el sonido.

Se extrajeron tres retratos de la nueva lámina mediante coordenadas explícitas, sin regenerarla ni deformar las imágenes: tools/extract_wounded.py y assets/portraits/wounded/crops.json. Son recortes no uniformes y conservan el fondo oscuro original; se escalan proporcionalmente por contención. No se utilizan la lámina entera ni sus retratos como sprites de gameplay.

Al entrar en estado crítico se elige una de las tres frases solicitadas. El diálogo dura unos tres segundos de juego, no pausa ni bloquea controles y tiene enfriamiento de veinte segundos entre entradas. No se repite mientras se permanezca en crítico. La tarjeta elige una esquina libre de Cervela, enemigos y proyectiles; si todas las opciones están ocupadas, se oculta ese fotograma para priorizar el combate. El retrato pequeño del HUD continúa visible mientras la salud sea crítica. Curarse corta el diálogo; volver a bajar antes del enfriamiento no lo reinicia.

### Dos botiquines y ÚLTIMA CALADA

Run ahora almacena medkits como número en lugar del booleano anterior. BOTIQUINES: 0/2, 1/2 o 2/2 se muestra permanentemente. La recogida respeta el máximo, F consume uno solo si falta salud y el máximo de vida sigue siendo 100.

Ultimate.ts lleva la carga y el tiempo. Veinte bajas normales únicas cargan la barra; una referencia débil impide acreditar dos veces al mismo enemigo sin retener a todos los muertos de rondas infinitas. Los jefes no aportan las bajas normales requeridas. Durante la ulti las bajas no precargan el siguiente uso; al terminar se vacía la barra.

X activa diez segundos de habilidad: cura de forma continua a cuatro puntos por segundo (máximo cuarenta durante toda la duración, sin superar 100), muestra temporizador, aura magenta discreta e indicador de curación. El daño enemigo se conserva: se puede morir con la ulti activa. La habilidad no añade invulnerabilidad; siguen existiendo únicamente las protecciones anteriores del dash y la ejecución V.

Mientras está activa permite disparar incluso con el cargador vacío, cancela la recarga en curso y no consume ni modifica cargadores ni reservas. Al terminar vuelven el consumo y la recarga normales. Dos armas del mismo ID, salvo RPG, disparan dos ráfagas simultáneas con su cadencia, daño, alcance, dispersión y perdigones originales. Incluye el rifle de precisión si ambos son iguales. Armas distintas o una sola producen el disparo habitual. El RPG tiene disparo simple, también con munición infinita; su daño de área y daño propio siguen activos. El inventario no duplica munición ni armas.

La barra permanece visible abajo a la izquierda y muestra ULTI LISTA — PRESIONA X al completarse. Al pausar se congelan reloj, curación y duración. X se descarta durante pausa/derrota y no se procesa en el diálogo inicial. Muerte y REINTENTAR limpian carga, efectos, rutas, percepción, diálogos, enfriamientos e inventario; la música sigue su secuencia independiente.

### Archivos y parámetros

Nuevos: src/config/instinct.ts; src/systems/GridRoutes.ts, Navigation.ts, Perception.ts y Ultimate.ts; src/ui/UltimateView.ts; tools/extract_wounded.py; tests/instinct.test.ts; check-v05.cjs; tres PNG de retrato y su manifiesto.

Modificados: Game.ts, SurvivalSystem.ts, CriticalHealth.ts, run.ts, Menu.ts, main.ts, package.json, tests/systems.test.ts y pruebas de navegador anteriores. Las pruebas antiguas usan el contador nuevo de botiquines; la prueba V0.4 sincroniza los cuerpos al preparar posiciones y deja pasar el intervalo de percepción antes de comprobar un disparo.

Los parámetros nuevos están en src/config/instinct.ts (detección, intervalos de ruta/percepción, memoria, diálogos, capacidad y ulti). Se conservan los parámetros de dash, arsenal y supervivencia en sus archivos anteriores. Los efectos de aura, doble arma y ejecución usan geometría y los sprites existentes: la lámina nueva es una ilustración de referencia con filas irregulares y textos, no un atlas uniforme de animaciones. Para un acabado definitivo siguen faltando fotogramas separados y transparentes de las acciones de Cervela.

### Verificación V0.5

Diecisiete pruebas automáticas de lógica y recursos pasan: arsenal, munición, mapa, jefes, dash, velocidades, dos botiquines, bajas únicas, reglas de disparo doble, curación exacta y fin a los diez segundos, muerte sin resurrección, caché de rutas y rechazo de celdas sólidas/zonas desconectadas. TypeScript y Vite compilan.

`npm run test:browser:v05` usa Playwright y Edge con GAME_URL (por defecto http://127.0.0.1:5174) y Vite activo. Comprueba detección a través de paredes/distancia, visión válida y memoria de posición; un Matón que rodea físicamente tres muebles para recoger un arma, sin cruzar celdas sólidas ni recalcular cada fotograma; bloqueo físico provocado y posterior recuperación de ruta por un acceso, sin teletransporte; cinco enemigos superpuestos que avanzan.

También comprueba capacidad de botiquines y no consumo a salud completa, alerta grande/retrato/diálogo y enfriamiento de reentrada, veinte bajas únicas mediante el sistema real de daño, X, curación observada a 4/s, disparo con cargadores vacíos sin alterar munición, doble arma idéntica, disparo simple con categorías distintas y RPG, pausa, fin de habilidad, vuelta al consumo de munición, muerte durante ulti y tres reintentos. La finalización se acelera controlando el reloj para verificar el borde de diez segundos; las reglas temporales también tienen pruebas unitarias exactas. No se detectaron errores JavaScript. Captura revisada: critical-v05.png.

Las regresiones V0.4 (lanzamientos, ejecuciones, alerta y reintentos), V0.3 (música, dash, colisiones y reintentos) y V0.2 (diálogo, audio, arsenal y reinicio) se ejecutan con sus scripts conservados.

Pendiente de revisión manual: navegación en una partida prolongada por todas las habitaciones, congestión de rondas muy altas, frecuencia natural y equilibrio de ÚLTIMA CALADA, claridad de la alerta con combate intenso y otros tamaños de pantalla, y mezcla sonora en distintos equipos. Las pruebas con posiciones controladas verifican casos reproducibles y no garantizan ausencia de todo atasco posible. No se han añadido sistemas fuera de esta actualización.

## Actualización V0.6 — Rondas dinámicas, Última Calada y El Torturado

### Rondas y descanso

RoundState.ts define la secuencia: Exterminio, Supervivencia, Exterminio, Supervivencia, Boss, repitiendo indefinidamente. Exterminio exige 15 enemigos en ronda 1, 20 en ronda 3, 25 en ronda 6 y 30 en ronda 8; cada nueva aparición del modo aumenta el objetivo en cinco. Se conserva el escalado previo de vida/daño y la aparición de clases avanzadas. RoundDirector mantiene como máximo 24 enemigos vivos, también cuando el objetivo de exterminio sea mayor; los pendientes se incorporan al liberar espacio. Solo se completa con objetivo cumplido, cero pendientes y cero enemigos vivos de esa ronda.

Supervivencia dura 90 s en ronda 2, 120 en ronda 4, 150 en ronda 7 y 180 en ronda 9; aumenta treinta segundos en cada aparición posterior. Genera grupos cada 1700 ms, con máximo 24 enemigos simultáneos. En este modo conocen la posición actual de Cervela aunque esté lejos o detrás de obstáculos; la navegación continúa siendo por rutas válidas y los disparos siguen requiriendo línea de visión. Los Matones pueden recoger armas en su camino con sus prioridades y reservas anteriores. El modo termina por tiempo sin exigir bajas: retira enemigos y proyectiles sin conceder bajas, carga de ulti ni botín por la retirada.

Cada quinto número es Boss y aparece únicamente El Torturado, sin acompañantes. Hasta añadir nuevos personajes, todas las apariciones reutilizan sus gráficos con escalado de estadísticas. Las tablas de variantes anteriores permanecen en el código histórico, pero el director nuevo no las genera.

Todos los modos llevan a diez segundos de descanso. El jugador puede moverse, recoger, cambiar armas, recargar y usar sus controles habituales. Los objetos, cuerpos decorativos y el mapa permanecen; no aparece ningún enemigo durante el descanso. Las armas lanzadas en vuelo pueden aterrizar y recuperarse. No hay regeneración automática de salud entre rondas. Se muestran modo/objetivo o tiempo y la cuenta SIGUIENTE RONDA EN. Rondas y descanso usan el reloj de partida, congelado durante pausa y diálogo de jefe, sin TimerEvents de aparición que sobrevivan a la ronda.

### Presentación de ÚLTIMA CALADA

UltimatePresentation.ts añade exclusivamente una entrada de aproximadamente 700 ms reales de juego activo: retrato especial recortado de la lámina, título ÚLTIMA CALADA, frase exacta «Hagámoslo una vez más», sonido sintetizado local, aura magenta y cámara lenta a 35%. No bloquea controles ni reinicia la pista musical. El panel se desvanece durante sus últimos 240 ms.

Después comienza la habilidad original de diez segundos, con curación de 4 puntos/s, munición infinita y las mismas reglas de disparo doble. Sus parámetros de V0.5 no se modificaron. El ralentizado aplica a física, reloj, animaciones, temporizadores y efectos del escenario; no modifica el audio ni la velocidad musical. Al terminar se restauran todas las escalas. Pausa congela también la presentación. Morir durante la presentación la cancela y no activa la ulti después. Si el inicio del diálogo del jefe coincide con una presentación pendiente, se completa su activación antes del diálogo, cuyo reloj congelado conserva los diez segundos para la pelea.

### El Torturado

Nuevo controlador bosses/Torturado.ts. Primera aparición, ronda 5: 450 HP, velocidad 144,9 px/s (15% más que el Matón normal de V0.4), daño 20 por perdigón efectivo, cinco perdigones de escopeta, cargador de cuatro y recarga de 1800 ms. Tiene ataque cercano de 28, distancia preferida de 240 px y alcance de 650. Un disparo normal avisa durante 350 ms; la descarga especial de ocho perdigones avisa durante 700 ms con rótulo ¡DESCARGA! y destello. Apunta a la posición capturada al preparar, permitiendo esquivar. Usa línea de visión y colisionadores de proyectiles.

Persigue activamente, cambia de ruta al perder visión, se retira si está demasiado cerca y realiza avances rápidos ocasionales por navegación, sin atravesar paredes. Recarga y se mueve; no recibe invulnerabilidad. Cada aparición posterior aumenta HP un 25%, daño un 12% y velocidad un 4% respecto a la base por nivel de jefe. Los valores están en config/dynamicRounds.ts. No se le puede aturdir ni ejecutar con la ejecución normal V; Última Calada sí puede dañarlo y Cervela sigue siendo vulnerable.

BossDialogue.ts reutiliza Typewriter y su voz electrónica. La pelea queda detenida mientras se muestran, una sola vez por aparición, las tres líneas solicitadas (dos de El Torturado y la respuesta de Cervela), con retratos separados. Enter/clic completa la línea antes de pasar a la siguiente. Al terminar se reactivan física y controles y se muestra EL TORTURADO — 450/450 HP con barra grande. La música continúa durante la introducción y la pelea.

Los recursos se extrajeron de Panel retro de sprites y jefe neon.png (1536×1024) mediante rectángulos explícitos: tools/extract_torturado.py, assets/bosses/torturado/crops.json y assets/portraits. No se utiliza el panel completo como personaje. Los fotogramas se acolchan en lienzos 144×144 y se escalan uniformemente; movimiento/recarga tienen una sola pose útil, disparo tiene dos y muerte cuatro. Se quitaron las etiquetas del panel de los recortes. La limpieza del fondo oscuro conserva el interior del abrigo, pero quedan bordes/sombras y algunas irregularidades de recorte: las animaciones son provisionales y necesitan PNG individuales con transparencia real para acabado definitivo. El original no se sobrescribe ni se regenera.

### Botín y probabilidades

Loot.ts separa estrictamente ambos casos. Cada botín normal generado tiene una tirada del 1% para ser RPG. La probabilidad previa de que una baja normal genere botín (17%) sigue intacta; 1% no significa que uno de cada cien enemigos garantice un RPG. El código V0.5 realmente tenía 3,5% en la selección de arma, pese a la referencia de 1% en la solicitud; V0.6 aplica el 1% pedido al botín normal.

Cada muerte del jefe genera munición y un arma ordinaria utilizable garantizadas, con 45% de posibilidad de botiquín y exactamente una tirada especial independiente del 10% para un RPG adicional. El arma ordinaria garantizada se elige entre las otras seis, por lo que no constituye una segunda tirada de RPG. Un WeakSet y la eliminación única del enemigo evitan premios duplicados si se procesa de nuevo su muerte. Los puntos de recompensa se ajustan a suelo válido. Se muestra BOSS DERROTADO y empieza el descanso de diez segundos para recoger.

### Archivos V0.6

Nuevos: src/config/dynamicRounds.ts; src/systems/RoundState.ts, RoundDirector.ts, Loot.ts y UltimatePresentation.ts; src/bosses/Torturado.ts y torturadoAssets.ts; src/ui/BossDialogue.ts; tools/extract_torturado.py; tests/rounds.test.ts; check-v06.cjs; recortes del jefe y retratos especiales; audio/ultimate.wav.

Modificados: Game.ts, Perception.ts (persecución constante solo en supervivencia y del jefe), AudioSystem.ts, main.ts, Menu.ts, tools/generate_audio.py, tests/assets.test.ts, package.json y scripts anteriores de regresión. La prueba V0.5 espera la presentación antes de comprobar la habilidad; la V0.3 avanza el nuevo diálogo al verificar una ronda de jefe.

Se corrigió una condición de cierre de Phaser: al reintentar, el mundo Arcade puede haber sido retirado antes de los callbacks de limpieza. La restauración de escalas ahora tolera plugins/actores ya cerrados. Se limpian enemigos, proyectiles, colisionadores, temporizadores, diálogo, presentación y estado de ronda al morir. También se eliminan colisionadores de enemigos y proyectiles al destruirlos para no acumularlos en supervivencia prolongada.

### Verificación V0.6

TypeScript y Vite: compilación comprobada. `npm test`: 23 pruebas aprobadas, incluyendo secuencia/objetivos/tiempos exactos, pendientes de exterminio, fin de supervivencia, diez segundos de descanso, pausa de inicio de jefe, límites de las probabilidades 1%/10%, una sola tirada especial y estadísticas iniciales/escalado de El Torturado. Se conservan las pruebas de arsenal, dash, inventario, navegación y habilidad V0.5. Los recortes del jefe se comprueban por existencia y dimensiones de lienzo.

`npm run test:browser:v06`: Playwright/Edge, con Vite activo y GAME_URL (por defecto http://127.0.0.1:5174). Comprueba ronda 1 con 15 enemigos, objetivo completo y recogida durante descanso, paso a supervivencia, conocimiento del jugador a distancia/sin visión, límite de vivos, fin y retirada sin bajas; jefe único, diálogo escrito antes del combate, HP450/barra, movimiento, escopeta, recarga, descarga advertida de ocho proyectiles, melee y muerte con recompensa única. Comprueba presentación de ulti, retorno de escalas, duración original, curación, doble disparo con inventario vacío sin modificar munición y continuidad de la misma pista. Verifica muerte durante la habilidad y durante la presentación, tres reintentos desde ronda 1, regreso al menú y cierre forzado durante el diálogo sin duplicar eventos. Sin errores JavaScript detectados.

Regresiones ejecutadas: check-v05.cjs (navegación, botiquines y ulti), check-v04.cjs (lanzamientos/ejecuciones), check-v03.cjs (música/dash/colisiones) y check.cjs (diálogo/audio/arsenal/reinicio). Las pruebas usan posiciones preparadas, daño controlado y saltos del reloj para cubrir rondas largas; no son una partida normal completa hasta ronda 5. Los límites temporales exactos también se verifican en pruebas unitarias, sin esperar noventa segundos por ejecución.

Capturas revisadas: torturado-intro-v06.png, torturado-fight-v06.png, ultimate-presentation-v06.png y boss-loot-v06.png; hoja de comprobación de recursos: torturado-preview.png.

Pendiente de revisión manual: dificultad real de quince enemigos iniciales, balance de la pelea y de las repeticiones posteriores, rendimiento en supervivencia prolongada, sensación de la cámara lenta y calidad de la mezcla de audio en distintos equipos. Las probabilidades se verifican mediante sus umbrales y la única tirada programada; no se garantiza un resultado específico en una partida. Las animaciones del jefe siguen siendo provisionales por las limitaciones del panel gráfico suministrado. No se añadió generación procedural ni personajes nuevos.

## Actualización V0.6.1 — Buff, dash y menú animado

Esta sección reemplaza las reglas históricas de carga/curación/disparo doble descritas para V0.5 y V0.6. Rondas, El Torturado, enemigos, mapa, inventario y música mantienen su configuración.

### Última Calada: impactos y dos armas diferentes

La carga ya no depende de bajas. Cuarenta impactos válidos completan la barra (2,5% cada uno), incluyendo impactos contra jefes. Game asigna un identificador compartido a los perdigones de cada disparo y una referencia débil de objetivos alcanzados. Un disparo de escopeta cuenta una vez por enemigo, aunque acierten varios perdigones; una explosión cuenta una vez por cada enemigo vivo alcanzado. Paredes, muebles, cadáveres, ejecuciones y retirada de enemigos no cargan la barra. Un impacto mortal sí cuenta porque alcanzó a un enemigo vivo.

La carga se conserva entre rondas. X consume la barra al iniciar la presentación. Durante la presentación y el efecto no se acumula nueva carga; los proyectiles disparados bajo la habilidad tampoco cargan si impactan después de terminar. Muerte, reintento y abandono reinician la carga.

Se conserva la presentación de 700 ms, el retrato, la frase «Hagámoslo una vez más», aura y diez segundos de habilidad. La curación es ahora 10 HP/s, gradual y con máximo 100. Usa tiempo transcurrido en vez de contar fotogramas: el reloj de habilidad no utiliza el límite de delta empleado por movimiento/proyectiles. Se comprobó también un fotograma simulado de un segundo en la escena real. Pausa y diálogo de jefe siguen congelando el reloj. No se añade invulnerabilidad: daño letal mata durante la habilidad.

WeaponCadence.ts usa un reloj independiente por instancia de arma. Durante la habilidad dispara ambas armas aunque sean diferentes, incluyendo RPG. Cada una conserva daño, intervalo, alcance, dispersión, perdigones, velocidad de proyectil y sonido propios. El subfusil no acelera la pistola ni la pistola acelera el RPG. Se conservan las velocidades anteriores: 950 px/s para proyectiles ordinarios y 490 px/s para cohetes. Fuera de la ulti vuelve a disparar únicamente la seleccionada.

No se consumen cargadores ni reservas durante la habilidad, y no se requiere recarga. Al empezar el efecto (tras la presentación), se guarda la munición de las armas equipadas; al terminar se restaura ese estado. La munición recogida legítimamente se conserva como ganancia, sin duplicarla. Lanzar o sustituir un arma retira su referencia del registro, para no regenerar recursos a un arma que pasó al suelo o a un enemigo. Si se recoge otra durante la habilidad, se conserva la munición que traía al entrar al inventario. Esto mantiene las transferencias de armas y la recogida existentes, sin fabricar cargadores ni deshacer consumos de otros propietarios.

### Dash

DASH_COOLDOWN pasa de 2000 a 1200 ms en config/player.ts. Siguen siendo 180 ms de duración, velocidad x3, ocho direcciones normalizadas, última dirección de movimiento, estela, sonido, colisiones e invulnerabilidad breve. No se acumulan cargas. El HUD calcula la barra con la constante nueva.

### Video del menú

Se copia gemini_generated_video_e9a3b7fd.mp4 sin conversión a public/assets/video/menu.mp4; se comparó su SHA-256 con el original. Metadatos observados en Edge: 1280×720 y aproximadamente 10,005 segundos. En los fotogramas revisados no aparece un título integrado; se conserva una única rotulación del juego por encima del video.

MenuVideo.ts crea una textura de video dentro del canvas Phaser, con autoplay, loop, muted, volumen cero y playsinline. No se incorpora su audio al gestor de sonido. Neon Noir continúa como audio del menú y los ajustes de música/efectos se conservan. Se escala uniformemente, manteniendo proporciones; el canvas FIT sigue adaptándose a la pantalla. El video no tiene área interactiva ni controles nativos y no intercepta botones.

El fondo estático anterior permanece debajo como alternativa durante la carga o si falla/rechaza la reproducción. Se simula un rechazo de autoplay en la prueba automatizada y se verifica que la imagen y JUGAR siguen funcionando. Al salir del menú se pausa el elemento, se retira su fuente y se elimina su textura del gestor para liberar recursos; al volver se crea una reproducción nueva. También se detiene al entrar en CONTROLES; Neon Noir sigue siendo música de esa sección del menú.

### Pausa y salida

ESC muestra REANUDAR y MENÚ PRINCIPAL. Al elegir salir aparece la confirmación «¿Seguro que quieres abandonar la partida? Perderás tu progreso actual.», con SÍ, SALIR y CANCELAR. Cancelar regresa a la pausa y no cambia reloj, salud, munición, carga, duración de ulti ni estado de ronda. ESC desde la confirmación también la cancela manteniendo la pausa; desde el panel de pausa reanuda.

La pausa congela física, reloj, temporizadores, tweens y animaciones de actores; las teclas de acción pulsadas durante ella no se acumulan para ejecutarse al reanudar. El panel está encima de las presentaciones, incluido si se pausa durante la entrada de Última Calada. Reanudar mediante botón espera a que se suelte el clic para no convertirlo accidentalmente en un disparo.

Confirmar limpia enemigos, proyectiles, colisionadores, temporizadores, presentación, ulti, dash, ejecuciones y estado de ronda, detiene combate y vuelve al menú con Neon Noir y el video. Se probó durante supervivencia y contra El Torturado, incluida una presentación de ulti pendiente. El cierre conserva la protección de ciclo de vida para plugins físicos ya retirados por Phaser. Reintentar desde derrota sigue comenzando en ronda 1 sin refrescar.

### Archivos V0.6.1

Nuevos: src/weapons/WeaponCadence.ts; src/ui/MenuVideo.ts y PauseMenu.ts; tests/buff.test.ts; check-v061.cjs; public/assets/video/menu.mp4.

Modificados: src/systems/Ultimate.ts y UltimatePresentation.ts; src/scenes/Game.ts y Menu.ts; src/ui/UltimateView.ts; src/systems/SurvivalSystem.ts (transferencia del arma lanzada); src/config/instinct.ts y player.ts; tests/instinct.test.ts y dash.test.ts; package.json y suites de navegador previas. Las pruebas V0.5/V0.6 se adaptaron a los cambios intencionales de equilibrio, y los clics automáticos esperan el registro de los nuevos controles de Phaser.

Parámetros principales: ULTIMATE_HITS=40, ULTIMATE_DURATION=10000 y ULTIMATE_HEAL_PER_SECOND=10 en config/instinct.ts; DASH_COOLDOWN=1200 en config/player.ts. Las estadísticas de armas no se cambiaron.

### Verificación V0.6.1

TypeScript y Vite compilan. `npm test`: 27 pruebas pasan, incluyendo carga/deduplicación, cadáveres, proyectiles disparados durante ulti que llegan tarde, curación a varios pasos de tiempo, todas las combinaciones de doble arma, restauración de recursos, intervalos 260/90 y 260/1500 ms, nuevo cooldown y regresiones de mapa/rondas/jefe/arsenal.

`npm run test:browser:v061` requiere Vite activo, Playwright y Microsoft Edge. GAME_URL permite cambiar el puerto; por defecto usa http://127.0.0.1:5174. Comprueba video real silenciado, bucle mediante avance al final, proporciones, título único, ausencia de captura de clics, Neon Noir, liberación de elemento y textura al jugar y recreación al volver. Comprueba alternativa estática ante rechazo simulado de autoplay.

En la escena real prueba seis perdigones como un acierto, pared/cadáver sin carga, explosión sobre dos enemigos incluyendo jefe, cuarenta impactos reales, consumo de barra al activar y conservación de carga parcial al cambiar de ronda. Comprueba 10 HP/s con espera real y con delta de un segundo, armas distintas con cadencias separadas, pistola + RPG y velocidades propias, munición sin consumo y vuelta al consumo al finalizar, dash de 1200 ms sin acumulación. Comprueba pausa/cancelación sin cambios de estado, panel sobre la presentación, abandono en supervivencia/jefe, muerte durante ulti y tres reintentos. Sin errores JavaScript detectados.

También pasaron las suites de integración anteriores de rondas/jefe, navegación/botiquines, lanzamientos/ejecuciones, música/dash y diálogo/audio/arsenal, adaptadas al equilibrio nuevo. Las pruebas de integración preparan posiciones y aceleran algunos relojes; no equivalen a una partida prolongada completa.

Capturas revisadas: menu-v061.png, ultimate-v061.png y pause-confirm-v061.png. Pendiente de revisión manual: dificultad y rendimiento con combinaciones intensivas (especialmente doble RPG), percepción de mezcla sonora y continuidad del bucle de video, y compatibilidad de autoplay/códecs en otros navegadores/equipos. El rechazo de autoplay sí se cubre mediante simulación. No se alteraron rondas, estadísticas de jefe, generación de mapa ni música para compensar el buff.

Con las dependencias ya instaladas en este equipo, también se puede arrancar directamente desde PowerShell dentro de esta carpeta:

```powershell
.\node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5174
```

## Actualización V0.6.2 — Supervivencia extrema

Los valores de esta sección sustituyen los de equilibrio de versiones anteriores. Se siguen las instrucciones escritas: 20 HP/s, doce segundos, 40% de reducción y cuarenta impactos. Los textos incrustados en la lámina gráfica tienen otras cifras y se consideran referencia visual, no configuración del juego.

### Última Calada y daño recibido

ULTIMATE_DURATION=12000, ULTIMATE_HEAL_PER_SECOND=20 y ULTIMATE_DAMAGE_REDUCTION=0.40 en src/config/instinct.ts. Se conservan los cuarenta impactos válidos, deduplicación de perdigones/explosiones, música, presentación, retrato, «Hagámoslo una vez más», aura, munición infinita y relojes de disparo independientes para cualesquiera dos armas.

La curación continúa siendo gradual por tiempo transcurrido, con vida máxima 100, y no repara el chaleco. No se añade invulnerabilidad. La ruta de daño aplica primero la reducción del 40% cuando la habilidad está activa, después absorbe con protección y finalmente resta la salud sobrante. Ejemplo: daño 50 → 30 durante ulti; con chaleco 25, se agota y pasan cinco a la salud. Un golpe suficientemente grande sigue matando. La base de autodaño de explosiones existente se conserva y el daño que llegue a Cervela pasa por la misma ruta de mitigación/absorción.

### Chaleco antibalas

Nuevo objeto CHALECO ANTIBALAS, recogible con E y con las mismas comprobaciones de distancia y línea de visión. Se empieza sin protección. Recogerlo equipa 50 puntos; otro chaleco repone hasta 50 si estaba dañado o agotado, sin sumar cantidades ni gastar ranuras de armas/botiquines. Con protección intacta se deja el objeto en el suelo y la interacción puede elegir otros objetos elegibles cercanos.

No tiene temporizador ni regeneración. Botiquines y ulti solo curan salud. Al recibir daño se consume primero la protección; si se acaba, el sobrante entra en salud. Con cero ya no protege. La barra azul y CHALECO 50/50, 25/50 o 0/50 se actualizan desde la llamada de daño o recogida, sin esperar otro fotograma.

Los enemigos normales hacen una tirada adicional del 5% al morir; los jefes, una del 25%. Un registro débil por enemigo impide repetir recompensas, incluso si se procesa otra vez la muerte. La retirada al terminar supervivencia no se considera una baja y no genera chalecos. No se garantizan por ronda ni forman parte de los cinco objetos iniciales. Se colocan sobre suelo válido con lootPoint. Las recompensas ordinarias y la tirada especial de RPG del jefe permanecen independientes e intactas.

Parámetros en src/config/armor.ts: ARMOR_CAPACITY=50, NORMAL_ARMOR_DROP_CHANCE=0.05 y BOSS_ARMOR_DROP_CHANCE=0.25. La tirada de botín admite un generador inyectado para pruebas, sin modificar Math.random global de Phaser (que también crea los identificadores de sus texturas).

Sprite: se extrae el chaleco azul de HUD cyberpunk en pixel art.png (1536×1024), rectángulo (106,390)-(184,475). tools/extract_armor.py elimina el fondo oscuro conectado al borde y reduce proporcionalmente con vecino más cercano sobre un lienzo transparente 32×32. Archivo final: public/assets/items/armor.png; coordenadas y método en armor-crop.json. No se utiliza la lámina completa ni se altera el original.

### HUD compacto y transparente

Se elimina el rectángulo opaco superior de 1280×84 y se centraliza la interfaz en CombatHud.ts. Salud y protección usan barras compactas con contorno y fondos de baja opacidad; el resto son textos con contorno/sombra, sin franja transversal.

- Izquierda: CERVELA/vida, barra rosa, barra azul debajo, protección numérica, enemigos y ronda/objetivo.
- Centro: arma, munición, botiquines y ranura seleccionada.
- Derecha: estado y barra de dash.
- Abajo a la izquierda: la barra existente de Última Calada.

Se conserva la vida del jefe, el aviso crítico, retrato y diálogo; se ajustan posiciones para no superponerlos al nuevo HUD. CriticalHealth deja de crear una segunda barra de vida. Los adornos y textos no tienen áreas de entrada, por lo que no bloquean el apuntado ni los clics.

Las posiciones usan el espacio base 1280×720 y setScrollFactor(0); Phaser FIT escala los grupos proporcionalmente. Se revisaron 1280×720 y una ventana 960×720. En relaciones de aspecto distintas puede haber bandas fuera del canvas para conservar proporciones; no pertenecen al HUD ni ocultan el escenario.

### Menú animado conservado

El archivo y el código de reproducción del menú anterior permanecen intactos, con loop, silencio, volumen cero, playsinline, alternativa estática y Neon Noir. Se comparó public/assets/video/menu.mp4 con el original anterior mediante SHA-256: idéntico. El MP4 nuevo adjunto no sustituye al que ya funciona, siguiendo expresamente el apartado 5. Menu.ts solo actualiza el rótulo de versión.

### Archivos V0.6.2

Nuevos: src/config/armor.ts, src/systems/Armor.ts, src/ui/CombatHud.ts, tools/extract_armor.py, public/assets/items/armor.png y armor-crop.json, tests/armor.test.ts y check-v062.cjs.

Modificados: src/config/instinct.ts; src/systems/run.ts, RoundDirector.ts y CriticalHealth.ts; src/scenes/Game.ts y Menu.ts; src/main.ts (carga del chaleco); tests/instinct.test.ts y buff.test.ts; suites de navegador V0.5/V0.6/V0.6.1 (valores nuevos); package.json y README. MenuVideo.ts, el MP4 del menú, las pistas musicales, las estadísticas de armas, el mapa y los patrones del jefe no se modificaron.

### Verificación V0.6.2

TypeScript y Vite: compilación comprobada. `npm test`: 33 pruebas aprobadas. Casos nuevos: capacidad/reposición sin acumulación, absorción antes de salud, desbordamiento, reducción del 40% antes del chaleco, daño letal con ulti, no reparación por curación, duración de doce segundos y 20 HP/s, límites de tiradas 5%/25% y una llamada de azar por intento, PNG de 32×32. Se actualizan las pruebas de tiempo de ulti y se conservan las de cuarenta impactos, cadencias, munición, navegación, rondas, arsenal y jefe.

`npm run test:browser:v062` usa Playwright/Edge con servidor Vite activo y GAME_URL (por defecto http://127.0.0.1:5174). Comprueba el menú original silenciado/loop/Neon Noir; HUD sin rectángulo superior opaco, protección debajo de salud, grupos sin solaparse y sin entrada decorativa; recogida con E, bloqueo con chaleco lleno, reposición parcial y actualización inmediata de barra; salud/absorción/sobrante, botiquín sin reparación, ulti real 20 HP/s y comprobación con un delta de un segundo, reducción 40%, fin del efecto y muerte con suficiente daño.

Las tiradas forzadas de pruebas verifican un solo chaleco por enemigo y por jefe, posición accesible y sprite 32×32. La prueba de jefe fuerza también la recompensa de RPG y comprueba que coexisten, junto a munición y arma normal. Se comprueban retirada sin botín, descanso, supervivencia, jefe único y diálogo, tres reintentos (salud 100, protección 0, carga 0), regreso al menú y dos tamaños de ventana. Sin errores JavaScript detectados.

También pasaron las regresiones V0.6.1 (impactos/cadencias/menú/pausa), V0.6 (rondas/jefe/recompensas), V0.5 (navegación/botiquines/ulti) y V0.4 (lanzamientos/ejecuciones/dash). Las probabilidades se verifican por sus umbrales y tiradas únicas; no se garantiza una frecuencia exacta en una partida particular. Los escenarios de integración usan posiciones preparadas y saltos de reloj para no esperar cada ronda completa.

Capturas revisadas: hud-v062.png, hud-boss-v062.png y hud-small-v062.png. Pendiente de revisión manual: equilibrio en partidas prolongadas, cantidad de objetos acumulados en rondas muy altas, legibilidad en más tamaños/equipos y percepción de audio durante combates densos. No se introdujeron temporizadores de chaleco ni sistemas adicionales fuera de la solicitud.


## Versión 1.2 — progreso permanente

MEJORAS abre desde el menú principal. HC es un saldo compartido; cada protagonista tiene seis mejoras independientes. Se guardan en `hotline-permanent-v1` de localStorage al ganar o gastar. Morir/reintentar nunca borra este guardado. Si el almacenamiento no está disponible, el menú avisa y permite jugar con progreso en memoria.

Las bases se calculan al crear una partida: base → permanentes → cartas → habilidad. El daño de fuego permanente multiplica el daño temporal: daño del arma × (1 + bono permanente) × multiplicador de cartas × habilidad × cercanía/crítico. No aumenta puños ni armas melee. Las cartas de vida conservan sus cinco niveles y +100 HP, sumados a la Vitalidad permanente (máximo combinado 300 HP). Regeneración y duración temporal de Calada se suman a la permanente. Tryhard mantiene el total máximo de 14 s.

Reflejos permanente y cartas suman reducción del dash normal, limitada a 58% (18% + 40%). El dash especial Tryhard parte de 500 ms, aplica solo Reflejos permanente (mínimo técnico 400 ms; con todas las compras: 410 ms). Las cartas siguen afectando el dash normal. La reducción total de daño conserva el límite global de 75% al combinar chaleco y definitiva.

Configuración de costes, recompensas y niveles: `src/config/permanent.ts`. Guardado versión 1: campos faltantes de versiones previas se completan y todos los números se validan; los cambios futuros de esquema deben migrarse en `migratePermanent` antes de subir la versión. No se toca el guardado de música, efectos ni otros sistemas.


## Versión 1.3 — mando y calles

OPCIONES → CONTROLES contiene pestañas de teclado/ratón y MANDO PS4. Zona muerta radial inicial 0,18, ajustable; asistencia opcional apagada por defecto, con intensidad ajustable. Las preferencias se guardan en `hotline-pad-v1`. Los mandos con mapeo estándar del navegador funcionan sin asignación manual. Para dispositivos sin ese mapeo hay asistentes de botones y ejes/inversión. Pulsa un botón del mando si el navegador todavía no lo muestra.

Cruceta navega; cruz confirma; círculo vuelve. En combate: izquierdo mueve, derecho apunta, R2 dispara, L2 dash, R1 cambia arma, L1 lanza, cruz recoge, círculo ejecuta, cuadrado recarga, triángulo activa definitiva, OPTIONS pausa y SHARE usa botiquín. El último ángulo del stick derecho se mantiene al centrarlo. Teclado y ratón siguen disponibles tras desconectar el mando.

Las calles usan materiales independientes de 32×32, asfalto oscuro, veredas gris violáceo y marcas estáticas calculadas por coordenadas globales; colisiones y rutas permanecen. Consulta `VALIDACION-1.3.md` para archivos y resultados. Pruebas de mando automatizadas con Gamepad API simulada; comprobación física USB/Bluetooth pendiente.


## Versión 1.4 — expansión y modo de pruebas

Se incorporan 16 arquetipos, perro con embestida anticipable, encuentro Incendiario controlado, vehículos Aveo/Spark/Lanos, Tío Aceite, 24 cartas temporales, cambios por nivel, Segunda elección permanente, banners de definitiva de 2,25 s, retrato HUD ampliado y notas de actualización.

Tío Aceite utiliza valores **provisionales, sin precio aprobado**: cura 40 HP, gratis, hasta dos porciones por puesto/run. No añade botiquines ni repara chaleco. Configuración en `src/config/aceite.ts`.

ACCESO RESTRINGIDO acepta PROJECT507. Habilita inmortalidad, copia temporal de mejoras con 9.999 HC iniciales y rondas 1–10. Todo permanece exclusivamente en memoria durante esa página; recargar descarta las pruebas y conserva el guardado normal. No es un sistema de autenticación real.

Las cartas nuevas se definen junto a las anteriores en `UpgradeCatalog.ts`; los efectos de supervivencia se gestionan en `RunPerks.ts`. Nicolás puede recibir Tiempo prestado, con límite absoluto de 14 s, y no recibe Recuperación extrema de Calada. Sed de sangre lo cura 2/3/4 HP absolutos por baja, frente a 3/5/7 de Cervela, con 1 s de enfriamiento. Blindaje ahora otorga 25 puntos por nivel comprado. Bolsillos profundos aumenta la reserva recibida y nunca cambia el cargador.

La invulnerabilidad del dash sigue siendo de 180 ms, independiente de cooldown. El inicio se procesa antes de las colisiones físicas. Se corrige además el reinicio directo con ruleta activa y la duplicación de pulsaciones del acceso restringido.

Informe completo, recursos, archivos, pruebas e instrucciones en `VALIDACION-1.4.md`.



## Versión 1.5

Ocho familias procedurales con seis módulos interiores y pasillo central, dos entradas, mobiliario coherente y reservas de puertas. Banco, farmacia, comisaría, supermercado, taller, fuente de soda, tienda de conveniencia y hotel. Se conservan las avenidas, el complejo inicial y los patios industriales. Tío Aceite usa una reserva exterior de 5×5 tiles: carrito/toldo/NPC de 3×3 más laterales y acceso libre.

LOGROS abre el catálogo persistente: 40 registros, 36 disponibles, filtros y secretos ocultos. Los desafíos de jefes futuros y el de rechazar cartas permanecen inactivos. Los desbloqueos usan eventos reales y notificaciones en cola; el archivo local de logros no sustituye el saldo ni las mejoras.

PROJECT507 habilita 1.000.000 HC temporales y el selector INMORTALIDAD, inicialmente activado. Desactivarlo permite probar daño y morir, conservando las compras de prueba durante la misma página. Ambos estados bloquean logros y escrituras del progreso real. Recargar desactiva el modo.

Validación: `npm test`, `npm run build`, `npm run test:browser:v15`, `npm run test:browser:v15:world`. Los scripts de navegador requieren Playwright y Edge en el entorno de desarrollo. Informe completo en VALIDACION-1.5.md.


## Primera prueba en Android — 1.5.1

La vista táctil se activa con pantalla táctil y puntero principal grueso; una ventana de PC reducida sigue usando la interfaz de escritorio. Se recomienda horizontal. El aviso se acepta una vez por sesión de pestaña (con respaldo en sessionStorage si está disponible); al girar a vertical la escena se suspende sin reiniciar la partida.

Stick izquierdo: mover. Stick derecho: apuntar y disparar (se puede desactivar el disparo por stick en Opciones). FUEGO permite disparar por separado, conservando la última dirección de apuntado. Los botones usan las mismas acciones que teclado y mando, incluido el botiquín. Los menús ofrecen botones grandes y desplazamiento nativo.

Para acceder desde el teléfono en la misma red local, detén el servidor de desarrollo anterior y ejecuta `npm run dev:mobile`. Abre en Android la URL **Network** que muestre Vite, con la IP del PC; `localhost` y `127.0.0.1` en el teléfono apuntan al propio teléfono. Si npm no está en tu terminal, el equivalente es `.\node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5176` desde esta carpeta. No se ha publicado en GitHub ni en un servidor externo.

El progreso permanece local al navegador y su origen; esta actualización no añade sincronización entre PC y teléfono. Pantalla completa/orientación se solicitan solo al tocar el botón correspondiente y pueden ser rechazadas por el navegador. El giro manual sigue disponible.

Se han realizado pruebas con emulación Android y eventos multitáctiles CDP, además de regresión de escritorio. **No se ha verificado todavía en un teléfono físico.** Comprobar allí comodidad, rendimiento sostenido, audio/vídeo, orientación, recortes y teclado virtual. Informe: VALIDACION-1.5.1.md.

# Publicación en GitHub Pages

Configuración y resultados: [PUBLICACION-PAGES.md](PUBLICACION-PAGES.md).
La base de Vite es `/hotline-curico/`. El workflow publica `dist` desde `main` después de instalar, probar y compilar.
En GitHub, seleccionar **Settings → Pages → Build and deployment → Source → GitHub Actions**.
El progreso local de localhost no se transfiere automáticamente al dominio de Pages.

