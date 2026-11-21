# Economía física y magnetismo — entrega local sobre 2.2.2

Fecha: 18 de noviembre de 2026, America/Santiago. Base: main, a29764b35cf1492d49728e88be78d10aa6f336c2. No se cambia versión, se hace commit, se etiqueta ni se publica.

## 1. Auditoría y alcance

La auditoría previa está en [AUDITORIA-ECONOMIA-FISICA.md](D:/Escritorio/ruletadbd/hotline-curico/AUDITORIA-ECONOMIA-FISICA.md). La economía anterior guarda HC por protagonista; Boss Rush utiliza créditos independientes. Se conserva esa estructura permanente. El cambio físico se aplica al Tradicional individual y cooperativo; el modo desarrollador utiliza su progreso de prueba en memoria.

No se modifican XP, ultimates, armas, arrojadizos, IA, diálogos ni rotación de jefes. Los sprites oficiales de Cervela, Nicolás y Jordan se conservan.

## 2. Recompensas y funcionamiento real

| Fuente | Valor anterior | Entrega actual en Tradicional |
|---|---:|---|
| Baja normal | 5 HC | Moneda pendiente en el suelo |
| Baja de jefe | 200 HC | Moneda pendiente en el suelo |
| Incendiario, tier 12 | 5 + 50 HC | Dos abonos físicos fusionables, total 55 HC |
| Caja ordinaria, cuando su tirada es HC | 50 HC | Moneda pendiente; mismas probabilidades anteriores |
| Alcanzar una ronda múltiplo de cinco | 100 HC | Automático, como antes |
| Completar Exterminio | 50 HC | Automático, como antes |
| Completar Supervivencia | 75 HC | Automático, como antes |
| Caja fuerte | Arma | Se conserva el arma |
| Caja misteriosa | Compra de 500 HC | Mismo precio; usa el monedero de la sesión |

La XP por impacto/baja sigue siendo automática. Una prueba de baja real confirmó 10 XP y 5 HC pendientes, sin aumentar el monedero hasta recogerlos. Los HC pendientes no pertenecen todavía a los saldos permanentes y no pueden gastarse.

Cada baja sigue deduplicada por identidad. El registro de monedas retira la entidad antes de acreditar, por lo que dos actores no pueden cobrarla. Si se rechaza el abono, el registro devuelve la moneda al estado pendiente. Los valores son enteros seguros; las entradas fraccionarias, no finitas o desbordadas se rechazan.

Aspectos visuales por valor agregado: cobre para menos de 5 HC, plata 5–9, oro 10–49 y ficha especial desde 50 HC. No representan denominaciones que cambien el importe: una ficha puede valer 35 o 255 HC y acredita exactamente su valor lógico.

## 3. Persistencia, agrupación y obstáculos

CoinLedger conserva los registros durante toda la run. No está asociado a la limpieza de ronda ni a los sprites de un sector. Descargar o recargar sectores no copia ni elimina esos registros. Al morir definitivamente, abandonar o cerrar la escena se descartan los objetos pendientes y se destruyen sus vistas.

- Índice espacial en celdas de 192 px; fusión hasta 56 px con línea de suelo libre.
- No se fusiona a través de paredes; la selección del receptor de una fusión es estable por ID.
- La atracción normal comprueba el recorrido y cada desplazamiento; no atraviesa sólidos.
- La recogida final ocurre a 16 px del centro físico del actor.
- Si una fuente excepcional cae en una celda sólida, se proyecta al suelo próximo usando la misma búsqueda de botín del juego; nunca se conserva un sprite dentro del sólido.
- Como máximo se muestran 160 monedas y 32 imanes cercanos. Los demás registros conservan su valor sin cuerpos de física ni sprites.

Tradicional **no dispone de suspensión completa de runs**. ChunkLootStore conserva objetos dormidos durante la sesión, pero no restaura una partida después de cerrar la página. No se presenta una suspensión inexistente como funcionalidad nueva. CoinLedger incluye exportación/restauración validada y probada para una futura integración; no se escribe un supuesto guardado de run. La suspensión existente de Boss Rush no se modifica ni recibe monedas físicas.

## 4. Atracción magnética y mejora permanente

Se reutiliza el ID `magnet`, antes reservado y oculto, con el nombre **Atracción magnética**. Sigue siendo Poco común y general para los tres protagonistas. No se añade una segunda perk equivalente ni se cambian las exclusivas. El máximo de cuatro adquisiciones se respeta y la tarjeta muestra el radio combinado real.

| Perk | Nombre del nivel | Radio sin permanente | Velocidad de atracción |
|---|---|---:|---:|
| Sin perk | Base | 48 px | ×1,00 |
| I | Campo magnético | 72 px | ×1,10 |
| II | Polaridad mejorada | 96 px | ×1,20 |
| III | Magnetismo avanzado | 120 px | ×1,40 |
| IV | Núcleo magnético | 152 px | ×1,65 |

Nueva mejora permanente individual: **Campo magnético**, clave `magnet`, cinco niveles para cada protagonista. Añade 8 px por nivel al comenzar una partida. Se compra con sus HC permanentes; costes siguiendo upgradeCost:

| Nivel adquirido | Coste | Radio base total sin perk |
|---|---:|---:|
| 1 | 200 HC | 56 px |
| 2 | 350 HC | 64 px |
| 3 | 500 HC | 72 px |
| 4 | 650 HC | 80 px |
| 5 | 800 HC | 88 px |

Coste completo: 2.500 HC. Fórmula: min(192, 48 + 8 × nivel permanente + [0,24,48,72,104][nivel perk]). Combinación máxima: **192 px**, cuatro tiles del mundo, sin recogida global normal. La aceleración base es 1.100 px/s² y el techo de velocidad 620 px/s, multiplicados por el factor de la perk. La simulación usa pasos de hasta 50 ms para evitar saltos por una pausa larga.

Los guardados de formato 2 siguen utilizando hotline-permanent-v1. La nueva clave se normaliza a nivel cero cuando falta; se conservan moneda histórica, cuentas personales y mejoras anteriores. No se ha probado comprando sobre los guardados del usuario: todas las verificaciones usan almacenamiento en memoria o perfiles nuevos de navegador.

## 5. Imán de bolsillo

Tirada adicional independiente de **2,5 % por caja ordinaria destruida y reclamada**. No aparece sustituyendo el arma de una caja fuerte, el premio de una caja misteriosa ni la cura de una caja Uroboros. No consume armas, granadas ni espacio de inventario. Se activa automáticamente al acercarse a 42 px con línea de visión.

Captura las IDs pendientes en ese momento y procesa hasta seis registros por actualización. Los registros lejanos se contabilizan sin crear sprites. La accesibilidad se resuelve por componentes de suelo de los sectores; un componente cerrado no se cobra. Las calles exteriores de los sectores urbanos están conectadas por construcción. En mapas de cuadrícula fija se usa la navegación existente. La caché de componentes se invalida al cambiar colisiones y se limita a 256 sectores.

Una prueba mantuvo monedas dentro de un componente cerrado y las cobró únicamente después de abrirlo. Otra recuperó monedas a más de cinco sectores de distancia sin generar vistas lejanas. El pulso y los destellos representan la recogida global de forma simbólica; las monedas próximas utilizan desplazamiento físico gradual. Un segundo imán no interrumpe la recogida activa: permanece para activarse después. Las monedas nuevas que no pertenezcan a la captura inicial siguen pendientes.

## 6. Monedero cooperativo

Ambos actores comparten la misma instancia SessionWallet. El saldo común es la suma de las cuentas permanentes de los dos protagonistas participantes, incluyendo sus saldos ya existentes. No se crea una tercera copia del dinero, no se mueve el fondo histórico sin destinatario y las mejoras permanentes permanecen individuales.

Las recompensas comunes se reparten por mitades enteras entre ambas cuentas; el destinatario del HC impar rota según el orden de los abonos. Ejemplo: 5 HC se distribuyen 3/2 y la siguiente recompensa de 5, 2/3. Ambas interfaces muestran el mismo total. No se multiplica la recompensa por el número de jugadores.

Las compras de partida descuentan una sola vez del total disponible, tomando primero de la cuenta del anfitrión y después de la del compañero si hace falta. Validación y escritura del cambio se realizan en una transacción de PermanentProgress. Si no puede iniciarse la ruleta, se reembolsa exactamente el débito original a las mismas cuentas. Al volver al menú quedan las cuentas resultantes, sin necesidad de repartir o duplicar un saldo temporal.

Cada actor conserva su nivel de magnetismo y radio propio. Si dos actores están a igual distancia de una moneda, gana el menor playerId; si no, el más cercano. El crédito siempre entra en el monedero común. No se modifican la XP compartida existente ni las elecciones individuales de perks.

## 7. Presentación y recursos

Ocho PNG transparentes nuevos en [public/assets/economy](D:/Escritorio/ruletadbd/hotline-curico/public/assets/economy): cuatro monedas, imán de bolsillo, icono de perk, destello y pulso. Origen, modo integrado image_gen, prompt exacto y sonidos reutilizados documentados en [README.md](D:/Escritorio/ruletadbd/hotline-curico/public/assets/economy/README.md). Fuente local: docs/economy/atlas-source.png; preparación reproducible con tools/prepare_economy_assets.py.

Se incorporan aparición con dispersión visual pequeña, brillo, atracción acelerada, estelas limitadas a veinte, efecto de fusión y destello de recogida. Los indicadores +HC se acumulan y se limitan a uno cada 250 ms. El HUD existente conserva su transparencia y muestra HC COMPARTIDOS en los dos paneles cooperativos.

Se respetan movimiento reducido, volumen y silencio. Se reutilizan pickup, reward y electric originales; un máximo de un sonido económico cada 120 ms, además de los límites de AudioSystem. No se descargaron sonidos de terceros.

Capturas revisadas:
- [Escritorio](D:/Escritorio/ruletadbd/hotline-curico/docs/economy/desktop.png).
- [Cooperativo](D:/Escritorio/ruletadbd/hotline-curico/docs/economy/coop.png).
- [Móvil horizontal](D:/Escritorio/ruletadbd/hotline-curico/docs/economy/mobile.png).
- [Compra permanente móvil](D:/Escritorio/ruletadbd/hotline-curico/docs/economy/mobile-permanent.png).

## 8. Validación

- **310/310 pruebas automatizadas aprobadas**, sin omisiones. Incluyen doce pruebas nuevas de economía y la actualización de dos expectativas anteriores: magnet deja de estar oculta y hay ocho mejoras permanentes por protagonista.
- TypeScript sin errores; compilación de producción correcta. El recorrido móvil de la compilación local en puerto 5201 también pasó: menú, terminal, selección, combate de práctica y pausa, sin errores de JavaScript o recursos y sin global de desarrollo. Vite conserva su aviso de chunk superior a 500 kB.
- Navegador Edge con perfiles aislados: baja y XP reales, cambio de ronda/sector, recogida global remota, componente cerrado, caja con imán adicional, recogida simultánea, compra compartida, práctica sin monedas, desarrollador sin persistencia real, perk táctil y compra permanente móvil.
- Prueba lógica de 100.000 recompensas: conservación de 500.000 HC y consultas espaciales locales, sin escanear el registro global cada fotograma.
- Medición de navegador sobre 10.000 recompensas de 5 HC: 174 registros agrupados, 159 sprites visibles, 89,4 ms para generar todo el lote y 2,2 ms en la actualización medida. Recogida global de los 50.000 HC sin saldo pendiente y sin duplicación; actualización más costosa observada de 3,9 ms. Valores puntuales de este equipo; no equivalen a FPS garantizados en un teléfono.

Registros reproducibles en test-results/physical-economy-tests.log, physical-economy-build.log, physical-economy-browser.log, physical-economy-browser-final.log, physical-economy-production.log, physical-economy-roguelite.log y physical-economy-rush.log. Regresión de roguelite aprobada: teclado, ratón, mando virtual J2, táctil, reroll, nivel máximo, Tryhard y veinte ejecuciones de Jordan. Regresión completa de Boss Rush aprobada en escritorio y móvil: seis arenas, infinito y dobles, relevos, botín, compras, ruleta, suspensión/continuación, retiro, derrota y práctica de Wesker; sin errores de recursos o JavaScript.

## 9. Archivos

Nuevos: src/economy/CoinLedger.ts, CoinField.ts, SessionWallet.ts y assets.ts; tests/physicalEconomy.test.ts; tools/check_physical_economy.cjs y prepare_economy_assets.py; public/assets/economy/; docs/economy/; auditoría, este informe y NOVEDADES-ECONOMIA-FISICA-BORRADOR.md.

Modificados: src/config/permanent.ts y progression.ts; src/main.ts; src/mobile/MobileMenus.ts; src/roguelite/catalog.ts; src/scenes/Game.ts y Upgrades.ts; src/systems/PermanentProgress.ts; src/ui/GameplayHudState.ts; src/v19/CoopSession.ts; src/world/FortuneObjects.ts; tests/rogueliteEvolution.test.ts y v14.test.ts.

Se conservan los cambios previos de tools/check_boss_rush210.cjs y tools/prepare_jordan20.py; no forman parte de esta tarea.

## 10. Límites y prueba local

- No hay suspensión/reanudación completa en Tradicional; cerrar o reiniciar descarta las monedas pendientes de esa run, igual que los restantes objetos temporales. La suspensión de Boss Rush permanece intacta.
- El imán global representa las monedas lejanas mediante efectos simbólicos y abonos por lotes, sin reproducir miles de trayectorias.
- No se utilizó un teléfono ni un mando físicos. Se verifican emulación móvil y mando virtual; hace falta la prueba personal del usuario.
- No se afirma que todas las builds estén equilibradas tras una partida humana completa de sesenta rondas.
- Versión publicada conservada en 2.2.2. Sin nuevo commit, staging, etiqueta, push o despliegue.

Borrador de Novedades separado del historial público: [NOVEDADES-ECONOMIA-FISICA-BORRADOR.md](D:/Escritorio/ruletadbd/hotline-curico/NOVEDADES-ECONOMIA-FISICA-BORRADOR.md).

[Probar localmente](http://127.0.0.1:5197/hotline-curico/). Desde teléfono en la misma wifi: [vista previa de red](http://192.168.1.6:5197/hotline-curico/). Entrar en Modo Tradicional.
