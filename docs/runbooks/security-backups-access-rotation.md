# Runbook — Backups, Acessos e Rotação Programada

Status: ATUAL — operacional.

## Objetivo / quando usar

Definir política de backups, controle de acesso e rotação programada de segredos.

## Pré-requisitos

- Acesso administrativo ao Supabase.
- Acesso às variáveis de ambiente (Vercel/CI).
- Plano de rotação: [`SECRETS_ROTATION.md`](../reviews/SECRETS_ROTATION.md).

## Passo a passo

### Backups

1) Definir política de retenção (ex.: diária 7 dias + semanal 4 semanas + mensal 6 meses).
2) Configurar backups automáticos no Supabase (quando disponível) ou via job externo.
3) Executar teste de restauração mensal em ambiente isolado.

### Acesso

1) Aplicar princípio do menor privilégio.
2) Habilitar MFA para contas administrativas.
3) Revisar acessos privilegiados trimestralmente.

### Rotação programada

1) Definir calendário de rotação para ANON/SERVICE ROLE e integrações externas.
2) Registrar cada rotação em `SECRETS_ROTATION.md`.
3) Validar ambientes após a rotação.

## Como validar sucesso

- Backup recente disponível e restauração testada.
- Acessos revisados e sem contas órfãs.
- Rotação executada conforme calendário.

## Rollback / mitigação

- Em falha de restore, revalidar o dump mais recente e abrir incidente.

## Logs e rastreabilidade

- Logs do provedor de backups.
- Registro de rotação em `docs/reviews/SECRETS_ROTATION.md`.

## Troubleshooting

- **Backup incompleto**: revisar permissões e espaço disponível.
- **Restore falhou**: usar snapshot anterior e registrar incidente.

## Segurança e compliance (o que NÃO fazer)

- Não armazenar dumps fora de storage seguro.
- Não compartilhar credenciais administrativas em canais abertos.
