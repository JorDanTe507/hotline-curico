# Corrección visual 1.0.1 — retratos oficiales de selección

27 de octubre de 2026. Cambio aplicado sobre la versión 1.0 existente.

## Recursos utilizados

- Cervela: `D:/Descargas/Imagen de ChatGPT 27 oct 2026, 05_40_37 a.m.png`, copiado sin alterar a `public/assets/characters/selection/cervela.png`. El original ya era RGBA con transparencia real: no se eliminó su ropa oscura ni el cabello.
- Nicolás: `D:/Descargas/Joven de neón con pistola.png`, copiado sin alterar a `public/assets/characters/selection/nicolas.png`. El original era RGB, con negro incrustado. Se preparó una máscara de transparencia mediante la herramienta imagegen, guardada como `nicolas-alpha.png`.
- El juego compone el RGB del retrato oficial de Nicolás con **solo el canal alfa** del recorte preparado. Los colores generados por la herramienta no se utilizan. Así se conserva la imagen oficial entregada, incluidos rostro, polerón, mochila, sangre, cabello y pistola hacia abajo.

Ambos originales tienen 1024×1536 píxeles. Las copias oficiales conservan sus bytes originales; `public/assets/characters/selection/manifest.json` registra y compara sus SHA-256. No se recortan ni se cambia su relación de aspecto. Las siluetas y su revelación usan exactamente la misma textura y alfa dentro del motor. No se utilizan sprites pequeños de combate como retratos de selección.

## Pantalla

Cervela a la izquierda, Nicolás a la derecha. Retratos de 440 px de alto a resolución lógica de 1280×720, escalados proporcionalmente, con todo el lienzo dentro de la pantalla. Se conserva fondo oscuro, iluminación magenta/cian y tipografía del juego.

Al entrar ambos aparecen oscuros. Pasar el cursor revela el retrato a color en 250 ms y añade un resplandor leve, nombre, habilidad y descripción:

- CERVELA — ÚLTIMA CALADA — «Resistencia, regeneración y fuego sostenido».
- NICOLÁS — MODO TRYHARD — «Velocidad, daño y eliminaciones encadenadas».

Salir devuelve la silueta. Continúan selección con ratón/teclado, confirmación bloqueada contra doble clic, VOLVER y el regreso desde el menú. Se conserva el video y la música.

## Separación de recursos y archivos

`src/characters/catalog.ts` expone explícitamente:

- `selectionPortrait`: archivo grande, clave de textura y máscara opcional.
- `gameplaySprites`: conjuntos normales y dañados.
- `dialoguePortraits`: retratos de diálogo.
- `damagedPortraits`: retratos de poca salud.
- `ultimatePortrait`: retrato de activación.

Los nombres anteriores siguen como referencias compatibles para los sistemas existentes; los gráficos de combate y sus archivos no se reemplazaron.

Cambios principales: `src/scenes/CharacterSelect.ts` para composición visual; `src/characters/catalog.ts` y `assets.ts` para recursos; `src/main.ts` para preparar la textura de selección durante Boot. `src/scenes/Menu.ts`, `package.json` y README actualizan la versión. No se modificaron las mecánicas, estadísticas, habilidades, inventario ni el código de combate.

## Validación

`check-selection-portraits.cjs` verifica los diez puntos solicitados:

1. Carga de las dos texturas oficiales a 1024×1536, sin errores de recursos.
2. Cervela en el lado izquierdo.
3. Nicolás en el lado derecho.
4. Silueta y color comparten textura y alfa; el exterior es transparente. Las muestras internas de cabello, ropa oscura y cuerpo permanecen opacas. Se compara el RGB de Nicolás con su fuente oficial.
5. Revelación del retrato correcto, nombre, habilidad y descripción exacta.
6. Salir devuelve alfa cero a la revelación y elimina el resplandor.
7. Escala X/Y idéntica y retratos completos dentro de pantalla. Comprobación adicional del lienzo a 960×540.
8. Clic real en cada retrato inicia al protagonista correspondiente.
9. En partida se conservan los sprites anteriores, la pose de caminar y el retrato anterior de la habilidad. Se comprueban las referencias separadas de recursos.
10. Se vuelve al menú y a la selección después de jugar con cada personaje; también se verifican teclado y VOLVER.

Resultado: correcto, sin errores JavaScript, texturas/animaciones faltantes ni errores HTTP de recursos. Las 67 pruebas unitarias existentes también pasan. TypeScript y la compilación de producción son correctos; persiste el aviso conocido de tamaño del paquete principal de Phaser. `check-characters.cjs` también pasa: los 16 ataques con cada protagonista, habilidades, experiencia, jefes, movimiento físico en industria, reintentos y cambio de protagonista. Durante esa regresión se corrigió un evento pendiente del cursor que podía interferir con el foco por teclado al regresar al menú.

Capturas de la pantalla real: `selection-official-silhouettes.png`, `selection-official-cervela.png`, `selection-official-nicolas.png`, `selection-official-960.png`.
