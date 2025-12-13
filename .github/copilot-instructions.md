**AVISO**: fonte de verdade em `docs/architecture/CODEX_GUIDE.md`. Visual oficial: `html/comparativo-fluent.html` (Fluent clássico – Opção A).  
Resumo mínimo para contexto rápido:

- Padrão visual obrigatório: Fluent clássico (Opção A) — command bar com título "Conecta Care · Pacientes" + breadcrumb; header do paciente com badges (status/alergia) e metadados; abas em linha (Dados pessoais, Endereço & logística, Rede de apoio, Administrativo, Financeiro, Clínico, Documentos/GED, Histórico & Auditoria); cards em grid responsivo com borda leve.  
- Stack visual: Fluent clássico + CSS/Tailwind simples. **Não usar Fluent 2 puro nem MUI.**  
- Referências visuais: `src/app/pacientes/[id]/page.tsx` (detalhe) e `src/app/pacientes/page.tsx` (lista).  
- Para regras completas de produto (Escalas como core), segurança, e padrões de contribuição, consultar `docs/architecture/CODEX_GUIDE.md`.
