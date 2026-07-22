// api.js – Supabase (com serialização de arrays)
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
    return { nome: perfil.nome, email: data.user.email, nivel: perfil.nivel, permissoes: perfil.permissoes };
}

async function apiLogout() {
    try { await supabaseClient.auth.signOut(); } catch (e) {}
    sessao = null;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    const { data, error } = await supabaseClient
        .from('eventos')
        .select('*')
        .order('id', { ascending: false });
    if (error) throw error;
    return data.map(e => {
        // Converte campos snake_case para camelCase e desserializa logos
        const evento = toCamelCase(e);
        if (typeof evento.patrocinadoresLogos === 'string') {
            try { evento.patrocinadoresLogos = JSON.parse(evento.patrocinadoresLogos); } catch (_) { evento.patrocinadoresLogos = []; }
        }
        evento.visitantes = [];
        evento.totalVisitantes = 0;
        return evento;
    });
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const dadosSnake = toSnakeCase(evento);
    console.log('📤 Enviando ao Supabase (snake_case):', JSON.stringify(dadosSnake, null, 2));

    const { data, error } = await supabaseClient
        .from('eventos')
        .insert([dadosSnake])
        .select('*')
        .single();

    console.log('📥 Resposta do Supabase:', { data, error });
    if (error) throw error;
    const result = toCamelCase(data);
    if (typeof result.patrocinadoresLogos === 'string') {
        try { result.patrocinadoresLogos = JSON.parse(result.patrocinadoresLogos); } catch (_) { result.patrocinadoresLogos = []; }
    }
    return result;
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
    await supabaseClient.from('visitantes').insert([toSnakeCase(dados)]);
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

// ---------- Helpers ----------
function toSnakeCase(obj) {
    const novo = {};
    for (const chave in obj) {
        if (obj[chave] === undefined) continue;
        let snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
        let valor = obj[chave];
        // Se for array, serializa como JSON string (para coluna text)
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
