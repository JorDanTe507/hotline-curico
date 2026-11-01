# Requiem — recurso 1.5.2

Referencia proporcionada por el usuario y comprobada en disco: `D:/Descargas/Hoja de sprites del revólver Requiem.png`.

Modo utilizado: herramienta integrada image_gen, salida transparente derivada de la referencia. Se copió la salida al proyecto como `source.png`. No contiene manos, textos ni elementos de la lámina. No se utilizó la lámina completa como textura de combate.

`src/weapons/requiemAssets.ts` normaliza la silueta mediante alpha y escalado proporcional nearest-neighbor a lienzos transparentes de 32×32 al arrancar. Genera las claves existentes de equipamiento, suelo, HUD y dos fotogramas de disparo para el ID 9. El retroceso y el fogonazo se componen en el motor.

En 1.5.3 se reutiliza ese mismo PNG, sin regenerarlo ni reemplazarlo. El motor añade una textura de trazadora de 16×3 y el icono `achievement-12` de 64×64, compuesto con el sprite existente y un borde dorado. No se utiliza un recurso externo adicional.

Prompt utilizado:

> Create a project-ready transparent pixel-art weapon sprite inspired by this reference. ONLY the standalone Requiem revolver seen large on left, silver steel long vented barrel pointing perfectly horizontally RIGHT, black engraved grip hanging downward LEFT, six-round cylinder, small red front sight. No hands, no human, no text, no UI, no logos, no shadows/background. Faithful silhouette/color separation, chunky low-resolution game sprite readable when normalized to a 32x32 canvas, tight dark outline, limited pixel palette. Single weapon centered with modest transparent padding. This will replace a side-view equipped gun sprite in a top-down pixel game; preserve barrel right/grip left orientation. Save final image.
