#!/bin/sh
# Copie le site construit dans des dossiers `public/` afin que Vercel trouve
# toujours son "Output Directory", peu importe :
#   - le reglage Root Directory du projet Vercel
#   - un eventuel Override "Output Directory" dans le tableau de bord
#   - le repertoire de travail (cwd) dans lequel Vercel execute le buildCommand
#
# Le script se localise LUI-MEME ($0) pour deduire la racine du depot : aucun
# chemin relatif au cwd n'est utilise pour trouver le site construit.
#
# Ne fait RIEN hors des machines de build Vercel (clonage dans /vercel/path*),
# pour ne jamais polluer le dossier source `public/` de Vite en local.
# (FORCE_VERCEL_OUTPUT=1 permet de tester le script localement dans un bac a sable.)
set -e

if [ ! -d /vercel ] && [ "$FORCE_VERCEL_OUTPUT" != "1" ]; then
  exit 0
fi

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
REPOROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd -P)
SRC="$REPOROOT/artifacts/chez-florent/dist/public"

if [ ! -d "$SRC" ]; then
  echo "vercel-output.sh: $SRC introuvable (cwd=$(pwd)) — le build vite a-t-il reussi ?" >&2
  exit 1
fi

# Copie vers tous les emplacements que Vercel pourrait verifier :
# racine du depot, dossier de l'app, et cwd courant.
for DEST in "$REPOROOT/public" "$REPOROOT/artifacts/chez-florent/public" "$(pwd)/public"; do
  mkdir -p "$DEST"
  cp -r "$SRC"/. "$DEST"/
done

echo "vercel-output.sh: site copie depuis $SRC vers public/ (racine du depot, app, et cwd=$(pwd))"
