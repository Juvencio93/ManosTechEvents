// ============================================================
// api.js – Comunicação padronizada com Supabase
// ============================================================

const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

const supabaseClient = window.__SUPABASE__ || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.__SUPABASE__ = supabaseClient;

let sessao = null;

// ============================================================
// HELPERS (convertem entre camelCase e snake_case)
// ============================================================

function toSnakeCase(obj) {
    const novo = {};
    for (const chave in obj) {
        if (obj[chave] === undefined) continue;
        let snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
        let valor = obj[chave];
        if (Array.isArray(valor)) valor = JSON.stringify(valor);
        novo[snake] = valor;
    }
    return novo;
}

function toCamelCase(obj) {
    const novo = {};
    for (const chave in obj) {
        const camel = chave.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());
        novo[camel] = obj[chave];
    }
    return novo;
}

// ============================================================
// API – Única camada de comunicação
// ============================================================

const API = {

    // ---------- AUTENTICAÇÃO ----------
    async login(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw new Error(error.message);
            sessao = data.user;

            const { data: perfil, error: perfilError } = await supabaseClient
                .from('perfis')
                .select('*')
                .eq('id', data.user.id)
                .single();
            if (perfilError) throw new Error('Perfil não encontrado');

            // Lógica especial do administrador (mantida igual ao original)
            if (perfil.nivel === 'Administrador' && CFG && CFG.adminNome && perfil.nome !== CFG.adminNome) {
                try {
                    await supabaseClient.from('perfis').update({ nome: CFG.adminNome }).eq('id', data.user.id);
                    perfil.nome = CFG.adminNome;
                } catch (e) {}
            }

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email
                },
                perfil: {
                    nome: perfil.nome,
                    nivel: perfil.nivel,
                    permissoes: perfil.permissoes || {}
                },
                token: data.session?.access_token || null
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async logout() {
        try {
            await supabaseClient.auth.signOut();
            sessao = null;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async restaurarSessao() {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) return { success: false, data: null };

            sessao = session.user;
            const { data: perfil } = await supabaseClient.from('perfis').select('*').eq('id', sessao.id).single();
            if (!perfil) return { success: false, data: null };

            return {
                success: true,
                data: {
                    nome: perfil.nome,
                    email: sessao.email,
                    nivel: perfil.nivel,
                    permissoes: perfil.permissoes || {}
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async alterarSenha(novaSenha) {
        try {
            const { error } = await supabaseClient.auth.updateUser({ password: novaSenha });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ---------- CONFIGURAÇÕES ----------
    async getConfig() {
        try {
            const { data, error } = await supabaseClient.from('config').select('*').eq('id', 1).single();
            if (error) throw error;
            return {
                success: true,
                data: {
                    empresaNome: data.empresa_nome,
                    email: data.email,
                    telefoneSuporte: data.telefone_suporte,
                    adminNome: data.admin_nome,
                    adminEmail: data.admin_email,
                    logoUrl: data.logo_url
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async salvarConfig(cfg) {
        try {
            const { error } = await supabaseClient.from('config').update({
                empresa_nome: cfg.empresaNome,
                email: cfg.email,
                telefone_suporte: cfg.telefoneSuporte,
                admin_nome: cfg.adminNome,
                admin_email: cfg.adminEmail,
                logo_url: cfg.logoUrl
            }).eq('id', 1);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ---------- EVENTOS ----------
    async getEventos() {
        try {
            const { data, error } = await supabaseClient.from('eventos').select('*').order('id', { ascending: false });
            if (error) throw error;

            const eventos = data.map(e => {
                const ev = toCamelCase(e);
                if (typeof ev.patrocinadoresLogos === 'string') {
                    try { ev.patrocinadoresLogos = JSON.parse(ev.patrocinadoresLogos); } catch (_) { ev.patrocinadoresLogos = []; }
                }
                ev.visitantes = [];
                return ev;
            });

            return { success: true, data: eventos };
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    },

    async salvarEvento(evento) {
        try {
            let dados = { ...evento };
            if (!dados.id) {
                dados.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
            }

            const dadosSnake = toSnakeCase(dados);
            let result;

            if (dados.id) {
                result = await supabaseClient.from('eventos').update(dadosSnake).eq('id', dados.id);
            } else {
                result = await supabaseClient.from('eventos').insert([dadosSnake]);
            }

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async excluirEvento(id) {
        try {
            const { error } = await supabaseClient.from('eventos').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ---------- VISITANTES ----------
    async registrarVisitante(token, dados) {
        try {
            const { data: evento, error: errEvento } = await supabaseClient
                .from('eventos')
                .select('id')
                .eq('token', token)
                .single();

            if (errEvento || !evento) throw new Error('Evento não encontrado');

            dados.evento_id = parseInt(evento.id, 10);
            const { error } = await supabaseClient.from('visitantes').insert([toSnakeCase(dados)]);
            if (error) throw error;

            // Atualiza total de visitantes em segundo plano (não bloqueia)
            this._atualizarTotalVisitantes(evento.id);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getVisitantes(eventoId) {
        try {
            const { data, error } = await supabaseClient
                .from('visitantes')
                .select('*')
                .eq('evento_id', eventoId)
                .order('id', { ascending: false });

            if (error) throw error;
            return { success: true, data: data.map(toCamelCase) };
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    },

    // Método interno (não chamar diretamente)
    async _atualizarTotalVisitantes(eventoId) {
        try {
            const { count, error } = await supabaseClient
                .from('visitantes')
                .select('*', { count: 'exact', head: true })
                .eq('evento_id', eventoId);

            if (!error && count !== null) {
                await supabaseClient.from('eventos').update({ totalVisitantes: count }).eq('id', eventoId);
            }
        } catch (e) {
            console.warn('Erro ao atualizar total de visitantes:', e);
        }
    },

    // ---------- FUNCIONÁRIOS ----------
    async getFuncionarios() {
        try {
            const { data, error } = await supabaseClient.from('funcionarios').select('*').order('id');
            if (error) throw error;

            const funcs = data.map(f => {
                const func = toCamelCase(f);
                if (typeof func.permissoes === 'string') {
                    try { func.permissoes = JSON.parse(func.permissoes); } catch (e) { func.permissoes = {}; }
                }
                return func;
            });

            return { success: true, data: funcs };
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    },

    async salvarFuncionario(func) {
        try {
            const dados = { ...func };
            if (typeof dados.permissoes === 'object') {
                dados.permissoes = JSON.stringify(dados.permissoes);
            }

            const dadosSnake = toSnakeCase(dados);
            let result;

            if (dados.id) {
                result = await supabaseClient.from('funcionarios').update(dadosSnake).eq('id', dados.id);
            } else {
                result = await supabaseClient.from('funcionarios').insert([dadosSnake]);
            }

            if (result.error) throw result.error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async excluirFuncionario(id) {
        try {
            const { error } = await supabaseClient.from('funcionarios').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ---------- MIKROTIK ----------
    async mikrotikLogin(token) {
        try {
            const { error } = await supabaseClient.functions.invoke('mikrotik-login', { body: { token } });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async mikrotikAtivos() {
        try {
            const { data, error } = await supabaseClient.functions.invoke('mikrotik-ativos');
            if (error) throw error;
            return { success: true, total: data.total };
        } catch (error) {
            return { success: false, error: error.message, total: 0 };
        }
    }
};

// ============================================================
// EXPORTA A API GLOBALMENTE
// ============================================================
window.API = API;

// Mantém compatibilidade com as funções antigas (chamadas legadas)
// Isso permite que você migre gradualmente sem quebrar nada
window.apiLogin = async (email, password) => {
    const result = await API.login(email, password);
    if (!result.success) throw new Error(result.error);
    return result.perfil;
};

window.apiLogout = async () => {
    await API.logout();
};

window.apiRestaurarSessao = async () => {
    const result = await API.restaurarSessao();
    return result.success ? result.data : null;
};

window.apiAlterarSenha = async (novaSenha) => {
    const result = await API.alterarSenha(novaSenha);
    if (!result.success) throw new Error(result.error);
};

window.apiCarregarConfig = async () => {
    const result = await API.getConfig();
    return result.success ? result.data : null;
};

window.apiSalvarConfig = async (cfg) => {
    const result = await API.salvarConfig(cfg);
    if (!result.success) throw new Error(result.error);
};

window.apiListarEventos = async () => {
    const result = await API.getEventos();
    if (!result.success) throw new Error(result.error);
    return result.data;
};

window.apiCriarEvento = async (evento) => {
    const result = await API.salvarEvento(evento);
    if (!result.success) throw new Error(result.error);
};

window.apiAtualizarEvento = async (id, evento) => {
    const result = await API.salvarEvento({ ...evento, id });
    if (!result.success) throw new Error(result.error);
};

window.apiExcluirEvento = async (id) => {
    const result = await API.excluirEvento(id);
    if (!result.success) throw new Error(result.error);
};

window.apiRegistrarVisitante = async (token, dados) => {
    const result = await API.registrarVisitante(token, dados);
    if (!result.success) throw new Error(result.error);
};

window.apiListarVisitantes = async (eventoId) => {
    const result = await API.getVisitantes(eventoId);
    if (!result.success) throw new Error(result.error);
    return result.data;
};

window.apiListarFuncionarios = async () => {
    const result = await API.getFuncionarios();
    if (!result.success) throw new Error(result.error);
    return result.data;
};

window.apiCriarFuncionario = async (func) => {
    const result = await API.salvarFuncionario(func);
    if (!result.success) throw new Error(result.error);
};

window.apiAtualizarFuncionario = async (id, func) => {
    const result = await API.salvarFuncionario({ ...func, id });
    if (!result.success) throw new Error(result.error);
};

window.apiExcluirFuncionario = async (id) => {
    const result = await API.excluirFuncionario(id);
    if (!result.success) throw new Error(result.error);
};

window.mikrotikLogin = async (token) => {
    const result = await API.mikrotikLogin(token);
    if (!result.success) throw new Error(result.error);
};

window.mikrotikAtivos = async () => {
    const result = await API.mikrotikAtivos();
    if (!result.success) throw new Error(result.error);
    return result.total;
};
