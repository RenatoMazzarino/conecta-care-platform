# ADR-007: GED - Custodia, Watermark, Carimbo do Tempo e Acesso ao Original

Status: Accepted
Data: 2025-12-27
Owner: @RenatoMazzarino

Contexto

- O GED e o repositorio canonico de arquivos do paciente e precisa garantir custodia, integridade e rastreabilidade.
- A operacao exige visualizacao e impressao seguras, sem expor o original por padrao.
- Compliance e auditoria demandam carimbo do tempo e trilha completa de eventos.

Decisao

- O original e imutavel e nunca e sobrescrito; novas versoes sao append-only.
- Toda entrada gera SHA-256 do original, timestamp de entrada e log com actor/origem/modulo.
- Carimbo do tempo usa uma tabela canonica unica do provedor SERPRO via interface `TimestampProvider`.
- Em DEV sem sandbox SERPRO, o provider grava receipt mockado no mesmo schema, sem coluna/flag extra; com sandbox, usa o provider real.
- Visualizacao padrao usa watermark overlay (usuario/role + data/hora + tenant/paciente) e banner "Documento em custodia Conecta Care".
- O texto de watermark deve dissuadir e rastrear, sem prometer impossibilidade de copia.
- Em DEV, existe toggle para desativar overlay ("Habilitar captura/print (DEV)").
- Impressao padrao gera derivado com watermark; loga evento e guarda artefato exato do impresso.
- Artefatos nao viram versao; `document_artifacts` e entidade canonica.
- Links seguros usam `document_secure_links` com `token_hash`, expiracao e download unico.
- Acesso ao original somente via "Solicitar original" com link seguro, expiracao, autenticacao, download unico, stream controlado e logs.
- DEV: qualquer usuario autenticado do tenant pode solicitar/ver original; TTL padrao DEV: 7 dias.
- Producao: TTL padrao 72h (configuravel por tenant) e acesso por usuario autenticado do tenant com acesso ao paciente.
- Retencao padrao: 20 anos, com impacto direto em custo de storage e compliance do SaaS.
- Importacao em massa (onboarding) via ZIP e requisito; especificacao detalhada no contrato da ABA05.

Alternativas consideradas

- Sobrescrever o original e manter apenas o ultimo binario: rejeitado (perda de integridade).
- Aplicar watermark no binario original: rejeitado (altera o original sob custodia).
- Permitir acesso direto ao original no viewer padrao: rejeitado (risco e falta de rastreabilidade).
- Persistir artefatos de impressao como nova versao: rejeitado (mistura evidencia com historico).
- Tabelas de carimbo do tempo por modulo: rejeitado (duplicidade e inconsistencias).

Consequencias

- O GED precisa registrar mais eventos e manter logs ricos para auditoria.
- A camada de visualizacao/impressao exige overlay dinamico e artefatos derivados.
- Requer implementacao da tabela canonica de carimbo do tempo, `document_artifacts` e `document_secure_links`.
- Requer tabelas de importacao (`document_import_jobs` e `document_import_job_items`) e pipeline assincro.
- Retencao de 20 anos aumenta custo de storage e exige governanca de compliance.

Referencias

- [docs/contracts/pacientes/ABA05_GED.md](../../contracts/pacientes/ABA05_GED.md)
- [docs/reviews/PLANO_PACIENTES_ABA05_GED.md](../../reviews/PLANO_PACIENTES_ABA05_GED.md)
- [AGENT.md](../../../AGENT.md)
- [SERPRO (ACT ICP-Brasil)](https://www.serpro.gov.br/)
