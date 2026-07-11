# Livepulse V1 · Backend real (Lovable Cloud)

Lovable Cloud ativado. O plano abaixo transforma o MVP mock em uma V1 publicável **em duas rodadas** — sem quebrar telas que ainda usarão mock temporariamente. Design, rotas, i18n e permissões atuais serão preservados.

## Rodada 1 — Fundação (esta rodada)

### 1. Schema (migration única)
Tabelas em `public`, todas com `agency_id uuid`, `created_at`, `updated_at`, GRANTs para `authenticated` + `service_role` e RLS habilitado:

- `agencies` — nome, slug, logo, país, plano, status, mrr, contadores
- `subscriptions` — 1:1 com `agencies`, plano, preço, status, próxima cobrança
- `profiles` — 1:1 com `auth.users`, nome, avatar, whatsapp, país, cidade, locale, `agency_id`
- `user_roles` — tabela separada (segurança) com enum `app_role` (`super_admin`, `agency_owner`, `manager`, `host`)
- `managers` — perfil operacional do gerente na agência
- `hosts` — vínculo com manager, plataforma, categoria, métricas base
- `goals` — meta por host/agência, período, alvo, progresso
- `financial_transactions` — receita/comissão/pagamento por host, com tipo/status/data
- `commissions` — regra de comissão por host/manager (percentual, base)
- `rankings` — snapshot semanal/mensal de posição por host
- `notifications` — destinatário (user_id), tipo, título, corpo, lida

Extras técnicos:
- Enum `app_role`
- Função `public.has_role(_user_id, _role)` `SECURITY DEFINER`
- Função `public.current_agency_id()` `SECURITY DEFINER` (lê da `profiles`)
- Trigger `on_auth_user_created` → cria `profiles` automaticamente
- Trigger `set_updated_at` em todas as tabelas
- Bucket Storage `avatars` (público) e `agency-logos` (público)

### 2. RLS (política por tabela)
Modelo unificado:
- `super_admin` → acesso total via `has_role(auth.uid(),'super_admin')`
- `agency_owner` → `agency_id = current_agency_id()` em SELECT/INSERT/UPDATE/DELETE
- `manager` → SELECT em hosts/goals do próprio time (`manager_id = auth.uid()`), UPDATE limitado; **nega** SELECT em `financial_transactions`, `subscriptions`, `commissions` da agência
- `host` → SELECT/UPDATE apenas nas próprias linhas (`user_id = auth.uid()`); **nega** financeiro/assinatura
- `profiles`: leitura pela própria linha ou colegas de agência; update só na própria
- `user_roles`: leitura pelo próprio usuário; write só `service_role` + super_admin
- `notifications`: destinatário lê/atualiza a própria

### 3. Autenticação real
- `src/routes/login.tsx` refeita: email/senha + Google (via `lovable.auth.signInWithOAuth`) + link "esqueci a senha"
- Nova `src/routes/signup.tsx` (cria conta + agência inicial para `agency_owner`)
- Nova `src/routes/forgot-password.tsx` e `src/routes/reset-password.tsx`
- `src/lib/auth-context.tsx` reescrita: usa `supabase.auth`, carrega `profiles` + `user_roles` + `agency`, expõe a mesma API (`user`, `currentAgency`, `can`, `canAccess`) — consumidores não mudam
- Sessão persistente + `onAuthStateChange` no `__root.tsx` invalidando queries
- Layouts `/app` e `/admin` passam a redirecionar para `/login` quando `!user`

### 4. Camada de dados real
- Introduz `@tanstack/react-query` (já instalado) com `QueryClientProvider` no root
- `src/services/index.ts` refatorado — cada `service` vira função que chama `supabase.from(...)` com filtros por `agency_id` (RLS reforça no servidor)
- Hooks `useAgencies`, `useHosts`, `useManagers`, `useGoals`, `useFinance`, `useRanking`, `useNotifications`, `useSubscriptions`

### 5. Telas conectadas nesta rodada (CRUD real)
- **/login, /signup, /forgot-password, /reset-password** — auth real
- **/app/dashboard** — lê hosts, goals, financeiro reais (escopados)
- **/app/hosts** — CRUD completo (criar, editar, excluir, buscar, filtrar)
- **/app/managers** — CRUD completo
- **/app/goals** — CRUD completo
- **/app/finance** — leitura + criar transação + filtros (bloqueada para manager/host via RLS + guard)
- **/app/ranking** — leitura real (snapshot mais recente)
- **/app/notifications** — leitura + marcar como lida
- **/admin/agencies** — CRUD completo (super_admin)
- **/admin/subscriptions** — leitura + editar plano/status
- **/admin/overview** — KPIs reais

## Rodada 2 (próxima) — completar migração
Fica **explicitamente marcado como mock** ao final desta rodada:
- `/admin/support` (chat de suporte)
- `/admin/broadcasts` (comunicados)
- `/app/community`, `/app/ai`, `/app/reports` (relatórios PDF), `/app/commissions`, `/app/profile` (edição de avatar via Storage)
- Seed de dados demo por agência

## Diagrama de escopo por papel

```text
super_admin  ──►  tudo (via has_role)
agency_owner ──►  agency_id = current_agency_id()
manager      ──►  hosts/goals do time; NEGA financeiro/assinaturas
host         ──►  próprias linhas; NEGA financeiro/assinaturas
```

## Checagens antes de fechar a rodada
- `tsgo` limpo
- Login/logout/reset funcionando end-to-end
- Criar agência + host + goal + transação salvando de fato (`supabase--read_query` confirma)
- Segundo usuário de outra agência **não** enxerga dados da primeira
- Manager e host recebem `permission denied` ao consultar `financial_transactions`

## Observações
- Primeiro usuário criado precisará receber `super_admin` manualmente via `insert` na `user_roles` (te aviso no resumo com o SQL exato)
- Todos os mocks em `src/lib/mock-*` continuam no repo até serem substituídos na Rodada 2, mas nenhum será importado pelas telas migradas

Confirme para eu executar a Rodada 1 completa.
