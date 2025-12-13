# ARCHITECTURE_REAL

## Rotas / Páginas (App Router)
- `src/app/page.tsx`: home com grid de módulos.  
- `src/app/pacientes/page.tsx`: lista de pacientes em cards (Fluent A).  
- `src/app/pacientes/[id]/page.tsx`: detalhe do paciente com abas e cards (Fluent A).  
- Não há rotas de API implementadas.

## Componentes compartilhados
- `src/components/layout/*`: `Header`, `CommandBar` (casca Fluent A), `Breadcrumb`, `AppLauncher`.  
- `src/components/FluentProviderWrapper.tsx`: provê tema claro/escuro (Fluent UI).  
- `src/components/patient/*`: blocos de formulário/visualização para abas do paciente (Dados pessoais, Endereço & logística, Rede de apoio, Administrativo).

## Estilo / UX
- `src/app/globals.css`: Tailwind 4 importado, reset, variáveis de cor básicas, overflow oculto.  
- Visual: Fluent UI 9, padrão Fluent clássico (bordas retas, cards com sombra leve) nas páginas de pacientes.

## Composição do shell Fluent A
- **CommandBar**: título/breadcrumb e ações (imprimir, compartilhar, primária) em fundo branco com borda leve.  
- **Header**: topo fixo com launcher, busca e ações de usuário.  
- **Tabs**: abas horizontais em linha para seções (ex.: Dados pessoais, Endereço & logística…).  
- **Cards**: conteúdo em grid responsivo de cards brancos com borda/sombra sutis (3 colunas desktop, quebra em telas menores).

## Camadas e responsabilidades
- **UI (src/app + src/components)**: páginas e componentes de apresentação, seguindo shell Fluent A.  
- **Services/Helpers (a definir)**: orquestram chamadas e regras de composição de dados.  
- **API Routes (a implementar)**: endpoints Next/Edge para servir dados e aplicar validação.  
- **Supabase**: persistência/autenticação; schema real deve guiar DTOs (sem colunas inventadas).

## Integrações / Dados
- Supabase: `src/lib/supabase/client.ts` cria client com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; exportado via `src/lib/supabase/index.ts`. Ainda não é utilizado por páginas/serviços.  
- Tipos: `src/types/patient.ts` define estruturas de paciente e enum de abas (inclui Financeiro, Clínico, Documentos, Histórico). Não há schemas nem validações conectadas.

## Build / Tooling
- Next.js 16, React 19.  
- Scripts: `npm run dev`, `build`, `start`, `lint` (eslint).  
- ESLint + Tailwind 4; sem setup de testes automatizados além do lint.

## Padrão de rotas futuras (planejado, não implementado)
- Escalas (REST planejado): `/api/escalas/pacientes` e `/api/escalas/profissionais` para listar/criar/atualizar plantões e atribuições; UI em `/escalas/pacientes` e `/escalas/profissionais` reutilizando o shell.  
- GED/Auditoria: rotas futuras devem acoplar à casca existente com timeline e ações de documento.  
- Financeiro/Inventário/Clínico: espelhar dados/controles ligados à operação, reutilizando o padrão Fluent A.
