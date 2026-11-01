# Recursos de Hotline Curicó 1.6

Archivos aportados por el usuario y copiados sin alterar:

- `fortune.png`: `D:/Descargas/Actualización 1.6_ Cajas y Requiem.png`.
- `bosses.png`: `D:/Descargas/Hoja de jefes pixel art neon.png`.

`src/world/fortuneAssets.ts` prepara recortes individuales en canvas de Phaser, con escalado nearest-neighbor y eliminación del fondo oscuro conectado a los bordes. El juego utiliza esos recortes, no las láminas completas como objetos del escenario.

Los cuatro jefes usan retratos, poses y armas de la lámina. No había implementaciones previas de sus IA en el proyecto local: se añadieron comportamientos configurables. La lámina no incluye una secuencia independiente de muerte; provisionalmente se utiliza una pose girada, teñida y acompañada de la sangre existente. Las animaciones de daño/recarga también reutilizan poses disponibles. No se sustituyeron los recursos de El Torturado ni los protagonistas.
