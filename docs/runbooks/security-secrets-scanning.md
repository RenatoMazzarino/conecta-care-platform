# Runbook — Secret Scanning (gitleaks)

## Objetivo / quando usar

Garantir que nenhum segredo seja versionado. Usar este runbook para:

- executar varredura local antes de PRs;
- entender falhas do CI (job “Secrets Scan”);
- atualizar allowlist/baseline quando houver falso positivo comprovado.

## Pré-requisitos

- `gitleaks` instalado localmente (ou via container).
- Acesso ao repositório.
- Configuração canônica em `.gitleaks.toml`.

## Passo a passo (local)

1) Instalar gitleaks (exemplos):
   - macOS: `brew install gitleaks`
   - Linux: baixar release oficial do GitHub e adicionar ao PATH
2) Rodar varredura local:

   ```bash
   gitleaks detect --source . --config .gitleaks.toml --report-format json --report-path gitleaks-report.json
   ```

3) Revisar o relatório (`gitleaks-report.json`).
4) Se não houver findings, a varredura termina com exit code 0.

## Como validar sucesso

- Exit code 0.
- Arquivo `gitleaks-report.json` criado (pode ser vazio).

## Quando o CI falhar (Secrets Scan)

1) Baixar o artefato `gitleaks-report` do workflow.
2) Identificar o arquivo/linha sinalizados.
3) Se for segredo real:
   - Remover do repo imediatamente.
   - Rotacionar usando `docs/reviews/SECRETS_ROTATION.md`.
   - Abrir incidente conforme `docs/runbooks/security-incident-response.md`.
4) Se for falso positivo:
   - Justificar por escrito (por que não é segredo).
   - Atualizar `.gitleaks.toml` com allowlist mínima (path/regex) e comentário de justificativa.

## Rollback / mitigação

- Não há rollback automático. Em caso de falha, remova o segredo, rotacione e reexecute o scan.

## Logs e rastreabilidade

- CI: job “Secrets Scan” em `.github/workflows/ci.yml`.
- Relatório: artefato `gitleaks-report`.
- Configuração: `.gitleaks.toml`.

## Troubleshooting

- **gitleaks não encontrado**: instale o binário ou use container.
- **Falso positivo recorrente**: crie allowlist mínima com justificativa e reexecute.
- **Arquivo gigante**: use allowlist por path somente se for histórico e sem risco (ex.: dumps arquivados).

## Segurança e compliance (o que NÃO fazer)

- Nunca adicione segredos reais a arquivos `.env*.example`.
- Não adicione allowlist ampla sem justificativa.
- Não reescreva histórico Git sem autorização explícita.
