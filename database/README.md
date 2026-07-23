# Database — Distac

Pasta **operacional** do PostgreSQL deste projeto (local, **sem Docker**).  
Faz parte da base Prottus: setup, migrations, triggers, auditoria e seeds.

| Conteúdo | Caminho |
|----------|---------|
| Este guia | README |
| Conexão, tabelas, seed, triggers | [`info/`](info/) |
| Scripts | [`scripts/`](scripts/) |
| SQL (role, DB, triggers) | [`sql/`](sql/) |
| Segurança / anonimização | [`../docs/projeto/seguranca.md`](../docs/projeto/seguranca.md) |
| Escalabilidade do banco | [`../docs/projeto/escalabilidade.md`](../docs/projeto/escalabilidade.md) |

Migrations Prisma: [`../backend/prisma/`](../backend/prisma/)  
Domínio: [`../docs/projeto/mapa-entidades.md`](../docs/projeto/mapa-entidades.md)

---

## Conexão (desenvolvimento)

| Item | Valor |
|------|-------|
| Host | `127.0.0.1` |
| Porta | `5432` |
| Database | `distac` |
| Usuário / senha | `postgree` / `postgree` |
| URL | `postgresql://postgree:postgree@127.0.0.1:5432/distac?schema=public` |

Env: [`.env`](../.env) e [`backend/.env`](../backend/.env) (gitignored).

---

## Primeira vez

```bash
bash database/scripts/setup.sh
bash database/scripts/migrate.sh
bash database/scripts/check.sh
```

Seed: [`info/exemplos-seed.md`](info/exemplos-seed.md) · Triggers: [`info/triggers.md`](info/triggers.md).

---

## Scripts

| Script | Função |
|--------|--------|
| `scripts/check.sh` | Saúde + contagens |
| `scripts/setup.sh` | Role + database |
| `scripts/migrate.sh` | Migrations Prisma + seed |
| `scripts/apply-triggers.sh` | Reaplica triggers/`audit_log` |
| `scripts/seed.sh` | Só exemplos |
| `scripts/studio.sh` | Prisma Studio |

---

## Produção / outro cliente

- Trocar `DATABASE_URL` (e secrets JWT) — não versionar credenciais reais.
- Manter triggers com **omissão de campos sensíveis** na auditoria.
- Escala (índices, retenção de `audit_log`, pool): ver doc de escalabilidade.
