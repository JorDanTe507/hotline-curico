# Hotline Curicó 2.2.2 — Roguelite: perks y evoluciones

## Novedades
- Renovación exclusiva de Modo Tradicional, solo y cooperativo local.
- Dieciocho propuestas integradas: once líneas nuevas y siete equivalencias con perks existentes; doce perks anteriores evolucionadas.
- Tarjetas con iconos, rarezas, niveles y comparación de valores efectivos; teclado, ratón, táctil y mando; movimiento reducido.
- Evoluciones exclusivas de Última Calada, Tryhard y Juicio Final. Curación de Jordan tras confirmar las eliminaciones.
- Curva de XP ajustada desde nivel once para builds en partidas largas.
- Conserva la base táctica 2.2.1 y el historial anterior de Novedades. Boss Rush conserva su catálogo de perks.

## Validación previa
298 pruebas automatizadas aprobadas; TypeScript sin errores; compilación de producción correcta. Recorridos de tarjetas, niveles máximos, reroll, cooperativo J2, veinte ejecuciones de Jordan y Tryhard proporcional en navegador. Recorrido móvil de producción sin errores de JavaScript o recursos. La simulación reproducible de progresión está en tools/simulate_roguelite.ts.

## Límites conocidos
Imán de fortuna permanece fuera del sorteo hasta incorporar monedas físicas. Las restricciones compartidas de algunas evoluciones y mejoras permanentes pueden saturar antes del último nivel de adquisición; la tarjeta muestra el efecto efectivo. La simulación de XP no sustituye una partida humana completa hasta ronda 60. Teléfono y mando comprobados mediante emulación, sin dispositivos físicos. Vite mantiene el aviso de chunk superior a 500 kB.

## Publicación
Rama main; etiqueta v2.2.2. No cambia claves de guardado ni modifica archivos personales. No incluye capturas de pruebas, atlas de preparación, temporales ni herramientas antiguas ajenas a la actualización. La base 2.2.1 se incluye para conservar el estado validado sobre el que se construyó esta renovación.
