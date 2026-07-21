// api.js – Comunicação com Supabase (campos convertidos para snake_case)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.warn('Supabase não disponível.');
}

let sessao = null;

// ---------- Conversão camelCase ↔ snake_case ----------
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

// ---------- Autenticação ----------
async function apiLogin(email, senha) {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, senha });
            if (error) {
                console.error('❌ Erro de autenticação:', error.message, error.status);
                throw new Error(error.message);
            }
            sessao = data.user;
            const { data: perfil } = await supabaseClient
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
        } catch (e) {
            console.warn('Fallback local usado para login.');
        }
    }

    // Fallback localStorage
    if (email === CFG.adminEmail && senha === CFG.adminSenha) {
        sessao = { email };
        return {
            nome: CFG.adminNome,
            email: CFG.adminEmail,
            nivel: 'Administrador',
            permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
        };
    }
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
                // Converte de snake_case para camelCase antes de retornar
                return data.map(e => ({ ...toCamelCase(e), visitantes: [], totalVisitantes: 0 }));
            } else {
                console.error('Erro ao listar eventos:', error);
            }
        } catch (e) {}
    }
    return EV;
}

async function apiCriarEvento(evento) {
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    if (supabaseClient) {
        try {
            // Converte para snake_case antes de enviar
            const dados = toSnakeCase(evento);
            const { data, error } = await supabaseClient
                .from('eventos')
                .insert([dados])
                .select()
                .single();
            if (!error) {
                return toCamelCase(data);
            } else {
                console.error('Erro ao criar evento:', error);
            }
        } catch (e) {}
    }

    // Fallback localStorage
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
            const { error } = await supabaseClient
                .from('eventos')
                .update(dados)
                .eq('id', id);
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
            const { error } = await supabaseClient
                .from('eventos')
                .delete()
                .eq('id', id);
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
                await supabaseClient.from('visitantes').insert([dadosSnake]);
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
