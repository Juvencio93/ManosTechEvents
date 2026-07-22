// api.js – Comunicação exclusiva com Supabase (senha → password corrigido)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

// Garante uma única instância global do cliente Supabase
const supabaseClient = window.__SUPABASE__ || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.__SUPABASE__ = supabaseClient;

let sessao = null;

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    // CORREÇÃO: envia a propriedade 'password' (não 'senha')
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
    });
    if (error) {
        console.error('Falha na autenticação:', error.message);
        throw new Error(error.message);
    }
    sessao = data.user;
    const { data: perfil, error: perfilError } = await supabaseClient
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();
    if (perfilError) {
        console.error('Perfil não encontrado:', perfilError.message);
        throw new Error('Perfil não encontrado');
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

// ---------- Eventos ----------
async function apiListarEventos() {
    const { data, error } = await supabaseClient
        .from('eventos')
        .select('*')
        .order('id', { ascending: false });
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
    const { error } = await supabaseClient
        .from('visitantes')
        .insert([toSnakeCase(dados)]);
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
