# Hotline Curicó 2.0.2 — Pulido y estabilidad

Verificación local del 4 de noviembre de 2026. Publicación autorizada expresamente por el usuario.

## Cambios de esta actualización

### Jordan: canal alfa y contornos

La lámina original está completamente opaca. El extractor retiraba por inundación el blanco intenso del fondo, pero conservaba el antialias gris claro conectado al exterior: aparecía un halo alrededor de cabello, ropa y calzado. El atlas no presentaba huecos interiores cerrados ni pérdida de píxeles oscuros por una clave de color negro.

Se corrigió el proceso de extracción para retirar exclusivamente el mate exterior brillante y casi neutro. Comparación con el atlas anterior: **10.460 píxeles de mate retirados; ningún píxel oscuro eliminado y ningún RGB de los píxeles conservados alterado**. Se mantienen los 181 fotogramas, el atlas 1536 × 1344, las posiciones, los índices y el manifiesto exacto. La limpieza es idempotente. No se generaron diseños nuevos ni se sustituyó el personaje.

Se revisaron todos los fotogramas de movimiento, disparo, melee, daño, agonía, reanimación y muerte mediante el renderer real, sobre fondos claros y oscuros, incluyendo la multiplicación de color usada para oscurecer actores. Juicio Final utiliza esas mismas texturas y pasó sus pruebas de combate. Los retratos, selección, banner de definitiva y pantallas de derrota se conservaron. No se detectaron originales dañados de manera irreversible.

### Modo desarrollador

- Selector de Cervela, Nicolás y Jordan en escritorio y presentación táctil.
- Opción de estadísticas base para probar las habilidades sin las compras permanentes heredadas; se conserva la opción con mejoras.
- Desde pausa: **COMBATE · PRUEBAS**. Recuperación de vida, munición, recarga de barras, activación de definitiva de J1, generación de diez matones, limpieza, catálogo completo de enemigos y radiooperador.
- Acceso a los cinco jefes mediante el director normal de rondas, incluyendo las presentaciones y frases exactas de Jordan. No se implementó un modo Boss Rush.
- Verificados los valores base de Juicio Final: 12 s, ventana de 2,5 s, curación del 8%, diez acciones y golpe del 20% de HP máximo del jefe. Los límites y mejoras existentes se conservan.
- Las herramientas nuevas están protegidas por `developerSession.active` y no alteran el combate normal.

Se encontró y corrigió un problema de aislamiento: abrir los desafíos en modo desarrollador podía inicializar o renovar el guardado diario legítimo. Ahora el servicio diario de prueba es una copia en memoria. Los eventos, logros y reclamaciones permanecen bloqueados; HC y compras usan el monedero de prueba existente. La prueba de navegador compara las tres claves persistentes antes y después del acceso, combates, jefes, compras y eventos de desarrollador: permanecen idénticas. No se añadió un sistema nuevo de récords; el proyecto no registra un récord oficial de estas sesiones.

### Radiooperador: resultado de la investigación

No había una desconexión del director ni un error de sprites que impidiera su aparición. Se conserva el equilibrio:

| Condición | Valor actual |
|---|---|
| Registro | Enemigo 16, 65 HP base, sin arma ni ataque |
| Ronda mínima | 3 |
| Aparición | Uno al iniciar cada ronda divisible por 3, excepto las de jefe |
| Ejemplos | 3, 6, 9, 12, 18, 21, 24…; no aparece en 15 ni 30 |
| Probabilidad en rondas elegibles | Aparición programada del 100%; no depende del sorteo común |
| Peso en sorteo común | 0, intencional: evita duplicarlo fuera del director específico |
| Límite natural | Una aparición programada por ronda, protegida por `lastRound` |
| Posición | Punto accesible del sistema compartido, normalmente fuera de cámara, a unos 500–1100 px del jugador |
| Detección | Menos de 700 px y línea de visión; patrulla si no ve a un protagonista |
| Llamada | 4 s; aturdimiento, electricidad y reacción de daño retrasan su avance |
| Refuerzos | Una sola tanda de cuatro, mediante la cola existente; después huye |
| Radio como botín | 75% si muere antes de completar la llamada; después no la suelta |

La posición inicial fuera de cámara y la detección con obstáculos explican que no siempre sea visible de inmediato. No se aumentó su frecuencia. Se verificaron aparición automática, repetición de `beginRound` sin duplicados, línea de visión, llamada, cuatro refuerzos, interrupción al morir, ausencia de recompensa duplicada, suministros accesibles y limpieza. La herramienta manual permite probarlo sin esperar a una ronda elegible.

### Acceso neutral

Escritorio y móvil muestran **MODO DESARROLLADOR · Introduce la contraseña**. Se retiraron las pistas sobre mayúsculas y espacios. El error de validación continúa siendo neutral. La contraseña y su comparación exacta no se modificaron, ni se imprimieron durante las pruebas. Sigue siendo una barrera de interfaz del cliente, no un almacén de secretos.

## Archivos propios de 2.0.2

- `.gitignore`: exclusión de cachés de Python de preparación.
- `public/assets/v20/jordan-atlas.png`: contornos reparados desde la fuente original.
- `tools/jordan_alpha.py`, `tools/prepare_jordan20.py`, `tools/test_jordan_alpha202.py`: extracción reproducible y pruebas de alfa.
- `src/scenes/Restricted.ts`, `src/systems/DeveloperSession.ts`: tres personajes, acceso neutral y estadísticas base.
- `src/ui/DeveloperTools.ts`, `src/ui/PauseMenu.ts`: herramientas aisladas de combate y generación manual.
- `src/scenes/Game.ts`, `src/v19/CoopSession.ts`: selección de estadísticas base únicamente en modo desarrollador.
- `src/mobile/MobileMenus.ts`: selección, acceso neutral y herramientas táctiles.
- `src/v19/Progress19.ts`: servicio diario de prueba sin escrituras persistentes.
- `src/config/releaseNotes.ts`, `package.json`, `package-lock.json`: versión 2.0.2, novedades verificadas e historial conservado.
- `tests/maintenance202.test.ts`, `tests/atmosphere173.test.ts`: aislamiento, instrucciones y versión.
- `check-maintenance202.cjs`, `check-dev-mobile202.cjs`, `check-production202.cjs`: pruebas de integración de esta entrega.

El remoto estaba en 1.7.3. Para publicar la versión local completa se incluyen además los cambios y recursos anteriores de 1.7.4–2.0.1 ya presentes y necesarios para esta versión, conservando su implementación. El historial remoto no se reemplaza. La configuración de Vite y el workflow de Pages se mantienen.

## Pruebas realizadas

- TypeScript: **correcto**.
- Suite Node/tsx: **213/213**, cero fallos.
- Python/Pillow: **2/2**, incluyendo los 181 fotogramas y preservación de píxeles oscuros respecto al atlas anterior.
- Producción (`npm run build`): **correcta**. Aviso no bloqueante de Vite por paquete JavaScript mayor de 500 kB.
- `git diff --check`: correcto.
- `check-maintenance202.cjs`: acceso neutral real, Jordan seleccionado, estadísticas base, recarga/activación, diez ejecuciones, curación, final de habilidad, golpe del 20%, cinco herramientas de jefe y diálogos exactos; generación manual del radio; claves persistentes intactas y cero errores JavaScript.
- `check-dev-mobile202.cjs`: acceso neutral táctil, tres protagonistas, estadísticas base, recarga de barra y radiooperador manual; cero escrituras de progreso legítimo.
- `check-radio19.cjs`: detección, llamada única de 4 s, cuatro refuerzos, interrupción, muerte, radio/suministro de un solo uso y limpieza; cero errores JavaScript.
- `check-integration201.cjs`: las seis parejas ordenadas desde menú hasta combate, primera detección de mando, diálogos y dos ruletas reales de ronda 1.
- `check-coop19.cjs`, `check-coop191.cjs`: entradas e inventarios separados, ambas definitivas, HUD, cámara, agonía de 120 s, pausa, reanimación de 20 HP, derrota, reintento, cartas y limpieza.
- `check-jordan20-combat.cjs`: Juicio con compañero, daño diferido una sola vez, diez ejecuciones, curación y reanimación; dieciséis armas y cinco arrojadizos.
- `check-shop201.cjs`: compras de Jordan en escritorio/táctil, guardado, migración y conservación de otros personajes; logro cooperativo y exclusiones.
- `check-production202.cjs`: producción local en `/hotline-curico/`, versión y novedades correctas, historial anterior, selección e inicio de Jordan con controles táctiles; los 25 PNG de Jordan en `dist` coinciden con `public`; sin errores HTTP/JavaScript.
- `check-jordan20-mobile.cjs`: selección, diálogo, definitiva táctil, ejecución, curación y derrota/reintento de Jordan en individual.
- Revisión de candidatos de publicación: sin dependencias instaladas, compilación, temporales, cachés ni patrones conocidos de credenciales/llaves privadas. El inventario local queda fuera de Git.

## Límites y publicación

Las pruebas de mando usan una API simulada. No se certificaron mandos físicos USB/Bluetooth ni dos mandos reales. El dispositivo Android se emuló; no se probó un teléfono físico ni una partida completa manual de larga duración. No se conocen errores críticos pendientes en los recorridos verificados.

La publicación se realizará después de estas verificaciones mediante un commit nuevo en `main` y push normal a `origin`. El hash y el resultado real del workflow se informan al usuario al terminar; este documento registra la validación previa a ese push. URL prevista: https://jordante507.github.io/hotline-curico/.
