// api.js – Comunicação com o backend
const API_BASE = 'https://api.manostech.com.br/api';

let sessao = null;
let csrfToken = null;

async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessao && sessao.token) {
        headers['Authorization'] = `Bearer ${sessao.token}`;
    }
    if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
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
        throw e;
    }
}

async function apiLogin(email, senha) {
    try {
        const data = await apiFetch('/login.php', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        sessao = data.usuario;
        csrfToken = data.csrf_token;
        return data.usuario;
    } catch (e) {
        // Fallback localStorage
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

async function apiListarEventos() {
    try {
        const resp = await apiFetch('/eventos.php');
        return resp.eventos;
    } catch (e) {
        return EV;
    }
}

async function apiCriarEvento(evento) {
    try {
        const resp = await apiFetch('/eventos.php', {
            method: 'POST',
            body: JSON.stringify(evento)
        });
        return resp;
    } catch (e) {
        // no fallback de apiCriarEvento
const novoId = Math.max(...EV.map(e => e.id), 0) + 1;
const token = 'local_' + Math.random().toString(36).substring(2, 10) + novoId;
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
        if (ev) {
            Object.assign(ev, evento);
            salvarDados();
        }
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

async function apiRegistrarVisitante(token, dados) {
    try {
        return await apiFetch('/visitantes.php', {
            method: 'POST',
            body: JSON.stringify({ token, ...dados })
        });
    } catch (e) {
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
