# OPEN_TODO

Pendências reais (priorizadas) – máximo 15 itens.

## Segurança/Permissões
- Definir modelo de tenants/perfis (empresa, paciente/família, profissional, supervisores/gerentes) e aplicar scoping/autorização explícita nas páginas/serviços.
- Planejar trilha de auditoria para qualquer ação sensível (cadastro de paciente, alterações de escala, checkin/checkout) com quem/quando/origem, integrada ao frontend.

## Backend/API
- Conectar páginas de pacientes ao Supabase (listar e detalhar) com DTOs alinhados ao schema real antes de expor na UI.
- Especificar/implantar serviço para auditoria/histórico por paciente (endpoint unificado que permita anexar eventos de escalas, GED e administrativos).
- Introduzir rotas/serviços para Escalas (por paciente e por profissional) respeitando plantões de 12h e fluxo de aprovação, mesmo que inicial com dados mock.

## UI
- Criar telas de Escalas (paciente e profissional) usando a casca Fluent A (command bar + header contextual + abas + cards), prevendo ações de aprovação/ocorrências.
- Conectar abas Financeiro/Clínico/Documentos/Historico do detalhe do paciente a dados reais ou placeholders dinâmicos alinhados a serviços futuros.
- Ajustar home (`src/app/page.tsx`) para refletir o estado real dos módulos (desabilitar/rotular como “em breve” o que não existir ou linkar para as novas rotas de Escalas).

## Dados/Schema
- Formalizar schema de paciente no Supabase (campos hoje usados em mock) antes de integrar; documentar constraints (PAC-ID, status, alergias, responsável legal).
- Definir modelo mínimo para GED (metadados de documentos + vínculos com paciente e entidades operacionais) mantendo compatibilidade com auditoria.

## Qualidade/Testes
- Habilitar pipeline de lint no CI e criar smoke tests manuais/documentados para `/pacientes` e `/pacientes/[id]`; planejar testes e2e quando Escalas estiver disponível.
