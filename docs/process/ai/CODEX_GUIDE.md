# Codex Guide – Conecta Care (Plataforma Operacional de Home Care)

Fonte de verdade para IA e automações. O Conecta Care é uma plataforma operacional completa; o módulo de Escalas é o núcleo da operação, e Pacientes é a âncora de dados que alimenta Escalas, Financeiro, Inventário, Clínico, GED e Auditoria.

Nota importante sobre sobreposição de conteúdo:

- Este guia é sobre processo/execução com IA. A arquitetura canônica do sistema (princípios, estado atual e visão) está em: `docs/architecture/SYSTEM_ARCHITECTURE.md`.
- Não duplique nem atualize detalhes arquiteturais aqui. Quando precisar, referencie as seções do documento canônico.

## O que é a Conecta Care (visão 360)

- **Escalas é o core operacional**: cobertura contínua, presença, rastreabilidade e faturamento partem do módulo de escalas.  
- **Pacientes é a base de dados**: cadastro único que alimenta Escalas e demais módulos, sem duplicação.  
- **GED + Auditoria**: sustentam conformidade, prova e rastreabilidade (documentos + eventos).  
- **Módulos de suporte (Financeiro, Inventário, Clínico)**: espelhos/resumos conectados à operação, não silos isolados.  
- **Segurança/Multi-tenant**: escopo por empresa de home care; perfis incluem empresa, paciente/família, profissional, médicos/fisio/nutri, supervisores/gerentes/responsáveis; autorização deve ser explícita e auditável.

## Regras do core Escalas (modelo real)

- **Plantões são de 12h por paciente (2/dia)**. Paciente não tem folga; modelo “12x36” é do profissional, não do paciente.  
- **Dois módulos**: Escala por Paciente e Escala por Profissional.  
- **Aprovação obrigatória**: qualquer troca/alteração relevante precisa de escalista/supervisor.  
- **Presença**: check-in/checkout com geolocalização + biometria via API (ex.: SERPRO) + monitoramento de permanência via BLE (celular pingando beacon no domicílio).  
- **Financeiro**: cada plantão gera faturamento; atraso pode gerar corte proporcional (ex.: 1h) com aprovação/manual review.

## Padrão visual obrigatório – Pacientes (Fluent clássico, estilo “Dynamics”)

- **Header global**: manter o `Header` (topbar azul com launcher + busca + ações).  
- **Command bar (página)**: barra branca com ações no topo, no estilo Dynamics (Imprimir/Compartilhar/Salvar + Editar/Cancelar/Recarregar), com affordances claras de estado view/edit.  
- **Record header (paciente)**: avatar + nome em destaque + subtítulo; metadados em linha à direita (status, proprietário, complexidade, convênio).  
- **Abas**: horizontais em linha, sem pílulas: Dados pessoais, Endereço & logística, Rede de apoio, Administrativo, Financeiro, Clínico, Documentos (GED), Histórico & Auditoria.  
- **Conteúdo das abas**: layout 2/3 + 1/3 (grid `2fr 1fr`) com cards grandes: coluna esquerda para “conteúdo principal” e coluna direita para sidebar (status/consentimentos/auditoria/timeline). Responsivo: vira 1 coluna em telas menores.  
- **Stack visual**: Fluent clássico + CSS/Tailwind simples. **Não usar MUI.**  
- **Referências visuais**: `html/modelo_final_aparencia_pagina_do_paciente.htm` (detalhe) e `src/app/pacientes/page.tsx` (lista) são o padrão a ser seguido para o módulo de Pacientes.

## Referência visual canônica

- Detalhe do paciente (estilo “Dynamics”): `html/modelo_final_aparencia_pagina_do_paciente.htm`  
- Referência anterior (comparativo): `html/comparativo-fluent.html`  
- Reforço: evitar UI divergente (ex.: MUI). Ajustes visuais devem respeitar a casca (command bar + record header + abas + cards) conforme os HTMLs de referência.

## Glossário operacional (Escalas)

- **Plantão**: bloco de 12h; dois plantões por dia por paciente para garantir cobertura 24/7.  
- **Escala por paciente**: visão/agenda dos plantões atribuídos a um paciente.  
- **Escala por profissional**: visão/agenda do profissional com plantões distribuídos em pacientes.  
- **Check-in/out**: registro de início/fim do plantão com geo + biometria (API externa, ex.: SERPRO) + validação de permanência via BLE.  
- **Troca de plantão**: substituição solicitada; só efetiva com aprovação de escalista/supervisor.  
- **Ocorrência**: evento relevante em um plantão (atraso, falta, incidente).  
- **Aprovação**: workflow obrigatório para trocas/alterações que impactem cobertura ou pagamento.  
- **Cobertura**: estado que garante que o paciente está assistido (sem gaps).

## Modelo mínimo do módulo Escalas (MVP)

- Plantões de 12h (2/dia/paciente) como regra base.  
- Módulos separados: visão por paciente e visão por profissional.  
- Fluxos de aprovação para trocas/alterações de escala.  
- Check-in/out com geolocalização, biometria via API externa (ex.: SERPRO) e monitoramento de permanência por BLE.  
- Cada plantão deve gerar eventos auditáveis e alimentar Financeiro (horas, atrasos com corte mediante aprovação).

## Entidades mínimas do MVP de Escalas

- **PatientShift/Shift (plantão)**: janela de 12h por paciente.  
- **ShiftAssignment**: vincula plantão a um profissional.  
- **Checkin/Checkout**: registros de presença com geo/biometria.  
- **PresencePing (BLE)**: pings periódicos para comprovar permanência.  
- **SwapRequest/SwapApproval**: solicitações e aprovações de troca.  
- **Occurrence/Note**: eventos e observações do plantão.  
- **Status**: Scheduled, Confirmed, InProgress, Completed, Missed, Cancelled (ou equivalente).

## Taxonomia de eventos auditáveis (padrão de nomes)

- Padrão: `<domínio>.<entidade>.<ação>` com contexto mínimo (actor, role, timestamp, origem, tenant, ids).  
- Escalas (core): `schedule.shift.create`, `schedule.shift.update`, `schedule.assignment.create`, `schedule.checkin`, `schedule.checkout`, `schedule.presence.ping`, `schedule.swap.requested`, `schedule.swap.approved`, `schedule.swap.rejected`, `schedule.occurrence.logged`.  
- Pacientes/GED: `patient.update`, `patient.address.update`, `patient.status.update`, `document.create`, `document.version_create`, `document.download`, `document.archive`, `patient.history.append`.  
- Cada evento deve aceitar payload contextual (geo, biometria, BLE, documento) sem inventar schema inexistente.

## Procedimento oficial de sincronização Repo x Banco

1. Comparar payloads/DTOs do front com snapshot do banco (Supabase); se houver pasta de snapshots (ex.: `db/snapshots`), usar como referência.  
2. Encontrou erro de coluna/check constraint inexistente: pausar a feature, registrar em `docs/architecture/OPEN_TODO.md` e alinhar DTO/payload ao schema real antes de pensar em migration.  
3. Não inventar colunas/tabelas. Se schema não disponível, abrir dúvida em `CODEX_QUESTIONS.md` e usar mock explícito.  
4. Só propor migrations após o alinhamento; mantenha validações e consumo fiéis ao que existe no banco.

## Arquitetura atual do repo (real)

Para o estado atual detalhado da implementação (rotas, componentes, estilo, dados, integrações) consulte a seção "2. Estado Atual (Implementação Real)" do documento canônico de arquitetura:

- `docs/architecture/SYSTEM_ARCHITECTURE.md`

## Como evoluir sem quebrar o padrão

- Reusar a casca do módulo Pacientes: header + command bar + abas + cards em grid (incluindo sidebar quando fizer sentido) em todas as novas telas do módulo e, por analogia, nas futuras telas de Escalas e módulos operacionais.  
- Para Escalas: criar páginas/rotas (ex.: `/escalas/pacientes`, `/escalas/profissionais`) seguindo o mesmo shell; introduzir apenas dados que já existam ou mock minimal sem inventar colunas ausentes. Aprovações de alterações devem ser previstas no fluxo (UI e audit trail).  
- Para GED/Auditoria: expor atalhos/botões e timelines, mas não presumir schema; use placeholders claros até ter endpoints.  
- Para Financeiro/Inventário/Clínico: manter visão-resumo (cards/abas) conectada ao paciente; evitar duplicação de cadastro.  
- Multi-tenant/perfis: quando implementar, explicitar no layout quem é o tenant/escopo ativo e registrar ações na auditoria.

## Padrões de contribuição (patch/test)

- ASCII por padrão; comentários só quando o código não for óbvio.  
- Não reverter mudanças existentes do usuário.  
- Testes: rodar `npm run lint` quando fizer alterações de código/estilo; validar manualmente as páginas tocadas.  
- UX: preservar o padrão visual de Pacientes (Fluent clássico / estilo “Dynamics”); componentes novos devem seguir bordas retas, sombra leve, tipografia Segoe/UI system.  
- Segurança/dados: não inventar colunas/tabelas; alinhar DTO/validação com o que existe. Sem dados sensíveis em commit.

## Validação rápida (manual)

- `npm run lint` para sanity check.  
- Abrir `/pacientes` e `/pacientes/[id]` para confirmar casca do módulo (header + command bar + abas + cards responsivos).  
- Conferir que:
  - `/pacientes` mantém o título “Conecta Care · Pacientes” e ações na command bar.
  - `/pacientes/[id]` segue o visual de `html/modelo_final_aparencia_pagina_do_paciente.htm` (command bar + record header + abas).

---

## Notas arquivadas / consolidada

- A seção "Arquitetura atual do repo (real)" antes detalhava itens específicos (rotas, componentes, estilos, dados). Esse conteúdo foi consolidado no documento canônico: `docs/architecture/SYSTEM_ARCHITECTURE.md`.
