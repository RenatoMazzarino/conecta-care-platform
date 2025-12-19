# Runbook — Storage de Fotos (Pacientes ABA01)

Status: ATUAL — operacional.

## Objetivo / quando usar

Definir políticas e fluxo de upload/consulta de fotos de pacientes na Aba 01, com segurança multi-tenant.

## Pré-requisitos

- Supabase Storage habilitado.
- Acesso admin ao projeto Supabase.
- Contrato da Aba 01 atualizado.

## Passo a passo (configuração)

1) **Criar bucket privado**
   - Nome sugerido: `patient-photos`.
   - Desabilitar acesso público.
2) **Definir convenção de path**
   - `tenant/{tenant_id}/patients/{patient_id}/{uuid}.jpg`
3) **Criar policies (Storage)**
   - **SELECT**: permitido apenas para usuários do mesmo `tenant_id`.
   - **INSERT**: permitido apenas para usuários autenticados do tenant.
   - **DELETE**: apenas admins/roles autorizados.
4) **Integrar no app**
   - Upload via URL assinada (curta duração).
   - Salvar apenas o path interno em `public.patients.photo_path`.
   - Registrar evento em `audit_events` (ex.: `document.upload`).

## Fluxo de upload (alto nível)

1) Autenticar usuário e obter `tenant_id` do JWT.
2) Solicitar URL assinada para upload.
3) Enviar arquivo com `content-type` validado.
4) Persistir path e metadados no banco.

## Como validar sucesso

- Upload de foto com usuário autenticado.
- Leitura por usuário do mesmo tenant funciona.
- Leitura por tenant diferente falha (RLS/policy).

## Rollback / mitigação

- Revogar policies problemáticas e bloquear novos uploads.
- Remover URLs assinadas se houver vazamento.

## Logs e rastreabilidade

- `storage.objects` (Supabase).
- `public.patients.photo_path`.
- Eventos em `audit_events`.

## Troubleshooting

- **403 no upload**: policy ou `tenant_id` inválido.
- **Arquivo não abre**: MIME type ou URL assinada expirada.
- **Foto errada**: verificar path no banco.

## Segurança e compliance (o que NÃO fazer)

- Não usar URLs públicas para fotos sensíveis.
- Não armazenar tokens/URLs assinadas no banco.
- Não permitir acesso cross-tenant.

## Evidências

- Adicionar links de PR/migrations quando implementado.
