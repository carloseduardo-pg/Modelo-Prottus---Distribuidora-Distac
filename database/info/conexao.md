# Conexão — PostgreSQL Distac

| Item | Valor |
|------|-------|
| Engine | PostgreSQL (instalação local) |
| Host | `127.0.0.1` |
| Porta | `5432` |
| Database | `distac` |
| Usuário | `postgree` |
| Senha | `postgree` |
| Schema | `public` |

`DATABASE_URL` (backend):

```text
postgresql://postgree:postgree@127.0.0.1:5432/distac?schema=public
```

Arquivo: [`.env`](../../.env) e [`backend/.env`](../../backend/.env).
