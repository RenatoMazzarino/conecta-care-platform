 # Storage de Fotos — Pacientes ABA01 (rascunho)
 
 Aviso: este runbook é um esqueleto inicial. Não substitui contratos nem a arquitetura canônica; serve para orientar políticas e fluxo operacional de upload/consulta de fotos.
 
 - Contrato relacionado: [../contracts/pacientes/ABA01_DADOS_PESSOAIS.md](../contracts/pacientes/ABA01_DADOS_PESSOAIS.md)
 - Arquitetura canônica: [../architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)
 - Backlog: [../architecture/OPEN_TODO.md](../architecture/OPEN_TODO.md) — itens P1 "Runbooks (lacunas)"
 
 ## Objetivo
 Definir diretrizes de armazenamento de fotos (ex.: avatar/documentação leve) para a Aba 01 de Pacientes com políticas alinhadas a multi-tenant e auditoria.
 
 ## Escopo mínimo
 - Bucket dedicado (ex.: `patient-photos`).
 - Naming: `tenant/{tenant_id}/patients/{patient_id}/{uuid}.jpg`.
 - Metadados obrigatórios: `tenant_id`, `patient_id`, `uploader_id`, `content_type`, `created_at`.
 
 ## Políticas/RLS (guidelines)
 - Leitura: restrita ao `tenant_id` do usuário; profissionais só leem pacientes habilitados ao seu escopo.
 - Escrita: apenas perfis autorizados para o paciente/tenant.
 - Público: evitar URLs públicas; preferir URLs assinadas de curta duração.
 
 ## Fluxo de upload (alto nível)
 1. Autenticar e obter `tenant_id` do token (app_metadata).
 2. Solicitar URL assinada para upload (tempo curto; content-type validado).
 3. Realizar upload direto; registrar evento de auditoria (`document.upload` ou similar) com `patient_id`/`tenant_id`.
 
 ## Pendências/tarefas
 - [ ] Especificar bucket, políticas e RLS no Supabase (SQL/policies) com exemplos.
 - [ ] Definir tamanhos máximos, formatos aceitos e sanitização EXIF.
 - [ ] Definir expiracão das URLs assinadas (download/upload).
 - [ ] Atualizar `OPEN_TODO.md` com evidências quando implementado.
 
 ---
 
 ## Evidências
 - A serem adicionadas (PR/migrations/policies): vincular quando implementado.