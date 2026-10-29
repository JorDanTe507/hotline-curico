# Hotline Curicó 0.9.1 — arsenal completo y armas recuperables

Validado el 27 de octubre de 2026 sobre el proyecto existente, manteniendo mundo por sectores, progresión 0.9 y menú animado. No se reconstruyó el juego.

## Auditoría previa

Existían ocho armas funcionales: pistola, revólver, subfusil, escopeta, rifle de asalto, rifle de precisión, RPG y minigun. Las otras ocho aparecían como propuestas de ruleta con identificador nulo; no tenían combate implementado. Se añadieron Mini Uzi, Magnum, recortada, M79, lanzallamas, bate, palanca y hacha, sin duplicar las anteriores. Los identificadores 0–7 se conservaron; las nuevas usan 8–15.

## Comportamientos implementados

Valores base, antes de mejoras:

| Arma nueva | Daño | Cargador / reserva | Intervalo | Recarga | Alcance |
|---|---:|---:|---:|---:|---:|
| Mini Uzi | 8 | 30 / 150 | 70 ms | 1400 ms | 500 px |
| Magnum | 45 | 6 / 36 | 650 ms | 1800 ms | 850 px |
| Recortada | 10 × 7 perdigones | 2 / 24 | 850 ms | 2100 ms | 280 px |
| M79 | hasta 90 | 1 / 12 | 1400 ms | 2600 ms | 620 px |
| Lanzallamas | 6 por emisión | 100 / 200 combustible | 100 ms | 2300 ms | 190 px |
| Bate | 25 | sin munición | 500 ms | ninguna | 66 px |
| Palanca | 30 | sin munición | 560 ms | ninguna | 78 px |
| Hacha | 55 | sin munición | 900 ms | ninguna | 64 px |

La Uzi dispara automáticamente con dispersión elevada. Magnum tiene dispersión reducida y una sacudida mayor. Recortada dispara siete perdigones con apertura amplia. M79 lanza una granada visible a 350 px/s; explota al impactar o agotar alcance, con radio de 125 px y daño decreciente según distancia. Las paredes bloquean el proyectil y la explosión; también puede causar daño propio, siguiendo el sistema existente.

El lanzallamas emite partículas de fuego que dañan y consumen combustible real. La quemadura dura un segundo, inflige 2 puntos cada 250 ms y renueva su duración sin acumular temporizadores. Conserva el crédito del impacto original para no cargar varias veces la ulti por la misma quemadura. Sus proyectiles colisionan con paredes. Los enemigos usan ese mismo alcance y combustible.

Las armas cuerpo a cuerpo comprueban distancia, dirección y línea de visión. Tienen un barrido visible y sonido propio; no gastan munición ni activan recarga. El bate tiene un 30% de probabilidad de aturdir a enemigos normales; conserva la inmunidad de los jefes. Las mejoras de daño, crítico, daño cercano, daño melee y velocidad de ataque se aplican según corresponda.

Se mantienen los parámetros base de La Barredora: 12 de daño, 200 balas, 20 disparos/s, preparación de 600 ms, recarga de 4 s, movimiento al 80% durante disparo y penetración de dos objetivos con daño reducido en el segundo. RPG y minigun conservan cada uno el 1% de probabilidad en el selector de botín normal. El botín adicional de una baja mantiene su tirada previa independiente.

Todas las armas nuevas tienen recortes individuales transparentes de 32×32, sprite equipado y de suelo, icono HUD, cuadros de uso, sonido local, peso de ruleta e inventario de dos espacios. La ruleta usa las 16 armas y sus pesos suman 100. Los recursos se extrajeron del atlas entregado con rectángulos explícitos, documentados en `public/assets/weapons/second/crops.json`; no se muestra la lámina completa como arma.

## Propiedad, caída e intercambio

`GroundWeapon` conserva identificador de instancia, tipo, posición, cargador, reserva, disponibilidad, propietario anterior y sector. `WeaponInstances` mantiene una referencia canónica y estados player/enemy/ground/flying. La recogida reclama esa referencia de forma atómica. Una segunda recogida del mismo objeto falla.

Las clases enemigas armadas empiezan con armas reales: pistola, subfusil, escopeta y rifle. Gastan munición, recargan desde su reserva y usan daño, perdigones, cadencia y alcance de su arma. Al agotarse completamente pueden buscar otra o recurrir al combate cercano. El Torturado conserva sus ataques y cargador especial de cuatro cartuchos; ahora usa la misma instancia que dejará al morir, con reserva finita de 60 cartuchos. Si la agota, continúa persiguiendo y usando su ataque cercano.

La muerte transfiere siempre el arma equipada al suelo accesible, cerca del cadáver, antes del botín aleatorio adicional. La referencia se retira del enemigo primero; impactos posteriores no repiten la caída. Las retiradas de ronda no generan botín ni bajas.

Los matones buscan armas utilizables a 160 px, ordenadas por proximidad, y comprueban suelo y ruta. Una reserva de objetivo y la reclamación atómica impiden que dos matones obtengan la misma instancia. Tras recoger, usan su categoría real, incluida melee, fuego, explosivos, escopetas y minigun. La línea de visión bloquea ataques a través de paredes.

E conserva exactamente cargador y reserva. Con dos armas sustituye la activa y deja la anterior en el suelo. G la retira del inventario, pasa al estado flying, golpea y aturde, y solo queda disponible después de detenerse. Se mantiene la misma identidad en toda la cadena jugador → vuelo → suelo → enemigo → muerte → suelo → jugador.

## Sectores, recursos y Última Calada

Al dormir un sector se serializan identidad y munición, se elimina el objeto Phaser y se retira del registro activo. Al volver se restaura una única instancia con el mismo identificador. El arma equipada sigue al enemigo entre sectores y cae en el sector de su muerte.

Cada segundo se aplica un límite flexible de 128 objetos activos: solo duermen los excedentes a más de 1100 px; se recuperan al acercarse a 1000 px. Los objetos cercanos se conservan aunque temporalmente superen ese límite. Se mantiene el almacenamiento de sesión y su respaldo acotado de 256 sectores cuando el navegador no lo permite. Reintentar elimina registro, proyectiles, quemaduras, sectores y almacenamiento de la partida anterior.

Última Calada admite combinaciones distintas, conserva munición y combustible durante su efecto, mantiene la preparación de minigun y no inventa munición para melee. Las cadencias son independientes y cada ataque genera su daño una vez. HUD muestra combustible o CUERPO A CUERPO según el caso, icono de arma y segunda arma visible con tamaño válido durante la ulti.

## Pruebas ejecutadas

- TypeScript: `tsc --noEmit`, correcto.
- Unidad: `tsx --test tests/*.test.ts`, **61/61 aprobadas**. Incluyen exclusividad de instancia, serialización, quemadura sin apilamiento ni crédito repetido, modificadores, recarga melee nula y recursos normalizados. Se actualizaron las expectativas anteriores de ocho armas a dieciséis.
- `check-arsenal.cjs`: ataques de jugador y NPC con las 16 armas; munición y perdigones reales; daño melee; recogida de todas; caída garantizada una sola vez; munición exacta; dos reclamantes; intercambio de inventario lleno; G/aturdimiento/caída/reutilización enemiga/recuperación; tres ciclos de sectores con identidad conservada; granada visible y explosión 90; fuego 6 y quemadura 8; combinación fuego/hacha sin gasto; recargas reales; colisiones contra paredes; línea de visión; recarga enemiga; aturdimiento del bate con azar inyectado; HUD y límite flexible; limpieza al reintentar. Correcto, sin errores JavaScript.
- `check-v07.cjs`: ruleta inicial y entre rondas, congelación de simulación, jefes, minigun a 20 Hz, preparación, recarga, penalización, penetración, paredes, minigun/RPG durante ulti, tres reintentos y video silenciado en bucle. Correcto.
- `check-v09.cjs`: experiencia, elecciones únicas por teclado/mouse, mejoras acumuladas, modificadores, vida/chaleco, daño letal y tres reintentos. Correcto.
- `check-v062.cjs`: regeneración 20 HP/s durante 12 s, reducción del 40% sin inmortalidad, chaleco/absorción/sobrante, recompensas, HUD, rondas, jefe y menú. Correcto.
- `check-world.cjs`: 17 comprobaciones de mundo, rutas, spawns, botín, niveles, supervivencia, jefe y reintentos. Correcto. Recorrido físico hasta la zona industrial; nueve sectores activos, caché de 64, 20 capas y hasta 444 cuerpos estáticos. Medición local con 24 enemigos: mediana **5,5 ms**, percentil 95 **6,2 ms** por actualización. Esta medición depende del equipo y no es una garantía de FPS en otros dispositivos.
- Producción: `vite build`, correcto. Persiste el aviso de tamaño del paquete principal de Phaser; no impide compilar.

Capturas: `arsenal-assets.png` para extracción y `arsenal-v091.png` para el HUD del lanzallamas y un Magnum en el suelo. Menú animado y su audio no se modificaron.

## Límites de esta entrega

M79 usa trayectoria recta, sin arco ni rebote. Las animaciones nuevas combinan poses existentes de Cervela, cuadros de arma y efectos por código; no son un conjunto nuevo de animaciones corporales para cada arma. Los efectos de granada, fuego y barrido son estilizados. La persistencia pertenece a la partida actual, no a una partida guardada después de cerrar el navegador. Las secciones antiguas del README siguen describiendo sus versiones históricas; este informe describe el arsenal vigente.
