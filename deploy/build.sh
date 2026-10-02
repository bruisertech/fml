#!/usr/bin/env bash
# Abogao – genera dist/ con JavaScript y CSS minificados (≈ 25-35 % menos peso antes de gzip).
# Requiere Node.js. El código fuente legible sigue en js/ y css/; dist/ es lo que se publica.
# Uso (desde la raíz del repositorio):
#   bash deploy/build.sh            → para GitHub Pages (conserva la política de seguridad en <meta>)
#   bash deploy/build.sh --nginx    → para EC2: Nginx envía la política como cabecera, así que se quita la <meta>
#                                     (medido: ≈ 70 ms menos en el primer pintado con 3G)
set -euo pipefail
rm -rf dist && mkdir -p dist/js dist/css
if [ "${1:-}" = "--nginx" ]; then
  python3 - <<'PY'
import re
s = open('index.html', encoding='utf-8').read()
s = re.sub(r'  <!-- Política de seguridad.*?\n  <meta http-equiv="Content-Security-Policy"[^>]*>\n', '', s, flags=re.S)
open('dist/index.html', 'w', encoding='utf-8').write(s)
PY
else
  cp index.html dist/
fi
cp -r vendor icons manifest.json sw.js dist/
npx --yes esbuild@0.24.0 js/*.js --minify --target=es2019 --outdir=dist/js --log-level=warning
# La versión del service worker se toma de js/config.js: así ningún celular se queda con una versión vieja en caché
VER=$(sed -n "s/.*version: '\([0-9.]*\)'.*/\1/p" js/config.js | head -1)
sed -i "s/const VERSION = 'abogao-[0-9.]*'/const VERSION = 'abogao-$VER'/" dist/sw.js
python3 deploy/gen_catalog.py --revisar
npx --yes esbuild@0.24.0 css/styles.css --minify --outfile=dist/css/styles.css --log-level=warning
echo "dist/ listo:"; du -sh dist/js dist/css
