# CODEX_QUESTIONS

Perguntas essenciais (máx. 15) para evitar decisões erradas.

## Escalas
1) Quais status oficiais de plantão (planejado, confirmado, em andamento, concluído, falta, troca pendente/negada) e onde ficam registros de aprovação?  
2) Fluxo de troca de plantão: quem pode solicitar, quem aprova e quais eventos precisam ser auditados?  
3) Check-in/out: qual API de biometria (SERPRO) e geolocalização/BLE será usada e qual payload mínimo precisamos guardar (geo, biometria, BLE, device, horário)?  
4) Há regras de tolerância/rounding para cálculo de horas (atraso/adiantamento) que impactam faturamento/pagamento?

## Auditoria
5) Existe endpoint centralizado de auditoria ou precisamos criar (por paciente/tenant)? Quais campos mínimos (actor, role, origem, IP, geo, payload)?  
6) Eventos de Escalas devem ser anexados onde (tabela única de auditoria ou por domínio)?  
7) Políticas de retenção/anonimização (LGPD) afetam histórico/auditoria? Qual período?

## Segurança / Multi-tenant
8) Como identificar o tenant/empresa atual no front (token, subdomínio, header) e qual isolamento precisamos refletir na UI?  
9) Quais papéis oficiais (empresa, família, profissional, médico/fisio/nutri, supervisor, gerente) e que ações cada um pode fazer em Pacientes/Escalas?

## Dados / Schema
10) Qual o schema real de Paciente no Supabase (campos obrigatórios, status, alergias, responsável legal, PAC-ID gerado onde)?  
11) Convenções de IDs (PAC-000123, ESC-000123): como são geradas, exibidas e editáveis?  
12) GED: onde os documentos estão (bucket Supabase, S3, outro)? Como versionar e vincular a paciente/escala/financeiro?  
13) Clínico/Financeiro/Inventário: quais datasets já existem em outros sistemas que devemos espelhar versus criar do zero?  
14) Há endpoint unificado para Histórico do paciente que aceite eventos de GED, Escalas e Administrativo?
