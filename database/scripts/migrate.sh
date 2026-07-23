#!/usr/bin/env bash
# Aplica migrations + seed de exemplos Distac
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

echo "==> Distac migrate (Prisma)"
cd "$BACKEND"
npx prisma migrate dev "$@"
echo "OK  migrations aplicadas"

echo "==> Distac seed (clientes, produtos, pedidos)"
npx prisma db seed
echo "OK  exemplos carregados"
