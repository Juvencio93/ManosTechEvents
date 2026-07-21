// api.js – Comunicação com o backend
// URL base da API (altere para seu domínio quando publicar)
const API_BASE = 'https://api.manostech.com.br/api';

let sessao = null; // guarda dados do usuário logado e token

async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessao && sessao.token) {
        headers['Authorization'] = `Bearer ${sessao.token}`;
    }
    try {
        const response = await fetch(API_BASE + url, { ...options, headers });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro na requisição');
        }
        return response.json();
    } catch (e) {
        console.warn('API indisponível, usando localStorage:', e.message);
        throw e; // será capturado por quem chamou
    }
}

// Autenticação
async function apiLogin(email, senha) {
    // Para testes, se a API falhar, usa o localStorage
    try {
        const data = await apiFetch('/login.php', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        sessao = data.usuario;
        return data.usuario;
    } catch (e) {
        // Fallback para localStorage
        if (email === CFG.adminEmail && senha === CFG.adminSenha) {
            sessao = {
                nome: CFG.adminNome,
                nivel: 'Administrador',
                permissoes: { v: true, d: true, vi: true, e: true, x: true, f: true, g: true, c: true, r: true }
            };
            return sessao;
        }
        const func = FN.find(f => f.email === email && (f.senha || '123456') === senha);
        if (func) {
            sessao = func;
            return sessao;
        }
        throw new Error('Credenciais inválidas');
    }
}

// Eventos
async function apiListarEventos() {
    try {
        const resp = await apiFetch('/eventos.php');
        return resp.eventos;
    } catch (e) {
        // Fallback para localStorage
        return EV;
    }
}

async function apiCriarEvento(evento) {
    try {
        const resp = await apiFetch('/eventos.php', {
            method: 'POST',
            body: JSON.stringify(evento)
        });
        return resp; // { id, token }
    } catch (e) {
        // Fallback: salva no array local
        const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
        const novo = { ...evento, id: novoId, token: 'local_' + novoId, visitantes: [] };
        EV.push(novo);
        salvarDados();
        return { id: novoId, token: novo.token };
    }
}

async function apiAtualizarEvento(id, evento) {
    try {
        await apiFetch(`/eventos.php?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(evento)
        });
    } catch (e) {
        const ev = EV.find(e => e.id === id);
        Object.assign(ev, evento);
        salvarDados();
    }
}

async function apiExcluirEvento(id) {
    try {
        await apiFetch(`/eventos.php?id=${id}`, { method: 'DELETE' });
    } catch (e) {
        EV = EV.filter(e => e.id !== id);
        salvarDados();
    }
}

// Visitantes
async function apiRegistrarVisitante(token, dados) {
    try {
        return await apiFetch('/visitantes.php', {
            method: 'POST',
            body: JSON.stringify({ token, ...dados })
        });
    } catch (e) {
        // Fallback: adiciona no array local
        const evento = EV.find(ev => ev.token === token);
        if (evento) {
            evento.visitantes.unshift(dados);
            evento.totalVisitantes = evento.visitantes.length;
            salvarDados();
        }
    }
}

async function apiListarVisitantes(eventoId) {
    try {
        const resp = await apiFetch(`/visitantes.php?evento_id=${eventoId}`);
        return resp.visitantes;
    } catch (e) {
        const evento = EV.find(ev => ev.id === eventoId);
        return evento ? evento.visitantes : [];
    }
}
