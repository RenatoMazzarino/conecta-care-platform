# Code review

## Observações

- O componente `src/app/pacientes/[id]/page.tsx` está tipando `params` como `Promise<{ id: string }>` e usando o hook experimental `use` para resolver a promessa em um componente cliente. Em páginas App Router cliente, os parâmetros de rota já chegam como objeto síncrono ou podem ser obtidos via `useParams` do `next/navigation`. A abordagem atual depende de API experimental do React 19 e pode quebrar em produção caso o runtime esteja em React 18, além de renderizar com `void id` apenas para evitar lint. Sugiro receber `params` como objeto síncrono ou usar `useParams` para eliminar a dependência de `use`/Promise.

- Em `src/app/pacientes/page.tsx`, a ação "Novo paciente" usa `window.location.href` para navegar. Isso força um reload completo, descartando estado de contexto ou cache do app. É mais seguro usar o `useRouter` do Next (ou `Link`) para navegação cliente, evitando perda de estado e preservando prefetch.
