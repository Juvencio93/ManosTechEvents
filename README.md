# SGE – Sistema de Gestão de Eventos | Manos Tech

Sistema de gestão de eventos com portal cativo, visitantes, financeiro e relatórios.  
Backend: [Supabase](https://supabase.com). Frontend: HTML + CSS + JavaScript puro.

---

## Rodando localmente

O projeto é uma aplicação estática. Para evitar erros de CORS ao carregar os fragmentos de página (`pages/*.html`), **é necessário servir os arquivos com um servidor HTTP local**, não abrir o `index.html` diretamente no navegador (protocolo `file://`).

### Opção 1 – Python (sem dependências extras)

```sh
git clone https://github.com/Juvencio93/ManosTechEvents.git
cd ManosTechEvents
python3 -m http.server 8080
```

Abra `http://localhost:8080` no navegador.

### Opção 2 – Node.js (`npx serve`)

```sh
git clone https://github.com/Juvencio93/ManosTechEvents.git
cd ManosTechEvents
npx serve .
```

### Opção 3 – VS Code Live Server

Instale a extensão **Live Server** no VS Code e clique em *"Open with Live Server"* no `index.html`.

---

## Estrutura do projeto

```
index.html          ← Shell principal da aplicação (login + dashboard)
portal.html         ← Portal cativo para acesso Wi-Fi (público)
pages/              ← Fragmentos de página carregados dinamicamente
js/                 ← Módulos JavaScript
  config.js         ← Estado global (variáveis compartilhadas)
  utils.js          ← Funções utilitárias
  api.js            ← Integração com Supabase
  auth.js           ← Login / logout / sessão
  eventos.js        ← CRUD de eventos
  dashboard.js      ← Gráficos e métricas
  financeiro.js     ← Módulo financeiro
  relatorios.js     ← Geração de relatórios PDF
  funcionarios.js   ← Gerenciamento de funcionários
  portal.js         ← Lógica do portal cativo
  cliente.js        ← Área do cliente
  app.js            ← Roteamento de páginas
  init.js           ← Inicialização e restauração de sessão
  core/api.js       ← API alternativa (estrutura modular)
api/                ← Backend PHP legado (não utilizado na versão atual)
assets/css/         ← Estilos globais
```

---

## Variáveis de ambiente

As credenciais do Supabase estão diretamente em `js/api.js`.  
Para trocar de projeto Supabase, edite `SUPABASE_URL` e `SUPABASE_KEY` nesse arquivo.

---

## GitHub Pages

O site é publicado automaticamente via **GitHub Pages** com raiz na branch `main`.  
URL principal: `https://juvencio93.github.io/ManosTechEvents/`  
Portal cativo:  `https://juvencio93.github.io/ManosTechEvents/portal.html?token=<TOKEN>`

---

## Build com Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.
