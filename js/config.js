// config.js – Estado global (carregado do Supabase)
let CFG = {
    empresaNome: 'Manos Tech',
    email: 'contato@manostech.com.br',
    telefoneSuporte: '(11) 99999-9999',
    adminNome: 'Carlos Silva',
    adminEmail: 'admin@manostech.com.br',
    adminSenha: '123456', // será removido posteriormente
    logoUrl: ''
};

let EV = [];
let FN = [];

// Funções mantidas para compatibilidade – não fazem mais nada.
function carregarDados() {}
function salvarDados() {}

let usuarioLogado = null;
let eventoEmEdicao = null;
let funcionarioEmEdicao = null;
let eventoSelecionadoId = null;
let logoTemporario = null;
let configLogoTemp = null;
let patrocinadoresTemp = [];
let eventoClienteAtual = null;
let callbackConfirmacao = null;

// Inicialização: carrega configuração do Supabase
(async function initConfig() {
    try {
        const cfg = await apiCarregarConfig();
        if (cfg) {
            CFG = cfg;
            // Atualiza a interface se já estiver disponível
            if (typeof atualizarInterfaceUsuario === 'function') {
                atualizarInterfaceUsuario();
            }
        }
    } catch (e) {
        console.warn('Usando configurações padrão.');
    }
})();
