// api.js – Comunicação exclusiva com Supabase (com serialização de arrays e atualização de totalVisitantes)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

const supabaseClient = window.__SUPABASE__ || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.__SUPABASE__ = supabaseClient;

let sessao = null;

// ---------- Autenticação ----------
async function apiLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    sessao = data.user;

    const { data: perfil, error: perfilError } = await supabaseClient
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (perfilError) throw new Error('Perfil não encontrado');

    // Se for o admin e o nome na configuração for diferente do perfil, atualiza o perfil
    if (perfil.email === 'admin@manostech.com.br' || perfil.nivel === 'Administrador') {
        if (CFG.adminNome && perfil.nome !== CFG.adminNome) {
            // Atualiza o nome no perfil para refletir a configuração
            await supabaseClient
                .from('perfis')
                .update({ nome: CFG.adminNome })
                .eq('id', data.user.id);
            perfil.nome = CFG.adminNome;
        }
    }

    return {
        nome: perfil.nome,
        email: data.user.email,
        nivel: perfil.nivel,
        permissoes: perfil.permissoes
    };
}

async function apiLogout() {
    try { await supabaseClient.auth.signOut(); } catch (e) {}
    sessao = null;
}

// ---------- Alterar senha ----------
async function apiAlterarSenha(novaSenha) {
    const { error } = await supabaseClient.auth.updateUser({ password: novaSenha });
    if (error) throw error;
}

// ---------- Configurações do sistema ----------
async function apiCarregarConfig() {
    const { data, error } = await supabaseClient
        .from('config')
        .select('*')
        .eq('id', 1)
        .single();
    if (error) {
        console.warn('Erro ao carregar configurações:', error);
        return null;
    }
    return {
        empresaNome: data.empresa_nome,
        email: data.email,
        telefoneSuporte: data.telefone_suporte,
        adminNome: data.admin_nome,
        adminEmail: data.admin_email,
        logoUrl: data.logo_url
    };
}

async function apiSalvarConfig(cfg) {
    const dadosSnake = {
        empresa_nome: cfg.empresaNome,
        email: cfg.email,
        telefone_suporte: cfg.telefoneSuporte,
        admin_nome: cfg.adminNome,
        admin_email: cfg.adminEmail,
        logo_url: cfg.logoUrl
    };
    const { error } = await supabaseClient
        .from('config')
        .update(dadosSnake)
        .eq('id', 1);
    if (error) throw error;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    const { data, error } = await supabaseClient
        .from('eventos')
        .select('*')
        .order('id', { ascending: false });
    if (error) throw error;
    return data.map(e => {
        const evento = toCamelCase(e);
        if (typeof evento.patrocinadoresLogos === 'string') {
            try { evento.patrocinadoresLogos = JSON.parse(evento.patrocinadoresLogos); } catch (_) { evento.patrocinadoresLogos = []; }
        }
        evento.visitantes = [];
        return evento;
    });
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const dadosSnake = toSnakeCase(evento);
    const { data, error } = await supabaseClient
        .from('eventos')
        .insert([dadosSnake])
        .select('*')
        .single();
    if (error) throw error;
    return toCamelCase(data);
}

async function apiAtualizarEvento(id, evento) {
    const { error } = await supabaseClient
        .from('eventos')
        .update(toSnakeCase(evento))
        .eq('id', id);
    if (error) throw error;
}

async function apiExcluirEvento(id) {
    const { error } = await supabaseClient.from('eventos').delete().eq('id', id);
    if (error) throw error;
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    const { data: evento } = await supabaseClient
        .from('eventos')
        .select('id')
        .eq('token', token)
        .single();
    if (!evento) throw new Error('Evento não encontrado');
    dados.evento_id = parseInt(evento.id, 10);
    const { error } = await supabaseClient
        .from('visitantes')
        .insert([toSnakeCase(dados)]);
    if (error) throw error;
    await atualizarTotalVisitantes(evento.id);
}

async function apiListarVisitantes(eventoId) {
    const { data, error } = await supabaseClient
        .from('visitantes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('id', { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase);
}

async function atualizarTotalVisitantes(eventoId) {
    try {
        const { count, error } = await supabaseClient
            .from('visitantes')
            .select('*', { count: 'exact', head: true })
            .eq('evento_id', eventoId);
        if (!error && count !== null) {
            await supabaseClient
                .from('eventos')
                .update({ totalVisitantes: count })
                .eq('id', eventoId);
        }
    } catch (e) {
        console.warn('Não foi possível atualizar totalVisitantes:', e);
    }
}

// ---------- Helpers ----------
function toSnakeCase(obj) {
    const novo = {};
    for (const chave in obj) {
        if (obj[chave] === undefined) continue;
        let snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
        let valor = obj[chave];
        if (Array.isArray(valor)) {
            valor = JSON.stringify(valor);
        }
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
