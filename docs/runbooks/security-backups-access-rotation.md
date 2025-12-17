## Backups, Acessos e Rotação Programada (rascunho)

Status: PARCIAL — esqueleto inicial.

Referências:
- Rotação de segredos: [../reviews/SECRETS_ROTATION.md](../reviews/SECRETS_ROTATION.md)
- Tenancy/RLS: [./auth-tenancy.md](./auth-tenancy.md)

### Backups
- [ ] Definir política de retenção e frequência (ex.: diária + semanal)
- [ ] Teste periódico de restauração (provas de restauração)

### Acesso
- [ ] Princípio do menor privilégio
- [ ] MFA obrigatório em contas administrativas
- [ ] Auditoria de acessos privilegiados

### Rotação Programada
- [ ] Agenda de rotação de chaves (ANON/SERVICE ROLE, OAuth, Webhooks)
- [ ] Processo automatizado quando possível (scripts/runbooks)
