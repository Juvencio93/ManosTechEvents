// api.js – Comunicação com Supabase
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let sessao = null;

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
    if (error) throw new Error(error.message);
    sessao = data.user;
    
    const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();
    
    if (perfilError) throw new Error('Perfil não encontrado: ' + perfilError.message);
    
    return {
        nome: perfil.nome,
        email: data.user.email,
        nivel: perfil.nivel,
        permissoes: perfil.permissoes
    };
}

async function apiLogout() {
    await supabase.auth.signOut();
    sessao = null;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('id', { ascending: false });
    if (error) throw error;
    return data.map(e => ({ ...e, visitantes: [], totalVisitantes: 0 }));
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function apiAtualizarEvento(id, evento) {
    const { error } = await supabase
        .from('eventos')
        .update(evento)
        .eq('id', id);
    if (error) throw error;
}

async function apiExcluirEvento(id) {
    const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('id')
        .eq('token', token)
        .single();
    if (eventoError) throw new Error('Evento não encontrado');
    
    dados.evento_id = evento.id;
    const { error } = await supabase
        .from('visitantes')
        .insert([dados]);
    if (error) throw error;
}

async function apiListarVisitantes(eventoId) {
    const { data, error } = await supabase
        .from('visitantes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('id', { ascending: false });
    if (error) throw error;
    return data;
}
