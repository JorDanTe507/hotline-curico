# Interfaz móvil y disparo automático opcional

Actualización sobre la base 2.1.0. Fecha de validación: 14 de noviembre de 2026.

## Entrega

- Capa táctil horizontal con joysticks independientes y botones circulares flotantes. Se elimina la distribución central de rectángulos; no se añade una franja que reduzca el escenario.
- HUD compacto: retrato/nombre, salud, protección, arma/munición, botiquines, HC o créditos de Boss Rush, ronda/objetivo, nivel/XP, carga de definitiva, arrojadizos e infección.
- Botones con estados de pulsación, bloqueo, disponibilidad y enfriamiento. Recoger/interactuar y ejecutar aparecen cuando hay una acción contextual pertinente. Se conservan todas las acciones anteriores.
- Pantalla vertical con «Gira tu dispositivo para jugar», limpieza de entradas y suspensión de la escena. Al volver a horizontal se recupera la interacción. El bloqueo de orientación sigue siendo opcional y solo se solicita mediante acción del usuario.
- Menú con la ilustración existente y JUGAR destacado; tarjetas para Boss Rush e Historia (Próximamente, deshabilitada). Selección de protagonistas, diálogos con retratos, cartas, mejoras, pausa y resultados reutilizan sus sistemas existentes.
- Opciones → Controles móviles: automático, prioridad, distancia, disparo al apuntar manualmente, tamaño, opacidad, dos disposiciones y restablecimiento.

## Reglas de disparo

El automático está habilitado por defecto para preferencias nuevas y solo interviene con la capa móvil disponible y el último dispositivo táctil. Puede desactivarse desde Opciones o Configuración durante pausa. No se activa al usar exclusivamente teclado, mouse o mando.

Selecciona un enemigo vivo y activo, dentro del alcance original del arma equipada y con línea de visión. Por defecto elige el más cercano. La prioridad opcional «más peligroso» usa únicamente la condición de jefe y el daño ya definido del enemigo; no se añade IA. La distancia cercana limita a 300 píxeles o al alcance del arma si es inferior.

El stick derecho anula la selección automática mientras se mueve. El botón de fuego conserva el control manual, y la opción independiente de disparar al mover el stick conserva el comportamiento táctil previo. Al soltar el stick, el automático puede reanudar la selección.

La entrada resultante pasa por la cadencia, dispersión, daño, proyectiles, munición y bloqueos existentes de Game. No se generan balas ni se recarga automáticamente con el cargador vacío. Se conservan RPG, M79, escopetas, minigun y variantes. Las armas cuerpo a cuerpo y el combate desarmado siguen siendo manuales. No se ejecutan habilidades, consumibles, ejecuciones ni arrojadizos automáticamente.

Los menús, diálogos, pausa, orientación vertical y estados de combate mantienen sus bloqueos. El dash conserva su prohibición de disparar, con la excepción previa de Nicolás durante Tryhard. El automático también cede mientras se prepara un arrojadizo.

## Persistencia y protección

Preferencias en una clave independiente: `hotline-mobile-controls-v2`. Valores predeterminados: tamaño 100 %, opacidad 64 %, posición estándar, automático activado, enemigo cercano, alcance del arma y disparo con stick activado. Rangos: tamaño 85–120 %, opacidad 30–90 %. Restablecer solo afecta esos controles.

No se han alterado datos de progreso por este rework. La base previa 2.1.0 conserva sus mejoras, saldos por protagonista y fondo histórico pendiente de asignación. Su inclusión en esta publicación fue autorizada expresamente por el usuario después de revisar el inventario.

## Archivos del rework

Nuevos:

- `src/mobile/AutoFire.ts`: selección y adaptación de entrada, sin otra lógica de daño.
- `src/mobile/MobilePreferences.ts`: validación y almacenamiento aislado.
- `tests/mobileRework.test.ts`: ocho pruebas de selección, bloqueos, munición, dispositivos, variantes y preferencias/multitáctil.
- `tools/check_mobile_rework.cjs`: recorrido de navegador y capturas locales comparativas.
- Este informe.

Modificados:

- `src/mobile/{MobileUI,MobileMenus,TouchState}.ts` y `src/mobile/mobile.css`.
- `src/input/InputHub.ts`: combina el automático con las entradas actuales y conserva prioridad manual.
- `src/scenes/Game.ts`: el bloqueo tras cerrar una interfaz espera la liberación de entradas manuales; un objetivo automático no lo deja bloqueado indefinidamente.
- `src/v19/CoopInput.ts`: mantiene el aislamiento de ese mismo chequeo entre J1 y J2.
- `src/config/releaseNotes.ts`: notas de entrega; se mantiene el número 2.1.0.

La publicación incluye además los archivos de la base local 2.1.0 autorizada, con sus pruebas y ocho proyectiles preparados. Se excluyen node_modules, dist, temporales, logs, capturas, referencias gráficas de trabajo y herramientas antiguas de preparación.

## Validación

- TypeScript sin errores.
- Suite completa: 255 pruebas aprobadas, ninguna fallida.
- Producción Vite compilada; permanece la advertencia no bloqueante del bundle principal superior a 500 kB.
- Recorrido móvil en Edge emulado: preferencias y persistencia, reset, selección, menú de modos e Historia bloqueada, retratos/diálogos, adquisición de blanco, munición normal, cargador vacío sin recarga automática, paredes y alcance corto.
- Eventos multitáctiles reales del protocolo del navegador: movimiento, apuntado y disparo manual simultáneos. Prioridad del stick derecho, pausa/reanudación, giro vertical/horizontal y selección táctil de cartas. También pasaron recarga manual, cambio de arma, dash durante movimiento, lanzamiento al soltar, botiquín y ejecución contextual.
- Resoluciones comprobadas: 568×320, 667×375, 844×390 y 1024×600, sin controles fuera del viewport.
- Regresiones 2.1.0: jefes, habilidades, ruleta, botín, logros, cooperativo y seis arenas; recorridos de escritorio y móvil emulado aprobados.
- Plataforma/escritorio: mouse dispara, WASD mueve, HUD de derrota se oculta, interfaz táctil ausente y proporción 16:9 conservada en 1920×1080, 1280×720 y 800×360. Sin errores de JavaScript.

La apariencia de escritorio conserva sus componentes y estilos anteriores. Los cambios visuales están limitados a `#mobile-ui` y a la ocultación/restauración de elementos de canvas que esa capa sustituye en móviles.

## Capturas y límites

Las capturas de revisión se conservan localmente en `docs/mobile-rework/`, fuera del commit: `before-menu.png`, `after-menu.png`, `before-combat.png`, `after-combat.png`, `settings.png`, `modes.png`, `selection.png`, `dialogue.png` y las cuatro resoluciones. Son recorridos de prueba; algunas muestran salud/objetivos manipulados para probar casos concretos, no valores nuevos de balance.

Se ofrecen dos posiciones predeterminadas; no hay arrastre libre de botones. La prueba en Android físico y la comodidad con pulgares, zonas seguras reales, barras del navegador, rendimiento y audio requieren revisión en el teléfono. La emulación no se presenta como una prueba en hardware físico.

## Revisión en el teléfono

Abrir la dirección pública de Pages, girar a horizontal y tocar JUGAR. En Opciones → Controles móviles cambiar automático y apuntado, tamaño, opacidad y disposición. Probar también Configuración desde pausa. Verificar movimiento con el pulgar izquierdo y apuntado con el derecho; el botón de fuego sigue disponible. Con el automático activado, acercarse a un enemigo visible y luego colocarse tras una pared o agotar el cargador: debe cesar el fuego sin recargar. Pulsar recarga manualmente para continuar.

Probar Tradicional y los tres modos de Boss Rush, dash, definitiva/cancelación, recoger, botiquín y arrojadizos. Girar a vertical durante combate y regresar; no debe haber entradas retenidas. Si el navegador conserva archivos antiguos tras el despliegue, recargar la página antes de revisar.
