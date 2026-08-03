# ManosTechEvents — Agent Instructions

Este repositório contém o **SGE – Sistema de Gestão de Eventos** da Manos Tech.

## Stack

- **Frontend:** HTML + CSS + JavaScript puro
- **Build/Dev:** [Vite](https://vitejs.dev) (multi-page)
- **Backend:** [Supabase](https://supabase.com) (via CDN no browser)
- **Controle de versão:** GitHub

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha antes de executar:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Arquitetura

- `index.html` — redireciona para `pages/index.html`
- `pages/index.html` — painel principal (SPA via fetch de `pages/*.html`)
- `portal.html` — portal cativo de acesso Wi-Fi
- `js/` — módulos JavaScript do painel
- `assets/css/` — folhas de estilo
- `api/` — scripts PHP auxiliares (legado)
