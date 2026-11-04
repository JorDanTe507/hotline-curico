# Corrección urgente 2.0.2 — selección de modo

## Causa reproducida

Phaser `Systems.start(data)` conserva `settings.data` cuando no recibe datos nuevos. Después de abrir MULTIJUGADOR LOCAL, CharacterSelect retenía `{coop:true}`. JUGAR llamaba a `scene.start('CharacterSelect')` sin datos y reutilizaba ese valor. Reproducción previa: MULTIJUGADOR LOCAL → selección cooperativa; volver → JUGAR → `coop:true` incorrecto.

## Corrección limitada

Único archivo de ejecución modificado: `src/scenes/Menu.ts`, acción JUGAR, ahora envía `{coop:false}`. MULTIJUGADOR LOCAL continúa enviando `{coop:true}`. La selección reinicializa su estado desde estos datos. Game ya reinicializa su sesión y la introducción individual envía datos nuevos; los reintentos ya conservan explícitamente su modo. No fue necesario modificarlos.

No se modifican mecánicas, estilos, HUD, radar, fachadas, economía, progresión ni otros sistemas.

## Pruebas ejecutadas

`check-mode202.cjs`: navegador Edge automatizado, clics reales del menú, selección por teclado y mando estándar simulado para J2. Se regresa mediante pausa → MENÚ PRINCIPAL → SÍ, SALIR, sin recargar la página.

1. JUGAR → Cervela: individual, sin compañero, HUD individual. APROBADO.
2. JUGAR → Nicolás: individual, sin compañero, HUD individual. APROBADO.
3. JUGAR → Jordan: individual, sin compañero, HUD individual. APROBADO.
4. MULTIJUGADOR LOCAL → Cervela y Nicolás: cooperativo, dos personajes distintos, CoopHud y física activa. APROBADO.
5. Volver desde cooperativo → JUGAR → Jordan: individual, sin sesión ni HUD cooperativos residuales. APROBADO.
6. Volver desde individual → MULTIJUGADOR LOCAL → Nicolás y Cervela: cooperativo con HUD correspondiente. APROBADO.

Sin errores JavaScript en los seis recorridos. TypeScript aprobado, 222/222 pruebas Node aprobadas, compilación de producción aprobada. `check-production202.cjs` aprobado bajo `/hotline-curico/`: carga de recursos e inicio individual móvil en emulación.

Bundle corregido: `index-BxZpw1iC.js`; CSS sin cambios: `index-CPrhWJZC.css`. Se conserva la advertencia previa de tamaño de bundle. Sin pruebas con mando o teléfono físicos.

Publicación autorizada: nuevo commit específico y push normal a main; el resultado del workflow y la verificación de la URL pública se comunican después del despliegue.
