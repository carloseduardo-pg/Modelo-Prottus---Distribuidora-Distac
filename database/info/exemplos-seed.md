# Exemplos de seed — Distac

Dados carregados por `bash database/scripts/migrate.sh` (ou `seed.sh`).

Marcador nos pedidos: observação começa com `[SEED]`.

## Clientes (lojas PE)

| Nome | Cidade | CNPJ |
|------|--------|------|
| Casa Forte Materiais | Recife | 11222333000181 |
| Depósito Olinda Construções | Olinda | 22333444000192 |
| Jaboatão Tudo em Obra | Jaboatão dos Guararapes | 33444555000103 |
| Caruaru Centro de Materiais | Caruaru | 44555666000114 |

## Produtos

| Código | Nome | Unidade |
|--------|------|---------|
| CIM-50 | Cimento CP-II 50kg | SC |
| ARE-M3 | Areia média lavada | M3 |
| BRI-6F | Tijolo cerâmico 6 furos | UN |
| VER-10 | Vergalhão CA-50 10mm | BR |
| BLO-14 | Bloco de concreto 14x19x39 | UN |
| TIN-18 | Tinta acrílica branca 18L | GL |

## Pedidos (relacionados)

| Status | Cliente | Itens (exemplo) |
|--------|---------|-----------------|
| confirmado | Casa Forte | cimento + areia + tijolo |
| rascunho | Olinda | vergalhão + bloco + cimento |
| confirmado | Jaboatão | tinta + tijolo |
| cancelado | Caruaru | areia + cimento |

## Login

`vendedor@distac.local` / `distac123`

Código do seed: [`../../backend/prisma/seed.ts`](../../backend/prisma/seed.ts)
