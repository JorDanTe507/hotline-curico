# Validación 1.5.1 — Compatibilidad móvil

## Resultado y alcance

Implementado sobre el proyecto existente, conservando combate, personajes, economía, logros, generación del mundo y controles de escritorio. No se publicó en GitHub ni se implementó la actualización 1.5.2.

La validación móvil se realizó con emulación Android de Chromium/Edge y eventos multitáctiles reales del navegador mediante CDP. **No se probó en un teléfono Android físico.** Las comprobaciones de hardware indicadas al final permanecen pendientes.

## Implementación

- Detección por capacidades táctiles y puntero grueso, sin depender del agente de usuario. Un PC con puntero fino conserva la interfaz de escritorio, incluso con una ventana pequeña.
- Capa táctil conectada al InputHub existente: movimiento analógico, apuntado independiente que conserva su última dirección, disparo automático opcional y botón de disparo manual. Movimiento, apuntado y disparo admiten punteros simultáneos.
- Botones de dash, recarga, interacción, cambio y lanzamiento de arma, ejecución, definitiva, curación y pausa. Cada pulsación genera una sola acción; las entradas se limpian al perder foco, abrir menús o girar el dispositivo.
- Aviso inicial de orientación con teléfono animado y aceptación por sesión. El bloqueo horizontal se intenta únicamente tras pulsar su botón; la ausencia o denegación de la API ofrece instrucciones manuales. Girar a vertical pausa y conserva la partida; volver a horizontal la reanuda sin reiniciarla.
- HUD adaptable con salud, protección, retrato, armas, munición, botiquines, economía, nivel, objetivo, jefe y estados de habilidad. Contempla el viewport visual y áreas seguras.
- Menús táctiles para inicio, selección, mejoras, cartas, logros, historial, opciones, pausa, diálogos y derrota. Listas desplazables, objetivos de al menos 44 px e imágenes oficiales proporcionadas, sin reemplazar sprites de combate.
- Reducciones exclusivamente visuales en móvil: menos luces estáticas, casquillos y frecuencia de estelas. No se reducen enemigos ni se alteran daño, recompensas o dificultad.
- Video del menú y música existentes conservados. Recursos visuales reutilizados del proyecto; no se añadieron dependencias.

## Archivos

### Nuevos

- `src/mobile/TouchState.ts`: estado táctil, sticks, acciones y detección.
- `src/mobile/MobileUI.ts`: ciclo de vida, orientación, controles y HUD.
- `src/mobile/MobileMenus.ts`: vistas táctiles enlazadas a las transacciones existentes.
- `src/mobile/mobile.css`: presentación adaptable y áreas seguras.
- `tests/mobile151.test.ts`: seis pruebas unitarias adicionales.
- `check-mobile151.cjs`, `check-mobile151-menus.cjs`, `check-mobile151-platform.cjs`, `check-mobile151-production.cjs`: comprobaciones de navegador.
- Este informe y capturas `mobile151-*.png`.

### Modificados

- `src/main.ts`, `src/input/InputHub.ts`, `src/input/PadState.ts`: integración con entrada compartida y multitouch.
- `src/scenes/Game.ts`, `src/ui/CombatHud.ts`, `src/ui/UltimateView.ts`, `src/systems/CriticalHealth.ts`: presentación móvil y conservación del HUD de escritorio.
- `src/scenes/Achievements.ts`, `src/world/WorldStreamer.ts`: notificaciones táctiles y ajustes cosméticos.
- `src/scenes/Menu.ts`, `src/config/releaseNotes.ts`: versión e historial, conservando entradas anteriores.
- `index.html`, `package.json`, `README.md`: viewport, scripts y documentación de uso.
- `check-v15-world.cjs`: adaptación del índice del historial a la nueva versión. Este script no se ejecutó durante esta actualización.

## Compilación y pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| TypeScript: `tsc --noEmit` | Correcto |
| Unitarias: `tsx --test tests/*.test.ts` | 116/116 aprobadas; ninguna omitida |
| Producción: `vite build` | Correcto; 95 módulos |
| `check-mobile151.cjs` | Aprobado: flujo táctil, dos sticks simultáneos, disparo, dash, definitiva, pausa, giros y estabilidad de sectores/texturas |
| `check-mobile151-menus.cjs` | Aprobado: menús, desplazamiento por gesto, compras, cartas, acciones, tres punteros con disparo manual, derrota y ambos personajes |
| `check-mobile151-platform.cjs` | Aprobado: orientación disponible/ausente/denegada, aceptación tras recarga, cartas y cinemática al girar, escritorio con teclado y ratón |
| `check-mobile151-production.cjs` | Aprobado: flujo táctil sobre el paquete de producción, sin ayudas globales de desarrollo |
| `check-v13.cjs` | Aprobado: regresión del mando estándar, menús, habilidades, desconexión y preferencias |
| `check-arsenal.cjs` | Aprobado: arsenal, munición, recogida/lanzamiento, instancias, daño de área y limpieza al reintentar |
| `check-v15.cjs` | Aprobado: logros, economía, mejoras, modo de prueba y persistencia |

La compilación mantiene el aviso de tamaño del paquete de Phaser, sin errores. Paquete JS final: aproximadamente 1.71 MB, 417 KB comprimidos.

Las siete suites de navegador terminaron sin errores de JavaScript; las suites móviles también comprobaron la carga de recursos. No se afirma haber ejecutado todos los scripts históricos.

## Comprobaciones visuales y rendimiento

- Android emulado: 915×412, 844×390 y 800×360. Controles dentro de pantalla, sin intersecciones entre sus botones y con dimensiones mínimas de 44×44 px. HUD superior compacto y canvas proporcional 16:9.
- Escritorio: 1920×1080, 1280×720 y ventana 800×360. Se conservan interfaz y entradas originales.
- Retratos de selección, retrato del HUD, iconos de mejoras y cartas cargados; proporciones conservadas. Menús desplazables y controles visibles después de volver al menú.
- Rotación con cartas o cinemática conserva semilla, ronda y estado; no consume la cinemática ni reactiva la física antes de tiempo.
- Recorrido de 16 ubicaciones y vuelta: número de texturas estable; nueve sectores cargados y caché dentro del límite de 64.
- Muestra de 120 frames con CPU emulada cuatro veces más lenta, 24 enemigos activos y nueve sectores: mediana de 26 ms y percentil 95 de 33.1 ms. Esta muestra no representa rendimiento sostenido en hardware Android.

## Prueba pendiente en Android físico

Desde la carpeta del proyecto, detener el servidor anterior si ocupa el puerto y ejecutar:

```powershell
npm run dev:mobile
```

Conectar teléfono y PC a la misma Wi-Fi y abrir en el teléfono la dirección **Network** que muestre Vite. Utilizar la IP del PC y el puerto anunciado; `localhost` en el teléfono apunta al propio teléfono. No se modificó automáticamente el firewall.

Verificar en el dispositivo: comodidad con ambos pulgares, rendimiento y temperatura durante una partida larga, teclado virtual, audio y video del menú, permisos reales de orientación/pantalla completa, recortes y barras del sistema, cambio de aplicación, rotaciones repetidas y recuperación del control. Estas comprobaciones no pueden darse por aprobadas a partir de emulación.

El progreso continúa guardándose localmente por navegador y origen. No se añadió sincronización entre PC y teléfono.
