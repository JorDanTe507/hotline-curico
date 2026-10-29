# Hotline Curicó 1.1 — Tryhard reforzado, alerta y derrota cinematográfica

27 de octubre de 2026. Implementación incremental; se mantienen protagonistas, selección con retratos oficiales, las 16 armas recuperables, progresión, rondas, jefes y mundo procedural.

## Salud temporal de Nicolás

`HealthCapacity` separa el máximo normal de su multiplicador temporal. `run.stats.maxHealth` conserva el valor normal: no se multiplica ni se reemplaza con 500. El máximo vigente es máximo normal × multiplicador, inicialmente 1.

Al activar Tryhard se aplica ×5 una sola vez, conservando la fracción actual: 100/100 → 500/500, 80/100 → 400/500 y 70/140 → 350/700. Al terminar o cancelarse, la conversión inversa conserva la salud restante: 250/500 → 50/100. No se restaura la salud inicial ni se redondea una fracción positiva a cero. Una muerte real a cero permanece en cero.

Las mejoras de corazón operan sobre el máximo normal. Durante Tryhard, +20 de máximo normal equivale a +100 de capacidad temporal y la curación de esa carta conserva su equivalencia en salud normal. No se vuelve a multiplicar el máximo ya ampliado. Los botiquines mantienen sus puntos de curación existentes y usan el máximo vigente para limitar la curación; no regeneran chaleco.

El chaleco conserva exactamente su capacidad y protección. El daño atraviesa normalmente el chaleco agotado y reduce la salud temporal; daño suficiente sigue matando. El HUD muestra, por ejemplo, NICOLÁS ♥ 385/500 HP, con barra azul violácea mientras está ampliada. Los estados heridos, retratos y la alerta usan el máximo vigente.

Se conservan las ventajas previas de Tryhard: daño ×1,35, movimiento ×1,25, dash de 500 ms, 8 segundos iniciales, +750 ms por baja hasta 14 segundos totales y 40 impactos base. No añade regeneración, munición infinita, reducción especial de daño ni disparo doble. Última Calada conserva sus parámetros y mejoras anteriores.

## Alerta de salud

`CriticalAlert` mantiene un estado con histéresis: entra con salud ≤25% y sale al superar el 30%. Evita oscilaciones al permanecer entre ambos umbrales. El intervalo de pitido es 1200 ms y está en `config/survival.ts`.

La alerta reutiliza el efecto local de monitor `critical.wav` con volumen moderado y las opciones de efectos existentes. Comprueba que no haya una instancia reproduciéndose antes de iniciar otra. No crea temporizadores de Phaser ni acumula pitidos atrasados. Los bordes rojos pulsan; continúan los retratos y las frases propias, con su espera de 20 segundos entre diálogos.

Pausar, mostrar cartas/ruleta/diálogo de jefe, morir o abandonar silencia inmediatamente el pitido y oculta la alerta correspondiente. El estado puede reanudarse al continuar; morir y salir lo limpian por completo. Con volumen de efectos cero no se reproduce sonido, pero la alerta visual sigue funcionando.

## Secuencia y pantallas de derrota

`Game.finish()` tiene una guarda de ejecución única. Al morir bloquea el combate, deja la salud en cero, detiene minigun, quemaduras, habilidades, acciones, rondas y enemigos; destruye proyectiles y cancela eventos pendientes. Se pausa la física y el personaje reproduce su animación de muerte. Se oculta el HUD de combate.

`DeathSequence` aplica 1200 ms de oscurecimiento y desvanecimiento musical, seguidos por 220 ms de entrada de la pantalla. El total aproximado es 1,42 segundos. La simulación y el tiempo de supervivencia permanecen congelados. Los botones se habilitan al terminar el fundido; la secuencia no crea eventos temporizados de supervivencia. Al salir se cancelan sus tweens y listeners.

Cada pantalla tiene una ilustración individual a la izquierda y la interfaz real a la derecha:

- HAS FALLADO — CERVELA — «Al final este fue el último cigarrito».
- HAS FALLADO — NICOLÁS — «No pude hacer las misiones diarias hoy, ni mañana......».

Se conservan las estadísticas finales. REINTENTAR y Enter comienzan una partida nueva con el mismo protagonista: salud normal 100, chaleco 0, nivel 1, mejoras vacías y carga 0. MENÚ PRINCIPAL y Escape regresan al título, desde donde puede elegirse otro personaje. Las áreas de clic están fijadas al espacio de pantalla; funcionan también después de recorrer el mundo y desplazar la cámara.

## Recursos gráficos

Se prepararon con imagegen dos ilustraciones individuales a partir de las referencias entregadas:

- `D:/Descargas/Último Cigarrito de Cervela.png` → `public/assets/death/cervela.png`.
- `D:/Descargas/Pantalla de game over cyberpunk lluviosa.png` → `public/assets/death/nicolas.png`.

Las ilustraciones preparadas no contienen título, frase ni botones incrustados. Se recompusieron en formato vertical para conservar rostro, manos, poses y calzado completos. Cervela conserva lentes, traje y cigarrillo encendido; Nicolás conserva polerón/cargo y mano levantada, sin cigarrillo ni humo. La lámina completa original no se carga como fondo. Los textos y controles pertenecen a Phaser. Los recursos se escalan proporcionalmente, sin recorte.

## Archivos principales

- Nuevos: `src/systems/HealthCapacity.ts`, `src/systems/CriticalAlert.ts`, `src/ui/DeathSequence.ts`, `tests/v11.test.ts`, `check-v11.cjs`, `public/assets/death/` y este informe.
- Salud/habilidad: `src/systems/Tryhard.ts`, `Ultimate.ts`, `run.ts`, `UpgradeCatalog.ts`; `src/characters/abilities.ts`, `PlayerAppearance.ts`; `src/ui/CombatHud.ts`, `UltimateView.ts`.
- Alerta/limpieza: `src/systems/CriticalHealth.ts`, `AudioSystem.ts`, `MusicManager.ts`, `src/config/survival.ts`; pausa y shutdown en `src/scenes/Game.ts`, además de `LevelUpView.ts`, `WeaponRoulette.ts` y `BossDialogue.ts`.
- Recursos/flujo: `src/characters/catalog.ts`, `assets.ts`, `src/scenes/Game.ts`, `Menu.ts`. Se endureció el foco por teclado en `CharacterSelect.ts` frente a eventos antiguos del cursor al regresar al menú.
- Metadatos: `package.json` y README. Las pruebas anteriores se adaptaron a esperar el final de la transición y a usar las nuevas posiciones de los botones; las expectativas de Nicolás reflejan la conversión de salud ×5.

## Pruebas

`tsx --test tests/*.test.ts`: **73/73 aprobadas**, incluidas seis nuevas pruebas de conversión de salud completa/parcial, vuelta proporcional, mejoras durante Tryhard, no acumulación, botiquines/daño letal, Cervela intacto y alerta 25/30% con intervalo de 1200 ms.

`check-v11.cjs` comprueba los 16 requisitos de esta actualización: capacidades 500/700 y porcentajes, máximo no acumulable, mejora real de corazón durante la habilidad, chaleco sin multiplicar, daño/HUD/color, muerte letal, conservación de Calada, pitidos periódicos/no superpuestos/volumen/mute, parada al pausar y abandonar, uso de 125/500 como umbral, secuencia única y progresiva, música que baja de volumen, animación, cancelación de eventos de supervivencia, ilustraciones y frases exclusivas, reintento limpio y menú/selección. También comprueba clics de derrota con cámara desplazada.

Ejecuciones completas aprobadas:

- `check-v11.cjs`: los 16 requisitos de esta versión, audio real, opción de volumen cero, fundido progresivo visual/musical, daño letal, mejoras durante Tryhard y botones con cámara desplazada.
- `check-arsenal.cjs`: las 16 armas, daño/recarga, caída y recuperación, identidad/munición, sectores y limpieza.
- `check-characters.cjs`: ambos protagonistas, arsenal, habilidades, experiencia, jefes, movimiento industrial, reintentos y cambio de personaje.
- `check-v09.cjs`: experiencia, cartas y mejoras acumuladas, máximos, daño y tres reintentos limpios.
- `check-v062.cjs`: Cervela conserva 20 HP/s, 12 s y reducción del 40%; chaleco, botín, HUD, jefe y menú conservados. La prueba selecciona explícitamente a Cervela.
- `check-v07.cjs`: minigun a 20 Hz, preparación, recarga, movimiento, penetración, combinación con RPG y ruleta.
- `check-selection-portraits.cjs`: retratos oficiales, alfa, proporciones, revelación, nombres/descripciones y separación respecto al gameplay.
- `check-world.cjs`: 17 comprobaciones de mundo, rutas, botín, supervivencia, jefes y reintentos. Nueve sectores, caché de 64 y hasta 444 cuerpos estáticos; medición local con 24 enemigos: mediana 5,5 ms y percentil 95 de 6,7 ms por actualización. No implica los mismos FPS en otros equipos.

Sin errores JavaScript ni texturas/animaciones faltantes en las suites completas. TypeScript y `vite build` son correctos. Persiste el aviso conocido de tamaño del paquete principal de Phaser; no impide compilar.

Capturas: `tryhard-tank-v11.png`, `critical-tank-v11.png`, `death-transition-v11.png`, `death-cervela-v11.png`, `death-nicolas-v11.png`.
