# TLACHINOLLI · Wiki y Tlatelolco

Sitio estático (HTML/CSS/JS, sin dependencias) con la wiki del juego y la calculadora de trueques de Tlatelolco.

## Actualizar los datos
Todo sale de la configuración real del juego. Después de cambiar `src/shared/Config.luau` (o los cosméticos), desde la raíz del proyecto:

```
node scripts/web/build-data.mjs          # regenera web/data.js
powershell -File scripts/web/prepare-images.ps1   # solo si cambiaron imágenes
```

## Valores de Tlatelolco
`valores.json` define cómo se calcula el valor (en jade equivalente). Para corregir un objeto a mano, agrégalo en `ajustes`:

```json
"ajustes": { "OFE_DIV_01": { "valor": 5000 }, "COM_029": { "demanda": 1.5 } }
```

Las cajas Ceremonial y Cómica usan un valor por rareza (PROPUESTA) hasta que se anuncien sus probabilidades.

## Publicar en GitHub Pages
1. Crea un repositorio público en GitHub (por ejemplo `tlachinolli`).
2. Sube el contenido de esta carpeta a la rama `main`.
3. En el repositorio: **Settings → Pages → Branch: main / (root) → Save**.
4. El sitio queda en `https://TU_USUARIO.github.io/tlachinolli/`.
