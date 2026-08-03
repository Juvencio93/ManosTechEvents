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
npm run preview   # serve em localhost:4173/ManosTechEvents/
```

## Deploy no GitHub Pages

O projeto é publicado em **https://juvencio93.github.io/ManosTechEvents/**.

O build usa `base: '/ManosTechEvents/'` automaticamente ao executar `npm run build`,
gerando caminhos corretos para o sub-caminho do GitHub Pages.
Em desenvolvimento (`npm run dev`) o servidor Vite usa `base: '/'` para que o app
fique acessível em `http://localhost:5173/` sem prefixo.

### Passos para publicar manualmente

1. Configure as variáveis de ambiente no painel do repositório
   (Settings → Secrets and variables → Actions):

   | Nome | Descrição |
   |------|-----------|
   | `VITE_SUPABASE_URL` | URL do projeto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Chave anon pública |

2. Execute o build:

```bash
npm run build
```

3. Publique o conteúdo de `dist/` na branch `gh-pages` ou configure
   o GitHub Pages para usar a pasta `dist/` da branch principal.

### Aviso sobre o warning de CSP do Google Translate

Alguns navegadores/extensões injetam a folha de estilos do Google Translate e
geram um aviso de Content Security Policy na consola. Esse warning é externo ao
app (gerado pela extensão) e **não é a causa de nenhum 404 do projeto**.
Nenhuma permissão CSP foi adicionada para silenciá-lo, pois seria inseguro.

## Fluxo principal

- Painel administrativo: `/ManosTechEvents/` → redireciona para `/ManosTechEvents/pages/index.html`
- Portal cativo: `/ManosTechEvents/portal.html?token=<TOKEN>`

## Validação manual

1. Abrir o painel e fazer login.
2. Confirmar carregamento de configurações e listagem de eventos.
3. Criar/editar/excluir evento.
4. Abrir área do cliente e conferir dashboard.
5. Abrir `/ManosTechEvents/portal.html` com token válido e registrar visitante.
6. Confirmar atualização de visitantes no evento.
