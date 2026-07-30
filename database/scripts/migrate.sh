#!/usr/bin/env bash
# Aplica migrations pendentes + seed de exemplos Distac
# Usa `migrate deploy` (não interativo) — evita migrations acidentais tipo "cadu".
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$ROOT/backend"

if [ ! -f "$BACKEND/.env" ]; then
  if [ -f "$ROOT/.env" ]; then
    cp "$ROOT/.env" "$BACKEND/.env"
    echo "OK  backend/.env criado a partir da raiz"
  else
    echo "ERRO: falta .env na raiz ou em backend/"
    exit 1
  fi
fi

echo "==> Distac migrate deploy (Prisma)"
cd "$BACKEND"
npx prisma migrate deploy
npx prisma generate
echo "OK  migrations aplicadas"

echo "==> Distac seed (users, clients, products, orders)"
npx prisma db seed
echo "OK  exemplos carregados"
