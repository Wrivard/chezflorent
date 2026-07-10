#!/bin/sh
# Copie le site construit dans des dossiers `public/` afin que Vercel trouve
# toujours son "Output Directory", peu importe :
#   - le reglage Root Directory du projet Vercel (racine ou artifacts/chez-florent)
#   - un eventuel Override "Output Directory" dans le tableau de bord
#   - le repertoire de travail dans lequel Vercel execute le buildCommand
#
# Ne fait RIEN hors des machines de build Vercel (clonage dans /vercel/path*),
# pour ne jamais polluer le dossier source `public/` de Vite en local.
# (FORCE_VERCEL_OUTPUT=1 permet de tester le script localement dans un bac a sable.)
set -e

if [ ! -d /vercel ] && [ "$FORCE_VERCEL_OUTPUT" != "1" ]; then
  exit 0
fi

if [ -d dist/public ]; then
  # cwd = artifacts/chez-florent
  SRC=dist/public
  APPDIR=.
  REPOROOT=../..
elif [ -d artifacts/chez-florent/dist/public ]; then
  # cwd = racine du depot
  SRC=artifacts/chez-florent/dist/public
  APPDIR=artifacts/chez-florent
  REPOROOT=.
else
  echo "vercel-output.sh: dist/public introuvable (le build a-t-il reussi ?)" >&2
  exit 1
fi

mkdir -p "$APPDIR/public" "$REPOROOT/public"
cp -r "$SRC"/. "$APPDIR/public/"
cp -r "$SRC"/. "$REPOROOT/public/"
echo "vercel-output.sh: site copie dans $APPDIR/public et $REPOROOT/public"
