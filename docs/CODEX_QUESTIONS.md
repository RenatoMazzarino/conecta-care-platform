# CODEX_QUESTIONS

Perguntas essenciais (máx. 15) para evitar decisões erradas:

1) Qual o schema real de Paciente no Supabase (campos obrigatórios, status, alergias, responsável legal, PAC-ID gerado onde)?  
2) Como é identificado o tenant/empresa atual no front (token, subdomínio, header)? Há regra de isolamento que precisamos refletir na UI?  
3) Modelo operacional de Escalas: quais status de plantão (planejado, confirmado, em andamento, concluído, falta, troca pendente), e onde ficam os registros de aprovação?  
4) Qual o fluxo de troca de plantão: quem pode solicitar, quem aprova, e quais eventos devem ser auditados?  
5) Check-in/out: qual API de biometria (SERPRO) e de geolocalização/BLE será usada, e qual payload precisamos registrar no histórico?  
6) Existem limites/rounding para cálculo de horas (tolerância de atraso/adiantamento) que impactam faturamento/pagamento?  
7) GED: onde ficam armazenados os documentos hoje (bucket Supabase, S3, outro)? Como versionar e vincular documentos a paciente/escala/financeiro?  
8) Auditoria: existe endpoint centralizado ou precisamos criar (por paciente/tenant)? Quais campos mínimos (actor, role, origem, IP, geo, payload)?  
9) Perfis e permissões: quais papéis existem (empresa, família, profissional, médico/fisio/nutri, supervisor, gerente) e quais ações cada um pode fazer em Pacientes e Escalas?  
10) Clínico/Financeiro/Inventário: quais datasets já existem em outro sistema que devem ser espelhados aqui (vs. criados do zero)?  
11) Há políticas de retenção ou anonimização de dados (LGPD) que afetem histórico/auditoria?  
12) Existem convenções de ID (ex.: PAC-000123, ESC-000123) e como são geradas? Precisamos exibir/editar esses identificadores?
