# ARCHITECTURE_REAL

## Rotas / Páginas (App Router)
- `src/app/page.tsx`: home com grid de módulos.  
- `src/app/pacientes/page.tsx`: lista de pacientes em cards (Fluent clássico).  
- `src/app/pacientes/[id]/page.tsx`: detalhe do paciente com abas e cards (estilo “Dynamics”).  
- `src/app/login/page.tsx`: login mínimo (Supabase Auth).  
- Não há rotas de API implementadas.

## Componentes compartilhados
- `src/components/layout/*`: `Header`, `CommandBar` (lista), `Breadcrumb`, `AppLauncher`.  
- `src/components/FluentProviderWrapper.tsx`: provê tema claro/escuro (Fluent UI).  
- `src/components/patient/*`: blocos de formulário/visualização para abas do paciente (Dados pessoais, Endereço & logística, Rede de apoio, Administrativo).

## Estilo / UX
- `src/app/globals.css`: Tailwind 4 importado, reset e variáveis de cor básicas (sem travar scroll vertical).  
- Visual: Fluent UI 9, padrão Fluent clássico com layout inspirado em Dynamics (command bar + record header + cards em grid + sidebar).

## Composição do shell (Pacientes)
- **Command bar (lista)**: `src/components/layout/CommandBar.tsx` (título/breadcrumb + ações).  
- **Command bar (detalhe do paciente)**: `src/app/pacientes/[id]/PatientPageClient.tsx` (estilo Dynamics: Imprimir/Compartilhar/Salvar + Editar/Cancelar/Recarregar).  
- **Record header (paciente)**: avatar + nome + subtítulo + metadados à direita (status, proprietário, complexidade, convênio).  
- **Tabs**: abas horizontais em linha para seções (ex.: Dados pessoais, Endereço & logística…).  
- **Cards**: layout 2/3 + 1/3 nas abas (conteúdo principal à esquerda + sidebar à direita), responsivo para 1 coluna em telas menores.

## Camadas e responsabilidades
- **UI (src/app + src/components)**: páginas e componentes de apresentação, seguindo o padrão visual de Pacientes.  
- **Services/Helpers (a definir)**: orquestram chamadas e regras de composição de dados.  
- **API Routes (a implementar)**: endpoints Next/Edge para servir dados e aplicar validação.  
- **Supabase**: persistência/autenticação; schema real deve guiar DTOs (sem colunas inventadas).

## Integrações / Dados
- Supabase:
  - client em `src/lib/supabase/client.ts`
  - actions em `src/features/pacientes/actions/*`
  - login/guard em `/login` e `src/app/pacientes/[id]/PatientPageClient.tsx`
  - tipos canônicos gerados: `src/types/supabase.ts`
- Tipos legados: `src/types/patient.ts` (@deprecated; não adicionar novos usos).

## Build / Tooling
- Next.js 16, React 19.  
- Scripts: `npm run dev`, `build`, `start`, `lint` (eslint).  
- ESLint + Tailwind 4; sem setup de testes automatizados além do lint.

## Padrão de rotas futuras (planejado, não implementado)
- Escalas (REST planejado): `/api/escalas/pacientes` e `/api/escalas/profissionais` para listar/criar/atualizar plantões e atribuições; UI em `/escalas/pacientes` e `/escalas/profissionais` reutilizando o shell.  
- GED/Auditoria: rotas futuras devem acoplar à casca existente com timeline e ações de documento.  
- Financeiro/Inventário/Clínico: espelhar dados/controles ligados à operação, reutilizando o padrão visual do módulo Pacientes.
