#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/.tablet-runtime"
ZIP="$WORK/Subject Calculator.zip"
EXTRACT="$WORK/extracted"

mkdir -p "$WORK"

if [ ! -f "$ZIP" ]; then
  echo "Merging Subject Calculator ZIP parts..."
  cat "$ROOT"/Subject\ Calculator.zip.part0* > "$ZIP"
fi

if [ ! -d "$EXTRACT" ]; then
  echo "Extracting project..."
  mkdir -p "$EXTRACT"
  unzip -q -o "$ZIP" -d "$EXTRACT"
fi

APP_PACKAGE="$(find "$EXTRACT" -maxdepth 5 -type f -name package.json -not -path '*/node_modules/*' -print -quit)"

if [ -z "$APP_PACKAGE" ]; then
  echo "No package.json found after extraction."
  find "$EXTRACT" -maxdepth 2 -mindepth 1 -print | head -100
  exit 1
fi

APP_DIR="$(dirname "$APP_PACKAGE")"
echo "App directory: $APP_DIR"
cd "$APP_DIR"

if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

node -e 'const p=require("./package.json"); console.log("Detected scripts:", p.scripts || {}); console.log("Detected framework deps:", Object.keys({...p.dependencies,...p.devDependencies}).filter(x=>["next","vite","react-scripts"].includes(x)));'

if node -e 'const p=require("./package.json"); process.exit((p.dependencies?.next||p.devDependencies?.next)?0:1)'; then
  echo "Starting Next.js on port 3000..."
  exec npm run dev -- -H 0.0.0.0 -p 3000
elif node -e 'const p=require("./package.json"); process.exit((p.dependencies?.vite||p.devDependencies?.vite)?0:1)'; then
  echo "Starting Vite on port 3000..."
  exec npm run dev -- --host 0.0.0.0 --port 3000
elif node -e 'const p=require("./package.json"); process.exit((p.dependencies?.["react-scripts"]||p.devDependencies?.["react-scripts"])?0:1)'; then
  echo "Starting React Scripts on port 3000..."
  HOST=0.0.0.0 PORT=3000 exec npm start
elif node -e 'const p=require("./package.json"); process.exit(p.scripts?.dev?0:1)'; then
  echo "Starting dev script on port 3000..."
  HOST=0.0.0.0 PORT=3000 exec npm run dev
elif node -e 'const p=require("./package.json"); process.exit(p.scripts?.start?0:1)'; then
  echo "Starting app on port 3000..."
  HOST=0.0.0.0 PORT=3000 exec npm start
else
  echo "No dev/start script found in package.json"
  cat package.json
  exit 1
fi
