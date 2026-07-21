// Configuração da URL base da API
const API_BASE = 'https://api.manostech.com.br/api'; // Ajuste para seu domínio

let sessao = null; // dados do usuário logado

async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessao && sessao.token) {
        headers['Authorization'] = `Bearer ${sessao.token}`;
    }
    const response = await fetch(API_BASE + url, { ...options, headers });
    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro na requisição');
    }
    return response.json();
}

// --- Autenticação ---
async function apiLogin(email, senha) {
    const data = await apiFetch('/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
    sessao = data.usuario;
    return data.usuario;
}

async function apiLogout() {
    sessao = null;
}

// --- Eventos ---
async function apiListarEventos() {
    const resp = await apiFetch('/eventos.php');
    return resp.eventos;
}

async function apiCriarEvento(evento) {
    const resp = await apiFetch('/eventos.php', {
        method: 'POST',
        body: JSON.stringify(evento)
    });
    return resp; // { id, token }
}

async function apiAtualizarEvento(id, evento) {
    return apiFetch(`/eventos.php?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(evento)
    });
}

async function apiExcluirEvento(id) {
    return apiFetch(`/eventos.php?id=${id}`, { method: 'DELETE' });
}

// --- Visitantes ---
async function apiRegistrarVisitante(tokenEvento, dados) {
    return apiFetch('/visitantes.php', {
        method: 'POST',
        body: JSON.stringify({ token: tokenEvento, ...dados })
    });
}

async function apiListarVisitantes(eventoId) {
    const resp = await apiFetch(`/visitantes.php?evento_id=${eventoId}`);
    return resp.visitantes;
}
