# Manos Tech Events

Sistema web para gestão de eventos com backend em **Supabase**.

## Stack atual

- Frontend estático com HTML/CSS/JS
- Build/dev server com Vite
- Backend único: Supabase (Auth, Database e Functions)

## Requisitos

- Node.js 20+
- npm 10+

## Configuração local

1. Instale dependências:

```bash
npm install
```

2. Crie/edite o arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY
```

> Compatibilidade: `VITE_SUPABASE_PUBLISHABLE_KEY` também é aceito como fallback.

3. Rode em desenvolvimento:

```bash
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Fluxo principal

- Painel administrativo: `/` (redireciona para `/pages/index.html`)
- Portal cativo: `/portal.html`

## Validação manual

1. Abrir o painel e fazer login.
2. Confirmar carregamento de configurações e listagem de eventos.
3. Criar/editar/excluir evento.
4. Abrir área do cliente e conferir dashboard.
5. Abrir `/portal.html` com token válido e registrar visitante.
6. Confirmar atualização de visitantes no evento.
