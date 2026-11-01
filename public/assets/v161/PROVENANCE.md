# Recursos 1.6.1

`menu.png`: copia sin alterar de la ilustración aportada por el usuario:
`D:/Descargas/Píxeles de sangre y derrota (1).png` (1672×941). Se muestra completa y proporcionalmente; no se redibujó.

`adrenaline.png`: recorte con alfa real obtenido con la herramienta integrada ImageGen, usando como objetivo de edición `D:/Descargas/Jeringa de adrenalina pixelada.png`. El archivo recibido tenía el cuadriculado blanco/gris incrustado, no transparencia. Resultado copiado desde `C:/Users/JorDanTe/.codex/generated_images/01a179fd-1cb1-7eb0-a871-5453101e2e48/exec-31755e88-e670-410b-ab5e-2516eabc124d.png`; original conservado. Dimensiones 1536×1024 RGBA, 1.368.104 píxeles totalmente transparentes. El icono de 32×32 se renderiza proporcionalmente en Phaser desde ese recorte.

Prompt utilizado (modo integrado, `transparent_background: true`):

> Use case: background-extraction. Edit target: provided pixel-art adrenaline syringe. Remove ONLY the white and grey checkerboard background and make it genuinely transparent alpha. Preserve the exact diagonal syringe shape, black outline, red lightning label, yellow liquid, pixel art palette and proportions. No new objects, no border, no text, no shadow, no redesign. Keep entire needle and plunger visible. This is a game pickup icon.

Las correcciones de opacidad de actores se realizan en la preparación de texturas/estado de Phaser, sin sobrescribir sus PNG originales. El fondo transparente y los píxeles de borde/efecto con alfa menor de 128 se conservan.
