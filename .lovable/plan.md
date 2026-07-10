
# Livepulse — Upgrade para SaaS Multi-Tenant

Escopo enorme. Vou entregar em **fases sequenciais** (uma por turno) para manter qualidade e não quebrar o design atual. Cada fase é navegável e funcional com dados mock.

## Princípios
- **Preservar 100%** do design, animações, landing page e páginas atuais.
- **pt-BR** em toda a UI, com i18n preparado (chaves em `src/i18n/pt-BR.ts` + hook `useT`, pronto para adicionar EN/ES/FR/IT/DE).
- **Multi-tenant mock**: `AgencyContext` com `agency_id` propagado por todos os services; filtro por tenant já aplicado.
- **4 papéis**: `super_admin | agency_owner | manager | host` — `auth-context` estendido, `ROLE_ROUTES` reescrito, guards por rota e por ação (`can(action)`).
- **Camada de dados**: `src/services/*` por recurso (agencies, users, hosts, managers, chat, goals, ranking, gamification, livecoins, store, seasons, files, calendar, finance, subscriptions). Interface pronta pra Supabase.
- **Tipos DB-ready** em `src/types/` refletindo schema futuro (tenant_id em tudo).

## Fase 1 — Fundação (este turno)
1. **i18n**: `src/i18n/{index.ts, pt-BR.ts, en.ts}` + `useT()`; seletor no Configurações.
2. **Multi-tenant + papéis**:
   - `src/types/index.ts`: adicionar `Agency`, `Subscription`, `super_admin`, `agency_owner`; `tenant_id` em Host/Manager/Tx/etc.
   - `auth-context`: 4 mock users (1 por papel) + `currentAgency` + `can(permission)`.
   - `constants.ts`: `ROLE_ROUTES` com rotas novas; matriz de permissões.
3. **Mocks completos**: `mock-agencies.ts`, `mock-subscriptions.ts`, `mock-chat.ts`, `mock-gamification.ts`, `mock-livecoins.ts`, `mock-store.ts`, `mock-seasons.ts`, `mock-files.ts`, `mock-calendar.ts` (dados ricos, realistas).
4. **Services** para cada recurso novo (mesma forma dos existentes).
5. **Login**: 4 botões de papel (Super Admin, Dono, Gerente, Host).
6. **Sidebar**: navegação dinâmica por papel; grupo "Super Admin" quando aplicável.

## Fase 2 — Área Super Admin
- `/admin/agencies` (lista, criar, editar, bloquear)
- `/admin/subscriptions` (planos, faturamento MRR/ARR)
- `/admin/overview` (dashboard global)
- `/admin/support` (chat privado com donos)
- `/admin/broadcasts` (comunicados globais)

## Fase 3 — Comunicação
- `/app/chat` — chat interno da agência (canais + DMs, mensagens fixadas, upload mock, busca, emojis).
- Chat privado Super Admin ↔ Dono integrado.

## Fase 4 — Engajamento
- `/app/gamification` — níveis, badges, conquistas.
- `/app/livecoins` — saldo, histórico, comprar.
- `/app/store` — marketplace (Host / Agência).
- `/app/seasons` — temporadas + premiações.
- Perfil premium com moldura/badges/nível.

## Fase 5 — Operações
- `/app/files` — centro de arquivos por agência.
- `/app/calendar` — eventos, metas, reuniões, pagamentos.
- Cadastro de usuário completo (foto, WhatsApp com botão "Abrir WhatsApp", país, cidade, plataforma, ID, gerente).
- Metas e Ranking: reforçar CRUD + filtros pedidos.

## Fase 6 — SaaS/Config
- Configurações: perfil, agência, idioma, tema, segurança, notificações.
- Assinaturas na visão do Dono (plano, vencimento, status).

## Detalhes técnicos
- Sem backend, sem auth real, sem DB — tudo mock.
- `AgencyProvider` envolve `AuthProvider`; hooks `useAgency()`, `useT()`, `useCan()`.
- Guards: `beforeLoad` nas rotas `/admin/*` (só super_admin) e filtragem já existente em `/app/*`.
- Zero mudanças na landing page e no visual atual — apenas extensões.

Confirma que posso começar pela **Fase 1** agora? Se preferir outra ordem (ex: começar por Chat ou Super Admin), me diz.
