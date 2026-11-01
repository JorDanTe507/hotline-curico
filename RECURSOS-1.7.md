# Hotline Curicó 1.7 — Recursos proporcionados

Se inspeccionaron y separaron los seis archivos de D:/Descargas:

- Sprite sheet pixel art de bencinera COPEC.png
- Tileset Pixel Art_ Callejón Urbano Gritty.png
- Sprites industriales para bodega retro.png
- Sprites de Estacionamiento Deteriorado.png
- Sprites de Luces y Generador Retro.png
- Paquete Clima_ Niebla, Lluvia y Charcos.png

Los 61 recursos de ejecución están en public/assets/v17. urban17Manifest.ts registra nombres y dimensiones. Los objetos grandes conservan proporciones; los tiles de suelo se prepararon a 32×32. No se utiliza una lámina de presentación completa como textura del escenario.

prepare-assets17.cjs contiene los recortes inspeccionados y el procesamiento Canvas. Sus entradas originales se conservan localmente en .publication-lock/v17-sources (copec.png, alley.png, warehouse.png, parking.png, lights.png, weather.png); no se publican los originales de trabajo. Para repetir el procesamiento se requieren esas entradas y el navegador local configurado en el script.

La transparencia de niebla/lluvia se deriva de la intensidad del recurso y se suaviza en los bordes de niebla. Las luces se limitan a sus siluetas para retirar la pared ilustrativa. Los objetos conservan colores internos; no se utiliza un borrado indiscriminado de negros o blancos. La inspección visual motivó corregir la primera máscara, que eliminaba partes oscuras de vehículos.

El menú, los protagonistas y los demás recursos de 1.6.3 permanecen. Los atlas de protagonistas son los archivos de ejecución; sus dos láminas de preparación locales *-source.png quedan excluidas de Git.

No se añadió una pista de lluvia: no se proporcionó un audio ambiental de lluvia adecuado. Los avisos usan texto breve, iluminación y el efecto motor existente cuando corresponde. La recarga utiliza assets/audio/reload.wav existente, al inicio y una señal mecánica tenue al completar; respeta AudioSystem.volume, incluido 0%.
