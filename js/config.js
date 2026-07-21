// Configurações globais e persistência
const STORAGE_KEY = 'sge_v9';

let CFG = {
    empresaNome: 'Manos Tech',
    email: 'contato@manostech.com.br',
    telefoneSuporte: '(11) 99999-9999',
    adminNome: 'Carlos Silva',
    adminEmail: 'admin@manostech.com.br',
    adminSenha: '123456',
    logoUrl: ''
};

let EV = [];
let FN = [];

const DADOS_INICIAIS = {
    config: CFG,
    eventos: [
        {
            id: 1,
            nome: 'Feira de Tecnologia 2026',
            cliente: 'TechCorp',
            dataInicio: '2026-07-07',
            dataFim: '2026-07-10',
            local: 'Centro de Convenções SP',
            patrocinadores: 'TechCorp • InovaSoft',
            patrocinadoresLogos: [],
            logoUrl: '',
            valorCobrado: 8500,
            custoOperacional: 3200,
            valorPago: 5000,
            vencimento: '2026-06-20',
            formaPagamento: 'pix',
            parcelas: 1,
            observacoes: '',
            statusManual: '',
            clienteUsuario: 'techcorp',
            clienteSenha: '123456',
            token: 'KA92JH82S',
            visitantes: [],
            totalVisitantes: 0,
            tempoMedio: 42,
            pctMobile: 87
        }
    ],
    funcionarios: [
        {
            nome: 'Carlos Silva',
            email: 'carlos@manostech.com.br',
            nivel: 'Administrador',
            senha: '123456',
            eventos: 'Todos',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        },
        {
            nome: 'Ana Souza',
            email: 'ana@manostech.com.br',
            nivel: 'Técnico',
            senha: '123456',
            eventos: 'Feira Tech',
            permissoes: { v: true, d: true, vi: true, e: false, x: false, f: false, g: false, c: false, r: true }
        }
    ]
};

let usuarioLogado = null;
let eventoEmEdicao = null;
let funcionarioEmEdicao = null;
let eventoSelecionadoId = null;
let logoTemporario = null;
let configLogoTemp = null;
let patrocinadoresTemp = [];
let eventoClienteAtual = null;
let callbackConfirmacao = null;

function carregarDados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
        try {
            const parsed = JSON.parse(dados);
            if (parsed.config) CFG = parsed.config;
            if (parsed.eventos) EV = parsed.eventos;
            if (parsed.funcionarios) FN = parsed.funcionarios;
            return;
        } catch (e) {}
    }
    CFG = DADOS_INICIAIS.config;
    EV = DADOS_INICIAIS.eventos;
    FN = DADOS_INICIAIS.funcionarios;
    salvarDados();
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config: CFG, eventos: EV, funcionarios: FN }));
}
