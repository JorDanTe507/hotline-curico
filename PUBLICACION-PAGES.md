# Publicación de Hotline Curicó 1.5.1

## Preparación local

Repositorio: https://github.com/JorDanTe507/hotline-curico.git

Rama preparada: `main`. La carpeta no tenía Git; se inicializó únicamente dentro de `hotline-curico`, sin modificar el proyecto padre. Las consultas `git ls-remote` y `git fetch` no devolvieron referencias remotas. Antes del primer push se debe volver a consultar el remoto: si aparece historial, hay que incorporarlo sin forzar ni sobrescribirlo.

Vite usa `base: '/hotline-curico/'`. Las rutas relativas existentes de Phaser, música y video se conservan y funcionan bajo ese prefijo. No se cambiaron mecánicas ni datos de guardado.

El workflow `.github/workflows/deploy.yml` usa acciones oficiales fijadas por SHA, Node 22, `npm ci`, `npm test`, `npm run build`, artefacto `dist` y despliegue de Pages. Ejecuta automáticamente al actualizar `main` y admite `workflow_dispatch`. El trabajo de compilación solo lee el código; el de despliegue tiene permisos `pages: write` e `id-token: write`. No incluye credenciales personales.

Se añadió `package-lock.json`, conservando las versiones principales instaladas: Phaser 3.90.0, Vite 6.4.5, TypeScript 5.9.3, tsx 4.23.15 y @types/node 24.19.2. Se conserva también el lockfile pnpm previo.

## Pruebas de esta preparación

- `npm run build`: aprobado, 95 módulos. Aviso de tamaño del paquete Phaser; no bloquea la compilación.
- `npm test`: 116/116 aprobadas, ninguna omitida.
- Instalación limpia del lockfile en carpeta temporal: `npm ci --ignore-scripts`, aprobada. No se reemplazó la instalación pnpm del juego.
- Los 318 archivos públicos, 60.343.930 bytes, aparecen idénticos en `dist`.
- HTML compilado apunta a `/hotline-curico/assets/`.
- `check-mobile151-production.cjs`: aprobado usando `GAME_URL=http://127.0.0.1:5179/hotline-curico/`. Comprueba carga de producción, interfaz táctil, retratos oficiales, introducción, ruleta real, retrato del HUD, pausa y reanudación, sin errores HTTP o JavaScript y sin global de depuración.
- La prueba móvil utiliza emulación Android y eventos táctiles del navegador. **No se probó en un Android físico.** Las pruebas completas de 1.5.1 están documentadas en `VALIDACION-1.5.1.md`; no se afirma haber repetido todas las suites históricas en esta preparación.
- Revisión de archivos candidatos: sin patrones de tokens GitHub o claves privadas detectados. `.gitignore` excluye dependencias, compilación, capturas generadas en la raíz, temporales, archivos de entorno y claves.

## Antes del primer push

El inventario local `PUBLICACION-ARCHIVOS.txt` enumera las rutas exactas preparadas para subir; ese inventario no se publica. El usuario autorizó el primer push. Se subieron los archivos y se conservó el commit inicial remoto mediante una integración sin forzar el historial.

Si Git pide autenticación, usar el inicio de sesión del navegador de Git Credential Manager, GitHub CLI o un método seguro equivalente. No copiar contraseñas ni tokens en los archivos del proyecto. No usar `push --force`.

## Activar y comprobar Pages

Después del push autorizado:

1. Abrir https://github.com/JorDanTe507/hotline-curico/settings/pages
2. En **Build and deployment → Source**, seleccionar **GitHub Actions**.
3. En **Actions → Publish Hotline Curicó to Pages**, comprobar la ejecución asociada al commit. Si es necesario, pulsar **Run workflow** y elegir `main`.
4. Confirmar que los trabajos `build` y `deploy` finalizan correctamente y comprobar la URL publicada, sus recursos y la entrada al juego antes de declarar terminado el despliegue.

Dirección publicada y comprobada (HTTP 200): https://jordante507.github.io/hotline-curico/

## Android y guardado

Una vez confirmado el despliegue, abrir el enlace HTTPS en Chrome de Android, activar la rotación automática y girar a horizontal. Aceptar el aviso inicial. El bloqueo de orientación es opcional y depende de los permisos del navegador; se mantiene la alternativa de girar manualmente.

Los controles táctiles, sticks, botones, menús y HUD adaptables forman parte del paquete. La comodidad, el rendimiento sostenido, el teclado virtual, las áreas seguras, el audio y los permisos deben probarse en un teléfono real.

Monedas, mejoras y logros siguen usando el almacenamiento local existente. **El progreso de localhost no se transfiere automáticamente a GitHub Pages**: cada origen y navegador conserva sus propios datos. No se borró el progreso existente ni se añadió sincronización.

## Publicación confirmada — 29 de octubre de 2026

- Commit del juego: f39a979; integración del README e historial remoto: 2d02f24.
- Push a origin/main completado y rama sincronizada.
- GitHub Pages activado con build_type workflow.
- Ejecución https://github.com/JorDanTe507/hotline-curico/actions/runs/40823932089: success, intento 2. El primer despliegue falló porque Pages no estaba habilitado; después de activarlo se reejecutó correctamente.
- npm ci, npm test y npm run build aprobados en el runner de GitHub.
- URL pública HTTP 200. check-mobile151-production.cjs aprobado contra el dominio publicado: selección oficial, introducción, ruleta, controles, HUD y pausa sin errores HTTP o JavaScript.
- No se ha probado en un teléfono físico. No se modificaron mecánicas ni se borró almacenamiento local.
