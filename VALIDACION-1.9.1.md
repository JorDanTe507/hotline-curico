# Hotline Curicó 1.9.1 — Correcciones cooperativas

Entrega local, 2 de noviembre de 2026. Sin commits, push ni despliegues. Se conserva el trabajo anterior de 1.9 y el HUD J1 izquierda/J2 derecha.

## Correcciones

1. **Cámara y exploración.** El punto medio, la restricción de separación y el ancla de sectores usan únicamente jugadores activos. Un agonizante permanece en sus coordenadas, mantiene los 120 segundos y no restringe al superviviente. Tras reanimar vuelve la cámara común mediante interpolación con velocidad limitada; si la separación es excepcionalmente grande, el límite se reduce progresivamente hasta las 780 unidades anteriores, permitiendo acercarse incluso junto a obstáculos. La muerte definitiva tampoco participa en la cámara. No se cambia la cámara individual.
2. **Referencias al jugador caído.** Enemigos distantes, botín activo/dormido, visibilidad de suministros y distancias de seguridad de refuerzos/barriles toman como referencia a jugadores activos. Esto evita reciclar enemigos continuamente o mantener suministros ocultos alrededor del cuerpo de J1 cuando J2 explora lejos.
3. **Enemigos sin nombres flotantes.** Se vació el texto inicial y el identificador normal del sistema de supervivencia, incluido el Radioperador. Permanecen avisos de aturdimiento, ejecución y llamada, así como nombres y presentaciones de jefes.
4. **Identificación cooperativa.** CERVELA lleva contorno rojo `#ff2244` y NICOLÁS azul `#2865ff`, independientemente del número de jugador. Son textos completos de tamaño compacto, con sombra y escala compensada por el zoom, ligados a coordenadas del mundo. No aparecen en individual.
5. **Salud crítica cooperativa.** Se reutiliza `CriticalAlert`: entrada al 25% y salida por encima del 30%, con histéresis. Cada personaje tiene un borde propio. El primero en entrar ocupa el exterior; el segundo aparece 32 píxeles hacia dentro, con siete trazos suaves separados para evitar el borde morado. Curarse retira solamente su alerta, con la transición de salida existente; la alerta restante se recoloca después del desvanecimiento. La agonía cancela la alerta normal de ese personaje.
6. **Audio médico.** Un único programador cooperativo reproduce el sonido existente, con ganancia 0,9 y el intervalo anterior. Nunca se inicia un segundo sonido mientras el primero reproduce. Respeta volumen, silencio, pausa, cartas, ruleta y fin de partida. El camino individual de `CriticalHealth` se mantiene; el cooperativo deja de ejecutar dos programadores individuales que podían detenerse mutuamente.
7. **Compañero caído.** Una flecha triangular con contorno blanco rodea al superviviente y apunta a la posición real del agonizante, con el color del caído. No es una trayectoria de arrojadizo y no tiene interacción. El cuerpo tendido recibe ocho copias alfa desplazadas por detrás, tintadas del color correspondiente: forman un contorno siguiendo el fotograma real sin colorear ni sustituir el cuerpo original, sin chroma key. Escala, rotación, origen y respiración se conservan. Flechas y contornos se limpian al reanimar, morir definitivamente, acabar, reintentar o salir.
8. **Derrota conjunta.** Se integró exactamente `D:/Descargas/Pantalla de derrota en el callejón neón.png`, copiada a `public/assets/v19/coop-death.png`. Se muestra completa y proporcional en el lienzo 1280×720. Dos zonas transparentes se alinean a REINTENTAR y MENÚ PRINCIPAL, sin duplicar el texto ni dibujar botones adicionales. Solo se usa al terminar realmente una partida cooperativa, cualquiera sea J1. Reintentar mantiene el modo y los personajes; salir limpia la escena y sus señales. Las pantallas individuales continúan usando sus recursos anteriores.

## Archivos modificados en 1.9.1

- Nuevo `src/v19/CoopSignals.ts`: nombres, contornos alfa, flechas, bordes y audio común.
- `src/v19/CoopSession.ts`: cámara, separación y ancla del mundo para activos.
- `src/v19/CoopHud.ts`: ciclo de creación, actualización y limpieza de señales; disposición anterior conservada.
- `src/systems/CriticalHealth.ts`: ruta cooperativa sin competir con las alertas individuales; lógica individual preservada.
- `src/scenes/Game.ts`, `src/systems/SurvivalSystem.ts`, `src/v19/RadioSystem.ts`: etiquetas y referencias a protagonistas activos.
- `src/world/WorldStreamer.ts`, `src/chaos/Barrels.ts`, `src/systems/RoundDirector.ts`: botín y distancias de seguridad con el superviviente.
- `src/ui/DeathSequence.ts`: composición conjunta, zonas interactivas y reintento cooperativo.
- `src/main.ts` y `public/assets/v19/coop-death.png`: carga relativa del recurso suministrado.
- `src/config/releaseNotes.ts`, `package.json`, `package-lock.json`: versión 1.9.1, notas e historial conservado.
- `tests/atmosphere173.test.ts`: expectativa de versión e historial.
- Nuevos `check-coop191.cjs` y `check-production191.cjs`: comprobaciones reproducibles.

El árbol de Git contiene cambios anteriores a esta corrección; no se sobrescribieron ni se atribuyen todos a 1.9.1.

## Pruebas realizadas

| Comprobación | Resultado |
| --- | --- |
| TypeScript y `npm run build` | Correctos. Aviso de Vite por tamaño del bundle, sin error de compilación. |
| Suite unitaria completa | 196/196 correctas. |
| `check-coop191.cjs` | Cámara compartida, caída de ambos personajes por separado, exploración a más de 3000 unidades sin mover al cuerpo, enemigos cercanos sin reciclado indebido, cámara recuperada progresivamente y libertad tras muerte definitiva. |
| Señales del mismo script | Nombres completos y colores al intercambiar protagonistas; 17 tipos sin identificador inicial; aturdimiento conservado; flecha fuera de pantalla; contorno real con respiración; limpieza de indicadores. |
| Alertas del mismo script | Rojo y azul simultáneos; orden `[Cervela,Nicolás]` y orden inverso; recuperación independiente; un único sonido en reproducción. |
| Derrota del mismo script | Imagen conjunta con J1 Cervela y J1 Nicolás, clic real en las zonas de ambos botones, reintento cooperativo con salud y agonía reiniciadas, menú y limpieza; pantallas individuales de ambos personajes conservadas. |
| `check-coop19.cjs` | Regresión correcta: movimiento/disparo independientes, armas/munición, botiquines, arrojadizos, recuperación de cuchillo, XP de J2, dos ruletas, HUD intercambiado, cartas y cambio con mando, definitivas simultáneas, reanimación real con interacción mantenida y 20 HP, pausa del temporizador y jefe sin diálogo. |
| `check-polish181.cjs` | Correcto para ambos protagonistas: alerta individual, volumen, pausa, curación, muerte, RPG/reserva/recarga y presentación móvil emulada. |
| `check-production191.cjs` | Build servido localmente bajo `/hotline-curico/`: versión e historial correctos, 167 imágenes v18/v19 cargadas, imagen conjunta incluida idéntica al recurso local, audio y controles táctiles conservados; sin errores HTTP ni JavaScript y sin global de depuración. |
| Revisión visual | Capturas de HUD, nombres, alertas concéntricas, flecha fuera de cámara, cuerpo tendido con contorno y pantalla de derrota completa. |

Los escenarios de cámara y daño usan posiciones y relojes controlados para reproducir los fallos; la reanimación mantenida y las entradas también se verificaron en el bucle real. Se usó Edge y un mando simulado, además de emulación móvil. No se afirma una prueba nueva con mando Bluetooth/USB físico ni con Android real. No se realizó una partida humana completa de 25 rondas.

## Estado

Correcciones locales terminadas, sin errores bloqueantes detectados. Pendiente la comprobación del usuario con su mando Bluetooth y su equipo real. El aviso de tamaño de bundle es informativo. No se publicaron cambios y el historial Git no se modificó.
