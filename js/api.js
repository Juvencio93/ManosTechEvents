// api.js – Comunicação com Supabase (com fallback localStorage simples e funcional)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

let supabaseClient = null;

try {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
    console.log("Supabase iniciado:", supabaseClient);

} catch (e) {
    console.error("Erro ao iniciar Supabase:", e);
}

let sessao = null;

// ---------- Conversão camelCase ↔ snake_case ----------
function toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const novo = {};
    for (const chave in obj) {
        const snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
        novo[snake] = obj[chave];
    }
    return novo;
}

function toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const novo = {};
    for (const chave in obj) {
        const camel = chave.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());
        novo[camel] = obj[chave];
    }
    return novo;
}

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    // Tenta Supabase primeiro
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
});
            if (error) {
                console.error('Erro de autenticação Supabase:', error.message);
                throw new Error(error.message);
            }
            sessao = data.user;
           const {
    data: perfil,
    error: perfilError
} = await supabaseClient
    .from('perfis')
    .select('*')
    .eq('id', data.user.id)
    .single();

console.log("Perfil:", perfil);
console.log("Erro Perfil:", perfilError);
            if (perfil) {
                return {
                    nome: perfil.nome,
                    email: data.user.email,
                    nivel: perfil.nivel,
                    permissoes: perfil.permissoes
                };
            }
        } catch (e) {
            console.warn('Fallback localStorage ativado (login):', e.message);
        }
    }

    // Fallback localStorage – compara diretamente com os dados iniciais do config.js
    if (email === 'admin@manostech.com.br' && senha === '123456') {
        sessao = { email };
        return {
            nome: CFG.adminNome,
            email: 'admin@manostech.com.br',
            nivel: 'Administrador',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        };
    }
    // Se houver funcionários cadastrados localmente
    const func = FN.find(f => f.email === email && (f.senha || '123456') === senha);
    if (func) {
        sessao = { email };
        return func;
    }
    throw new Error('Credenciais inválidas');
}

async function apiLogout() {
    try { if (supabaseClient) await supabaseClient.auth.signOut(); } catch (e) {}
    sessao = null;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('eventos')
                .select('*')
                .order('id', { ascending: false });
            if (!error) {
                return data.map(e => ({ ...toCamelCase(e), visitantes: [], totalVisitantes: 0 }));
            }
        } catch (e) {}
    }
    return EV;
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    if (supabaseClient) {
        try {
            const dados = toSnakeCase(evento);
            const { data, error } = await supabaseClient
                .from('eventos')
                .insert([dados])
                .select('*')
                .single();
            if (!error) return toCamelCase(data);
        } catch (e) {}
    }
    const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
    const novo = { ...evento, id: novoId, visitantes: [] };
    EV.push(novo);
    salvarDados();
    return novo;
}

async function apiAtualizarEvento(id, evento) {
    if (supabaseClient) {
        try {
            const dados = toSnakeCase(evento);
            const { error } = await supabaseClient.from('eventos').update(dados).eq('id', id);
            if (!error) return;
        } catch (e) {}
    }
    const ev = EV.find(e => e.id === id);
    if (ev) Object.assign(ev, evento);
    salvarDados();
}

async function apiExcluirEvento(id) {
    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from('eventos').delete().eq('id', id);
            if (!error) return;
        } catch (e) {}
    }
    EV = EV.filter(e => e.id !== id);
    salvarDados();
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    if (supabaseClient) {
        try {
            const { data: evento } = await supabaseClient
                .from('eventos')
                .select('id')
                .eq('token', token)
                .single();
            if (evento) {
                dados.evento_id = evento.id;
                const dadosSnake = toSnakeCase(dados);
                const { error } = await supabaseClient.from('visitantes').insert([dadosSnake]);
                if (!error) return;
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
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('visitantes')
                .select('*')
                .eq('evento_id', eventoId)
                .order('id', { ascending: false });
            if (!error) return data.map(toCamelCase);
        } catch (e) {}
    }
    const evento = EV.find(ev => ev.id === eventoId);
    return evento ? evento.visitantes : [];
}
