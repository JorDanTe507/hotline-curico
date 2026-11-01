# Validación local — primeros ajustes 1.7.1

Base estable: 1.7. Solo diálogos de presentación y geometría visual/de impactos de jefes. No se crearon commits, no se hizo push y no se publicó. No se modificaron imágenes originales, metadatos de publicación, clima, eventos, rondas, inventario ni habilidades.

## Diálogos

Se añadieron replies por jefe y protagonista en expansion.ts y se seleccionan en la tercera pantalla de BossDialogue. Las amenazas y los encabezados existentes permanecen, con tres pantallas por encuentro. El Torturado continúa usando los textos originales del catálogo: no se modificó catalog.ts ni sus diálogos.

Respuestas nuevas:

| Jefe | Cervela | Nicolás |
|---|---|---|
| Comandante | Perfecto. Porque yo tampoco vine a salvar a nadie. | Ya me di cuenta. Los gráficos después de todo son pixel art. |
| Demoledor | Entonces procura no estar demasiado cerca cuando explotes. | Ah, como Mr. Five de One Piece. |
| Verdugo | Qué coincidencia. Yo también estaba esperando que dejaras de hablar. | Llevo veinte rondas escuchando amenazas. Ponte a la fila. |
| Carnicero | Entonces nadie va a extrañarte cuando termine contigo. | Después de ti me voy a hacer Enies Lobby Hard. |

Se verificaron rondas 5–25 y 30–50 con ambos protagonistas. La frase de veinte rondas es literal también en la ronda 45. No se añadieron diálogos de combate o muerte. En la vista móvil existía un título fijo EL TORTURADO para todos: se corrigió para mostrar el nombre del jefe del encuentro, conservando los controles y el contenido.

## Tamaños y geometría

Todos pasan de escala uniforme 0,62 a 0,837: +35% por eje, sin suavizado ni deformación. No se editan PNG ni atlas. Se ajustó originY para que los pies conserven exactamente su posición anterior al escalar. Las armas auxiliares de los cuatro jefes nuevos escalan y se reposicionan con el cuerpo; las animaciones de ataque que llevan arma dibujada siguen ocultando el auxiliar. Los rótulos subieron para no tocar la cabeza.

Dimensiones visibles medidas en el fotograma de movimiento observado durante la prueba (no incluyen el padding transparente; varían según la pose):

| Jefe | Antes, ancho×alto px | Nuevo, ancho×alto px |
|---|---:|---:|
| El Torturado | 40,30×63,24 | 54,41×85,37 |
| El Comandante | 35,34×62,00 | 47,71×83,70 |
| El Demoledor | 34,72×55,80 | 46,87×75,33 |
| El Verdugo | 30,38×60,14 | 41,01×81,19 |
| El Carnicero | 33,48×61,38 | 45,20×82,86 |

Cuerpo físico de movimiento de los cinco: antes 28,52×22,32 px; nuevo 38,50×30,13 px. Se mantienen los offsets de la huella en coordenadas originales de imagen y se compensa el origen. Es menor que un tile de 48 px y se probó atravesando una puerta real.

La detección de balas anterior era un círculo fijo de radio 30 alrededor del origen del sprite; no consultaba el cuerpo físico. Se sustituyó SOLO para jefes por una elipse de torso, centrada y dimensionada por jefe. La huella de los pies controla paredes/movimiento; la elipse recibe ataques en cabeza y torso, sin convertir el padding o las armas extendidas en objetivos.

| Jefe | Extensión rectangular de la elipse nueva, ancho×alto px |
|---|---:|
| El Torturado | 58,59×87,05 |
| El Comandante | 50,22×80,35 |
| El Demoledor | 46,87×77,00 |
| El Verdugo | 45,20×78,68 |
| El Carnicero | 45,20×78,68 |

Las esquinas de ese rectángulo no reciben impactos: son elipses, no cajas completas. El radio anterior también aceptaba zonas vacías laterales; la nueva geometría prioriza la silueta real y extiende la cobertura vertical. Se probó acertar entre 39 y 45 px por encima del origen, donde el radio viejo fallaba, y fallar justo fuera de los laterales nuevos.

Balas/escopetas/lanzallamas consultan la elipse; Requiem usa intersección barrida conservando penetración y orden. Explosiones y ataques de jugador contra jefes consultan la distancia a esa superficie, manteniendo el radio/alcance del ataque y las fórmulas de daño existentes. Enemigos normales continúan usando exactamente sus reglas anteriores. No cambia ningún alcance de ataque enemigo.

## Archivos

- src/bosses/expansion.ts: ocho respuestas específicas; amenazas y estadísticas intactas.
- src/ui/BossDialogue.ts: seleccionar respuesta por jefe/protagonista.
- src/mobile/MobileMenus.ts: encabezado móvil del jefe correcto.
- src/bosses/BossGeometry.ts (nuevo): configuración individual, origen, elipse y consultas geométricas.
- src/scenes/Game.ts: escala/cuerpo al generar jefes; integración de geometría en disparos, Requiem y explosiones.
- src/bosses/NewBosses.ts y Torturado.ts: rótulos; alineación visual de arma auxiliar donde corresponde.
- src/systems/SurvivalSystem.ts y src/weapons/WeaponCombat.ts: recepción sobre la superficie ampliada de jefes, sin cambiar daño ni alcance de armas.
- tests/bosses171.test.ts, check-bosses171.cjs y check-bosses171-controls.cjs (nuevos).
- Este informe.

## Pruebas

- 169 pruebas unitarias aprobadas, cero fallos.
- TypeScript sin errores.
- npm run build correcto; conserva la advertencia de bundle Phaser mayor de 500 kB.
- Suite nueva de navegador: 20 encuentros de diálogo (cinco jefes, dos protagonistas, primer ciclo y repetición). Frases exactas, encabezados, tres pantallas, cierre y comienzo de combate correctos.
- Cinco jefes: impactos nuevos de pistola, seis perdigones, Requiem y explosión; disparos fuera de la elipse no dañan. La primera fixture se movió a una intersección abierta porque un mueble bloqueaba el recorrido de Requiem: no se alteró la colisión de paredes.
- Movimiento físico real por puerta del complejo para los cinco jefes; misma escala/cuerpo al cambiar de animación y orientación; cadáveres conservan escala ampliada.
- Enemigo normal: visual 42×58 px y cuerpo 19,25×18,642857 px, iguales a 1.7.
- Táctil emulado: cinco encabezados correctos y presentaciones de ambos protagonistas. Mando estándar simulado: tres pantallas del Verdugo en ronda 45.
- check-maintenance162.cjs: jefes, ataques, daño, muertes, Tryhard, suministros y ratón/R2; aprobado.
- check-requiem153.cjs: penetración, paredes, rango, deduplicación, desafíos, definitivas y guardado; aprobado.
- Revisión visual de capturas locales y diff. Sin errores JavaScript/HTTP en la suite nueva.

No se probó en teléfono Android físico ni con DualShock físico. No se afirma una prueba humana exhaustiva de todos los recorridos procedurales; las comprobaciones cubren conectividad existente, puerta real y generación estándar con margen libre. No se detectaron errores pendientes en las pruebas ejecutadas. No se tocaron vida, daño, velocidad, frecuencia de ataque ni habilidades: no fue necesario un cambio de balance.
