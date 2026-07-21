// api.js – Comunicação com Supabase (com fallback para localStorage)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

// Inicializa cliente apenas se a biblioteca estiver disponível
let supabase = null;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.warn('Supabase não pôde ser inicializado, usando localStorage.');
}

let sessao = null;

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    // Tenta Supabase primeiro
    if (supabase) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, senha });
            if (!error) {
                sessao = data.user;
                const { data: perfil } = await supabase
                    .from('perfis')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                if (perfil) {
                    return {
                        nome: perfil.nome,
                        email: data.user.email,
                        nivel: perfil.nivel,
                        permissoes: perfil.permissoes
                    };
                }
            }
        } catch (e) {
            console.warn('Erro na API, usando fallback local:', e.message);
        }
    }

    // Fallback localStorage
    if (email === CFG.adminEmail && senha === CFG.adminSenha) {
        sessao = { email: CFG.adminEmail };
        return {
            nome: CFG.adminNome,
            email: CFG.adminEmail,
            nivel: 'Administrador',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        };
    }
    const func = FN.find(f => f.email === email && (f.senha || '123456') === senha);
    if (func) {
        sessao = { email: func.email };
        return func;
    }
    throw new Error('Credenciais inválidas');
}

async function apiLogout() {
    try { if (supabase) await supabase.auth.signOut(); } catch (e) {}
    sessao = null;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('eventos')
                .select('*')
                .order('id', { ascending: false });
            if (!error) return data.map(e => ({ ...e, visitantes: [], totalVisitantes: 0 }));
        } catch (e) {}
    }
    // Fallback: retorna eventos do localStorage
    return EV;
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('eventos')
                .insert([evento])
                .select()
                .single();
            if (!error) return data;
        } catch (e) {}
    }
    // Fallback localStorage
    const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
    const novo = { ...evento, id: novoId, token: evento.token, visitantes: [] };
    EV.push(novo);
    salvarDados();
    return novo;
}

async function apiAtualizarEvento(id, evento) {
    if (supabase) {
        try {
            const { error } = await supabase.from('eventos').update(evento).eq('id', id);
            if (!error) return;
        } catch (e) {}
    }
    const ev = EV.find(e => e.id === id);
    if (ev) Object.assign(ev, evento);
    salvarDados();
}

async function apiExcluirEvento(id) {
    if (supabase) {
        try {
            const { error } = await supabase.from('eventos').delete().eq('id', id);
            if (!error) return;
        } catch (e) {}
    }
    EV = EV.filter(e => e.id !== id);
    salvarDados();
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    if (supabase) {
        try {
            const { data: evento } = await supabase
                .from('eventos')
                .select('id')
                .eq('token', token)
                .single();
            if (evento) {
                dados.evento_id = evento.id;
                await supabase.from('visitantes').insert([dados]);
                return;
            }
        } catch (e) {}
    }
    const eventoLocal = EV.find(ev => ev.token === token);
    if (eventoLocal) {
        eventoLocal.visitantes.unshift(dados);
        eventoLocal.totalVisitantes = eventoLocal.visitantes.length;
        salvarDados();
    }
}

async function apiListarVisitantes(eventoId) {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('visitantes')
                .select('*')
                .eq('evento_id', eventoId)
                .order('id', { ascending: false });
            if (!error) return data;
        } catch (e) {}
    }
    const evento = EV.find(ev => ev.id === eventoId);
    return evento ? evento.visitantes : [];
}
