# Recursos de economía y magnetismo

Generados con la herramienta integrada image_gen en modo generate, fondo transparente. Referencias artísticas del usuario: `Infografía pixel art de monedas en Curicó.png` y `Hoja de sprites neón de Hotline Curicó.png`. No se generan ni reemplazan personajes. Se conserva alfa real; recorte por celdas 4×2, ajuste al contenido visible y reducción nearest-neighbor a lienzos de 96×96 mediante tools/prepare_economy_assets.py.

Fuente local: docs/economy/atlas-source.png. Ocho recursos finales: copper, silver, gold, special, pocket, magnet-perk, spark y pulse en esta carpeta.

## Prompt exacto
Create ONE production sprite atlas for a pixel art top-down neon game, based on the two provided reference sheets ONLY as artistic style reference. No characters, portraits, writing, labels, panels or background. Transparent RGBA. Exactly 4 columns and 2 rows, equal square cells, each item centered with generous transparent padding and no overlap. Row 1: copper HC coin, silver HC coin, gold HC coin, purple-gold HC special chip. Row 2: red and white horseshoe pocket magnet with tiny magenta electric sparks, cyan magnetic-attraction perk icon with horseshoe and a couple of tiny coins, tiny gold four-point collection sparkle, cyan circular magnetic pulse ring with transparent middle. Crisp hand-drawn pixel art, chunky pixels and dark outlines, gold amber and cyan/magenta neon highlights, small icons readable at 24 pixels. The HC letters on coins may be stylized but no other text. Match the coin and magnet shapes in reference; do not draw illustrative people.

## Audio
Se reutilizan exclusivamente pickup.wav, reward.wav y electric.wav del proyecto. Procedencia y licencia originales en public/assets/audio/LICENSE.txt. AudioSystem conserva volumen/silencio y límites globales. CoinField añade un máximo de un evento económico cada 120 ms, también durante recogidas globales; no se añaden grabaciones externas ni recursos LANDR.
