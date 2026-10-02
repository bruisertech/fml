#!/usr/bin/env bash
# Abogao – sincroniza el repositorio con el directorio público de Nginx en EC2.
# Uso en la instancia:  bash deploy/sync.sh [rama]
set -euo pipefail

BRANCH="${1:-main}"
REPO_DIR="${REPO_DIR:-$HOME/fml}"
WEB_DIR="${WEB_DIR:-/var/www/abogao}"

cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

# Conserva el config.js del servidor si ya existe (tiene la configuración de producción)
if [ -f "$WEB_DIR/js/config.js" ]; then
  cp "$WEB_DIR/js/config.js" /tmp/abogao-config.js
fi

sudo mkdir -p "$WEB_DIR"
# Si hay Node.js, se publica la versión minificada (dist/); si no, el código fuente
if command -v npx >/dev/null 2>&1 && bash deploy/build.sh --nginx; then SRC="dist/"; else SRC="./"; fi
sudo rsync -a --delete --exclude '.git' --exclude 'deploy' --exclude 'dist' --exclude 'README.md' "$SRC" "$WEB_DIR/"

if [ -f /tmp/abogao-config.js ]; then
  sudo cp /tmp/abogao-config.js "$WEB_DIR/js/config.js"
fi

sudo nginx -t && sudo systemctl reload nginx
echo "Abogao actualizado desde la rama $BRANCH en $WEB_DIR"
