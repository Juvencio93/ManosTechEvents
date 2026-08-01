# ManosTechEvents

Sistema de Gerenciamento de Eventos da Manos Tech — powered by **GitHub + Supabase**.

## Tecnologias

- HTML, CSS e JavaScript (vanilla)
- [Supabase](https://supabase.com) (banco de dados PostgreSQL + autenticação)
- Vite (servidor de desenvolvimento e build)

## Pré-requisitos

- [Node.js](https://nodejs.org) (v18 ou superior) e npm
- Projeto no [Supabase](https://supabase.com) criado e configurado

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (use `.env.example` como base):

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sua-anon-key>
```

> As chaves de publicação (`anon`/`publishable`) são seguras para uso no cliente.
> Nunca exponha a `service_role` key.

## Instalação e execução local

```sh
git clone https://github.com/Juvencio93/ManosTechEvents.git
cd ManosTechEvents
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Build para produção

```sh
npm run build
```

Os arquivos de saída ficam em `dist/`.

## Lint e formatação

```sh
npm run lint
npm run format
```

## Estrutura do projeto

```
├── pages/          # Páginas HTML do admin
├── portal.html     # Portal público de cadastro de visitantes
├── js/
│   ├── core/
│   │   ├── api.js      # Integração com Supabase
│   │   └── auth.js     # Módulo de autenticação
│   └── ...             # Outros módulos JS
├── assets/         # CSS e outros recursos estáticos
└── api/            # (legado) PHP + SQLite — não utilizado na versão atual
```

## Notas de migração

Este projeto foi desconectado do Lovable. As dependências e configurações
específicas do Lovable (`@lovable.dev/cloud-auth-js`, `@lovable.dev/vite-tanstack-config`)
foram removidas. O projeto agora funciona exclusivamente via **GitHub + Supabase**.
