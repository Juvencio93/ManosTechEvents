// api.js – Comunicação exclusiva com Supabase (sem localStorage)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase iniciado:', supabaseClient);
} catch (e) {
    console.error('Falha ao iniciar Supabase:', e);
}

let sessao = null;

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, senha });
    if (error) throw new Error(error.message);

    sessao = data.user;
    const { data: perfil, error: perfilError } = await supabaseClient
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (perfilError) {
        console.warn('Perfil não encontrado. Usando fallback.');
        throw new Error('Perfil não encontrado');
    }
    console.log('Perfil:', perfil);
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

// ---------- Eventos ----------
async function apiListarEventos() {
    const { data, error } = await supabaseClient
        .from('eventos')
        .select('*')
        .order('id', { ascending: false });
    console.log('===== EVENTOS =====');
    console.log('Data:', data);
    console.log('Error:', error);
    if (error) throw error;
    return data.map(e => ({ ...e, visitantes: [], totalVisitantes: 0 }));
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const { data, error } = await supabaseClient
        .from('eventos')
        .insert([toSnakeCase(evento)])
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
    const { error } = await supabaseClient
        .from('eventos')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    const { data: evento, error: eventoError } = await supabaseClient
        .from('eventos')
        .select('id')
        .eq('token', token)
        .single();
    if (eventoError) throw new Error('Evento não encontrado');

    dados.evento_id = parseInt(evento.id, 10);
    console.log('DADOS RECEBIDOS:');
    console.log(dados);
    const dadosSnake = toSnakeCase(dados);
    console.log('DADOS ENVIADOS AO SUPABASE:');
    console.log(JSON.stringify(dadosSnake, null, 2));
    const { error } = await supabaseClient
        .from('visitantes')
        .insert([dadosSnake]);
    console.log('RESPOSTA DO SUPABASE:', error);
    if (error) throw error;
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
        const snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
        novo[snake] = obj[chave];
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
