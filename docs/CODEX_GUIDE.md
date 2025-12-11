# Codex Guide – Conecta Care (Plataforma Operacional de Home Care)

Fonte de verdade para IA e automações. O Conecta Care é uma plataforma operacional completa; o módulo de Escalas é o núcleo da operação, e Pacientes é a âncora de dados que alimenta Escalas, Financeiro, Inventário, Clínico, GED e Auditoria.

## Visão 360 do produto e regras operacionais
- **Escalas (core)**: plantões de 12h (2 por dia/paciente), visões por paciente e por profissional, check-in/out com geolocalização, biometria via API externa (ex.: SERPRO) e monitoramento de permanência por BLE. Trocas/alterações requerem aprovação de escalista/supervisor. Toda escala impacta faturamento e pagamento (cálculo granular, atrasos com possível corte mediante aprovação).  
- **Pacientes (base)**: cadastro único consumível por Escalas; sem duplicação de dados.  
- **GED + Auditoria**: documentos e timeline granular para prova e conformidade; eventos de escalas (checkin/checkout, trocas, ocorrências, aprovações) devem ser auditáveis.  
- **Financeiro/Inventário/Clínico**: conectados à operação (plantões geram faturamento; inventário ligado a atendimento; clínico como resumo/espelho).  
- **Segurança/Multi-tenant**: escopo por empresa de home care; perfis incluem empresa, paciente/família, profissional, médicos/fisio/nutri, supervisores/gerentes/responsáveis. Autorização deve ser explícita e auditável.

## Padrão visual obrigatório – Fluent clássico (Opção A)
- **Command bar**: fundo branco, título "Conecta Care · Pacientes", breadcrumb (ex.: "Pacientes > Lista > [Nome]") e ações à direita (Imprimir, Compartilhar, Salvar alterações ou ação primária da tela).  
- **Header do paciente**: nome em destaque + badge de status e badge de alergia; metadados em linha (PAC-ID, idade, responsável, convênio); coluna lateral com complexidade, cidade/UF e última atualização.  
- **Abas**: horizontais em linha, sem pílulas: Dados pessoais, Endereço & logística, Rede de apoio, Administrativo, Financeiro, Clínico, Documentos (GED), Histórico & Auditoria.  
- **Conteúdo**: cards em fundo branco com borda leve, sombra sutil, grid responsivo (3 colunas em desktop, quebra em telas menores).  
- **Stack visual**: Fluent clássico + CSS/Tailwind simples. **Não usar Fluent 2 puro nem MUI.**  
- **Referências visuais**: `src/app/pacientes/[id]/page.tsx` (detalhe) e `src/app/pacientes/page.tsx` (lista) são o padrão a ser seguido para o módulo de Pacientes.

## Arquitetura atual do repo (real)
- **Front-end**: Next.js (App Router) em `src/app`; Fluent UI 9; Tailwind 4 importado em `globals.css`.  
- **Layout**: `FluentProviderWrapper` com tema claro/escuro, `Header` com launcher/search/actions, `CommandBar` (versão Fluent A), `Breadcrumb`.  
- **Páginas**: `/` (home com cards de módulos), `/pacientes` (lista em cards), `/pacientes/[id]` (detalhe com abas). Não há rotas de Escalas ou APIs.  
- **Dados**: tipagem de paciente em `src/types/patient.ts`; sem schemas ou chamadas reais. Supabase client configurado em `src/lib/supabase/client.ts` (URL/anon key via env), ainda não usado.  
- **Estilo global**: `globals.css` com reset básico, lock de overflow e tema via CSS vars.

## Como evoluir sem quebrar o padrão
- Reusar a casca do Fluent A: command bar + header + abas + grid de cards em todas as novas telas do módulo de Pacientes e, por analogia, nas futuras telas de Escalas e módulos operacionais.  
- Para Escalas: criar páginas/rotas (ex.: `/escalas/pacientes`, `/escalas/profissionais`) seguindo o mesmo shell; introduzir apenas dados que já existam ou mock minimal sem inventar colunas ausentes. Aprovações de alterações devem ser previstas no fluxo (UI e audit trail).  
- Para GED/Auditoria: expor atalhos/botões e timelines, mas não presumir schema; use placeholders claros até ter endpoints.  
- Para Financeiro/Inventário/Clínico: manter visão-resumo (cards/abas) conectada ao paciente; evitar duplicação de cadastro.  
- Multi-tenant/perfis: quando implementar, explicitar no layout quem é o tenant/escopo ativo e registrar ações na auditoria.

## Padrões de contribuição (patch/test)
- ASCII por padrão; comentários só quando o código não for óbvio.  
- Não reverter mudanças existentes do usuário.  
- Testes: rodar `npm run lint` quando fizer alterações de código/estilo; validar manualmente as páginas tocadas.  
- UX: preservar Fluent A; componentes novos devem seguir bordas retas, sombra leve, tipografia Segoe/UI system.  
- Segurança/dados: não inventar colunas/tabelas; alinhar DTO/validação com o que existe. Sem dados sensíveis em commit.

## Validação rápida (manual)
- `npm run lint` para sanity check.  
- Abrir `/pacientes` e `/pacientes/[id]` para confirmar casca Fluent A (command bar + header + abas + cards responsivos).  
- Conferir que breadcrumbs/títulos seguem o padrão “Conecta Care · Pacientes” e que ações principais aparecem à direita na command bar.
