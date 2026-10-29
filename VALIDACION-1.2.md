# Validación 1.2 — mejoras permanentes y economía

Implementado sobre el proyecto existente, sin reconstrucción. El vídeo y la música del menú, arsenal, escenarios, rondas, cartas y selección de personajes se conservan.

## Sistemas y archivos

- `src/config/permanent.ts`: costes (200 + nivel × 150), recompensas HC y los doce límites centralizados.
- `src/systems/PermanentProgress.ts`: snapshot versionado, validación/normalización, recuperación de JSON corrupto, guardado inmediato, compras y billetera compartida. RunEconomy evita doble crédito por enemigo, ronda e hito dentro de cada partida. El hito se paga al alcanzar la ronda múltiplo de cinco; el jefe paga 200 HC y no recibe además la recompensa de enemigo normal.
- `src/scenes/Upgrades.ts`: nueva pantalla con retratos oficiales, selector, seis tarjetas por personaje, niveles iluminados, costes, MÁX., hover, destello de compra, sonidos de compra/error, saldo compartido y aviso si falla localStorage. Esc/VOLVER regresan al menú. Phaser FIT adapta el lienzo completo sin solapamiento.
- `public/assets/upgrades/atlas.png`: copia del atlas proporcionado, con frames de iconos definidos en Phaser; no se muestran sus textos como reglas del juego.
- `src/scenes/Menu.ts`, `src/main.ts`: botón MEJORAS, registro de escena/carga de atlas y versión 1.2.
- `src/config/progression.ts`, `src/systems/PlayerModifiers.ts`, `src/systems/UpgradeCatalog.ts`: campos derivados, daño permanente solo de fuego, cartas compatibles y límites combinados.
- `src/systems/Tryhard.ts`, `src/systems/Armor.ts`: multiplicador hasta ×6, velocidad hasta +40%, duración inicial hasta 10 s, dash modificado; Calada hasta 50% de resistencia permanente. Identidades y conversión proporcional intactas.
- `src/scenes/Game.ts`, `src/systems/RoundDirector.ts`: aplicación de compras al comenzar/reintentar y recompensas inmediatas por eventos válidos.
- `src/ui/DeathSequence.ts`: HC ganados y rondas completadas en el resumen existente, conservando arte, frases y botones propios. Mostrar el resumen no vuelve a pagar.
- `tests/permanent.test.ts`, `check-v12.cjs`, `check-save-v12.cjs`: pruebas nuevas. `package.json`, `README.md`: versión, comando y reglas documentadas.

## Resultados

- TypeScript `tsc --noEmit`: PASS.
- Suite `tsx --test tests/*.test.ts`: **79/79 PASS** (73 previas + 6 nuevas).
- `vite build`: PASS. Advertencia previa de bundle Phaser >500 kB, sin errores de compilación.
- `check-v12.cjs`: PASS. Apertura/cierre de MEJORAS, selector, compras mediante clic real, saldo compartido, niveles independientes, persistencia por recarga/contexto nuevo, retratos e iconos, ventana 960×640, estadísticas reales al empezar, baja real normal y jefe sin duplicación, recompensas de ronda/hito, resumen HC, reintento conservando saldo y compras, cero errores JavaScript.
- `check-save-v12.cjs`: PASS. Cierre real del proceso de navegador y reapertura del mismo perfil aislado: retiene 350 HC y Vitalidad de Nicolás nivel 1.
- `check-v11.cjs`: PASS. Capacidad proporcional, daño letal, alarma crítica, pausa, cinemáticas, reintento, selección y volúmenes.
- `check-arsenal.cjs`: PASS. Las 16 armas, NPC, munición, botín, lanzamiento, persistencia de instancias, recarga, efectos y limpieza.
- `check-v09.cjs`: PASS. XP/cartas/elección, mejoras, minigun, daño, límites, tres reintentos y ausencia de errores JavaScript.

Las seis pruebas nuevas cubren también falta de fondos, cada nivel máximo, coste creciente, snapshot atómico, datos corruptos/negativos/no finitos, protección de otras claves, fallo de almacenamiento, recompensa idempotente, HP 200×6=1200, 120+20 de carta→140×5=700, fin proporcional, Calada 25 HP/s/14 s/50%, daño combinado y dash.

## Composición y límites

Daño permanente de fuego es multiplicativo con cartas y la habilidad, y no afecta melee. Vitalidad permanente +100 HP se combina con las cinco cartas de +20 (máximo normal combinado 300). Tryhard nunca regenera ni proporciona munición infinita; su duración total sigue limitada a 14 s. El dash especial aplica Reflejos permanente a 500 ms con suelo técnico de 400 ms (410 ms al máximo); las cartas de dash operan sobre el enfriamiento normal. Calada suma sus cartas previas a los incrementos permanentes.

El guardado es local al navegador/origen, sin sincronización entre dispositivos. Borrar los datos del sitio lo elimina. Si localStorage está bloqueado o lleno, se conserva la sesión en memoria y aparece un aviso; no puede garantizarse persistencia en ese caso. La economía se acredita al ocurrir el evento y no al cerrar la pantalla de derrota. Los tests usan perfiles aislados y no otorgan HC al guardado del usuario.

Capturas revisadas: `upgrades-cervela-v12.png`, `upgrades-nicolas-v12.png`, `upgrades-small-v12.png`, `death-economy-v12.png`.
