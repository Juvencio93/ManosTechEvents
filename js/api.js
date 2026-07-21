// api.js – Comunicação com Supabase (vFinal)
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

// ⚠️ Usa a instância global 'supabase' já criada pela biblioteca (evita múltiplas instâncias)
// Mas se não existir, cria uma nova
let supabaseClient = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient; // armazena para reuso

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
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, senha });
        if (error) {
            console.error('Erro de autenticação:', error.message);
            throw new Error(error.message);
        }
        sessao = data.user;
        
        const { data: perfil, error: perfilError } = await supabaseClient
            .from('perfis')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (perfilError) throw new Error('Perfil não encontrado');
        
        return {
            nome: perfil.nome,
            email: data.user.email,
            nivel: perfil.nivel,
            permissoes: perfil.permissoes
        };
    } catch (e) {
        console.warn('Fallback localStorage:', e.message);
        // Fallback localStorage (apenas se Supabase falhar)
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
}

async function apiLogout() {
    try { await supabaseClient.auth.signOut(); } catch (e) {}
    sessao = null;
}

// ---------- Eventos ----------
async function apiListarEventos() {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            console.error('Erro ao listar eventos:', error);
            throw error;
        }
        
        // Converte de snake_case para camelCase
        return data.map(e => ({
            ...toCamelCase(e),
            visitantes: [],
            totalVisitantes: 0
        }));
    } catch (e) {
        console.warn('Usando localStorage para eventos');
        return EV;
    }
}

async function apiCriarEvento(evento) {
    // Gera token único
    evento.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    
    try {
        // Converte para snake_case antes de enviar
        const dados = toSnakeCase(evento);
        const { data, error } = await supabaseClient
            .from('eventos')
            .insert([dados])
            .select('*')
            .single();
        
        if (error) {
            console.error('Erro ao criar evento:', error);
            throw error;
        }
        
        return toCamelCase(data);
    } catch (e) {
        console.warn('Salvando evento localmente');
        const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
        const novo = { ...evento, id: novoId, visitantes: [] };
        EV.push(novo);
        salvarDados();
        return novo;
    }
}

async function apiAtualizarEvento(id, evento) {
    try {
        const dados = toSnakeCase(evento);
        const { error } = await supabaseClient
            .from('eventos')
            .update(dados)
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao atualizar evento:', error);
            throw error;
        }
    } catch (e) {
        console.warn('Atualizando evento localmente');
        const ev = EV.find(e => e.id === id);
        if (ev) Object.assign(ev, evento);
        salvarDados();
    }
}

async function apiExcluirEvento(id) {
    try {
        const { error } = await supabaseClient
            .from('eventos')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao excluir evento:', error);
            throw error;
        }
    } catch (e) {
        console.warn('Excluindo evento localmente');
        EV = EV.filter(e => e.id !== id);
        salvarDados();
    }
}

// ---------- Visitantes ----------
async function apiRegistrarVisitante(token, dados) {
    try {
        // Busca o evento pelo token
        const { data: evento, error: eventoError } = await supabaseClient
            .from('eventos')
            .select('id')
            .eq('token', token)
            .single();
        
        if (eventoError) throw new Error('Evento não encontrado');
        
        dados.evento_id = evento.id;
        const dadosSnake = toSnakeCase(dados);
        
        const { error } = await supabaseClient
            .from('visitantes')
            .insert([dadosSnake]);
        
        if (error) {
            console.error('Erro ao registrar visitante:', error);
            throw error;
        }
    } catch (e) {
        console.warn('Registrando visitante localmente');
        const eventoLocal = EV.find(ev => ev.token === token);
        if (eventoLocal) {
            eventoLocal.visitantes.unshift(dados);
            eventoLocal.totalVisitantes = eventoLocal.visitantes.length;
            salvarDados();
        }
    }
}

async function apiListarVisitantes(eventoId) {
    try {
        const { data, error } = await supabaseClient
            .from('visitantes')
            .select('*')
            .eq('evento_id', eventoId)
            .order('id', { ascending: false });
        
        if (error) {
            console.error('Erro ao listar visitantes:', error);
            throw error;
        }
        
        return data.map(toCamelCase);
    } catch (e) {
        console.warn('Usando localStorage para visitantes');
        const evento = EV.find(ev => ev.id === eventoId);
        return evento ? evento.visitantes : [];
    }
}
