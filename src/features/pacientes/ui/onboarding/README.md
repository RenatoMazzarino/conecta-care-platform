# UI — Onboarding (referência)

Este diretório guarda **componentes de UI pensados para o futuro fluxo de onboarding de paciente** (cadastro em etapas).

Status:
- Ainda **não** existe contrato/fluxo de onboarding implementado.
- O componente abaixo fica aqui para **não perder o trabalho** e servir como base quando o onboarding for especificado.

## Componentes
- `src/features/pacientes/ui/onboarding/DadosPessoaisOnboardingForm.tsx`
  - Layout “form-like”/lista (bom para onboarding) que cobre os campos da Aba 01.
  - Atualmente pode ser reutilizado como formulário de edição da Aba 01, mas a intenção principal é onboarding.

## Observação sobre a nova tela de leitura
- A Aba 01 agora renderiza os dados em **cards em grid** (view-only) conforme o visual fornecido, com command bar “Dynamics style” no topo e cards secundários na coluna direita.
- Esse documento serve para deixar claro que o componente acima **não está sendo usado para a leitura padrão**; ele permanece como base para o futuro onboarding e para o modo de edição.
