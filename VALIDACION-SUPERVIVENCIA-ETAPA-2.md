# Supervivencia Continua · Etapa 2

## Base local

Rama main, versión 2.2.2, HEAD a29764b. La copia de trabajo ya incluía la economía física, las correcciones de escenarios, la etapa 1 y herramientas locales. Esta entrega se hizo en esa copia de trabajo. No se creó un commit ni una etiqueta y no se realizó push ni despliegue.

## Qué cambia al jugar

En Tradicional individual la ruleta conserva su animación, tabla y ganador. Cuando termina, el arma ocupa la mano del protagonista. Continua utiliza el mismo sorteo que en la etapa 1 y la equipa al entrar. El arma se registra como propiedad del jugador con la capacidad de cargador y el ajuste de reserva que le corresponden. La entrega inicial protege un inventario ya ocupado. Las cajas, las armas que sueltan los enemigos y la recogida del suelo siguen su flujo habitual. El cooperativo tradicional ya equipaba el arma de cada ruleta directamente.

En Continua, el primer ciclo presenta a Torturado, Comandante, Demoledor, Verdugo y Carnicero en orden aleatorio sin repetir. Hay un encuentro cada cinco minutos efectivos. El sexto corresponde a Wesker y puede retrasarse si un encuentro anterior sigue activo. Se reutilizan la IA y las armas de los jefes de Tradicional. Wesker utiliza su controlador Uroboros con sus dos formas, sin cambiar el inventario ni pausar el mundo para la mutación.

## Calendario y población

El calendario lee el cronómetro de simulación. Cada aviso empieza diez segundos antes de la aparición y utiliza el efecto sonoro de alerta existente. A partir del minuto 35, la probabilidad de doble comienza en el 18 %, aumenta 4,5 puntos por encuentro y llega hasta el 72 %. El segundo integrante aparece entre diez y quince segundos después del primero si encuentra espacio válido. Cuando el mapa rechaza una posición se vuelve a intentar cada 500 ms.

El número de encuentro y el ordinal del jefe identifican cada aparición. El intervalo entre el próximo número pendiente y el número que corresponde al reloj representa toda la cola en orden, incluso tras una pelea muy larga. La transición de un encuentro atrasado dura diez segundos e incluye su aviso.

Con uno o dos jefes vivos, la frecuencia de aparición de enemigos comunes se aproxima al 70 % o al 45 %. El ajuste es gradual y conserva el límite de población de la etapa 1. La salud y el daño de cada jefe se calculan con el minuto programado de su encuentro. Los incrementos se aproximan al 85 % y al 45 % respectivamente.

## Navegación e interfaz

Cada aparición exige distancia de seguridad, suelo libre y conexión al jugador. En campo abierto y a corta distancia actúa la IA normal. Fuera de vista o detrás de una obstrucción, la persecución sigue una ruta por celdas que admiten la huella física del jefe. Si el protagonista entra donde el jefe no cabe, la búsqueda conserva la celda alcanzable más cercana. La ruta se recalcula con menor frecuencia a distancia. El cuerpo, identidad, salud y controlador persisten.

El HUD reutiliza las barras de salud que ya admitían varios jefes. Cada jefe visible recibe además una barra sobre el sprite. Al salir del encuadre se muestra una flecha con nombre y distancia aproximada en casillas. Las presentaciones usan líneas existentes de jefe y protagonista, con texto breve para reapariciones y prioridad narrativa para Wesker. Las alertas y los mensajes utilizan tiempo de simulación.

## Recompensas

La muerte confirmada retira al jefe del registro de integrantes activos antes de acreditar su recompensa. Una segunda notificación carece de un integrante que acreditar. Entre las opciones útiles se sortean una curación de hasta el 35 % de la salud máxima, hasta el 35 % de carga de definitiva o un botiquín. Cuando todas están cubiertas, se renueva una defensa del 15 % durante treinta segundos efectivos. La intensidad permanece fija. Las ventajas por experiencia continúan utilizando su selección normal con pausa. Esta entrega no añade una elección de evolución gratuita a la tabla de recompensas.

## Archivos de la etapa

| Área | Archivos |
|---|---|
| Calendario, navegación y presentación nuevos | src/systems/EncounterCalendar.ts, src/systems/BossPursuit.ts, src/systems/ContinuousEncounters.ts |
| Integración con la partida, ruleta y población | src/scenes/Game.ts, src/systems/RoundDirector.ts, src/systems/ContinuousDirector.ts |
| Identificación del daño y adaptación de Wesker | src/bosses/Torturado.ts, src/bosses/NewBosses.ts, src/uroboros/Encounter.ts |
| Pruebas nuevas | tests/continuousEncounters.test.ts, tools/check_continuous_encounters.cjs |

## Verificación y límites

TypeScript y compilación Vite correctos. Suite completa de 318 pruebas aprobadas. El calendario se simuló hasta el minuto 125. Las pruebas cubren variedad, desfase del segundo jefe, reserva de Wesker, cola retrasada, avisos, reintento de aparición, frecuencia de hordas y rutas con desvío o acceso demasiado estrecho. Vite mantiene una advertencia de tamaño del paquete JavaScript.

La prueba acelerada comprueba la lógica del calendario a largo plazo. No mide dos horas de rendimiento gráfico. La búsqueda de persecución está limitada a 2400 celdas por planificación y recalcula rutas parciales durante desplazamientos largos. La etapa 3 queda pendiente de autorización e incluye persistencia sectorial, clima, vehículos y peligros ambientales.
En Edge, con perfiles temporales, se verificaron el equipamiento inicial de Cervela, Nicolás y Jordan en ambos modos, el uso del arma, seis combates acelerados con transformación de Wesker, un doble con dos indicadores, la conservación de salud y la defensa de reserva sin segunda entrega. La prueba de regresión de la etapa 1 verificó selección, pausa, ventajas, muerte, reinicio, menú y regreso a Tradicional. No se realizó una prueba en teléfono físico ni una partida manual de dos horas.
