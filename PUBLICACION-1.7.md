# Publicación verificada — Hotline Curicó 1.7

Fecha: 2026-11-01.

- Commit de versión: d520593838a648d9bd0e50328a96527afd8636c8.
- Push normal a origin/main correcto, desde 9b324b5, sin forzar historial.
- GitHub Actions: [ejecución 41316112175](https://github.com/JorDanTe507/hotline-curico/actions/runs/41316112175), completed / success.
- npm ci, npm test, npm run build, artefacto y deploy a GitHub Pages terminaron correctamente.
- [Juego público](https://jordante507.github.io/hotline-curico/): HTTP 200, sirve assets/index-ZZB0WnX4.js, el mismo build 1.7 validado localmente.
- Recurso assets/v17/copec-canopy.png: HTTP 200, 209255 bytes.
- Navegador conectado a la URL pública: emulación Pixel 7 horizontal, formulario táctil PROJECT507, ronda 3, herramientas, COPEC, lluvia, apagón y recarga. Los 61 recursos nuevos cargaron; sin errores HTTP/JavaScript y sin global de depuración.
- La primera prueba remota enviaba la contraseña por teclado antes de esperar el formulario y falló en navegación. Se repitió usando los campos/botones visibles y pasó; check-city17-production.cjs adopta esa navegación estable.

La confirmación es de navegador y emulación; no se realizó una prueba en teléfono Android físico ni con DualShock físico. En Android: abrir el enlace en Chrome, activar rotación automática y girar a horizontal. El progreso del dominio es independiente de localhost.

Las comprobaciones locales y archivos modificados se detallan en [VALIDACION-1.7.md](VALIDACION-1.7.md). La revisión posterior de este documento y del smoke test no cambia el código del juego desplegado.
