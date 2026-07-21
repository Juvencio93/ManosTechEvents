// js/app.js - Navegação e inicialização

function showPage(nome) {
    // Fecha modais abertos
    fecharModal('eventoModal');
    fecharModal('funcionarioModal');
    fecharModal('qrModal');
    fecharModal('portalModal');
    
    // Atualiza item ativo no menu
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) {
            a.classList.add('active');
        }
    });
    
    // Exibe/esconde seletor de eventos (apenas na página dashboard)
    const eventoSelector = document.getElementById('eventoSelectorDashboard');
    if (eventoSelector) eventoSelector.style.display = (nome === 'dashboard') ? 'flex' : 'none';
    
    // Carrega o conteúdo da página
    fetch(`pages/${nome}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Página não encontrada: ' + nome);
            return response.text();
        })
        .then(html => {
            const main = document.getElementById('main-content');
            if (main) {
                main.innerHTML = html;
            } else {
                console.error('Elemento #main-content não encontrado no DOM');
                return;
            }
            
            // Pós‑carregamento específico por página
            if (nome === 'dashboard') {
                preencherSelectsEventos();
                if (eventoSelecionadoId) {
                    const select = document.getElementById('eventoSelect');
                    if (select) {
                        select.value = eventoSelecionadoId;
                        selecionarEvento();
                    }
                }
            } else if (nome === 'financeiro') {
                preencherSelectsEventos();
                atualizarResumoFinanceiroGeral();
            } else if (nome === 'eventos') {
                renderizarEventos();
            } else if (nome === 'funcionarios') {
                renderizarFuncionarios();
            } else if (nome === 'relatorios') {
                preencherSelectsEventos();
            } else if (nome === 'configuracao') {
                atualizarInterfaceUsuario();
            }
        })
        .catch(error => {
            console.error(error);
            const main = document.getElementById('main-content');
            if (main) main.innerHTML = '<p style="color:red;padding:40px;">Erro ao carregar a página. Verifique o console.</p>';
        });
    
    closeMenu();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // A função entrarSistema original será chamada após login, e ela NÃO chama showPage.
    // Vamos sobrescrever entrarSistema APENAS se ela existir, para incluir o showPage.
    const entrarSistemaOriginal = window.entrarSistema;
    if (entrarSistemaOriginal) {
        window.entrarSistema = function() {
            entrarSistemaOriginal();
            showPage('inicio'); // carrega a página inicial após login
        };
    }
    
    // Listeners globais
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fazerLogin();
    });

    document.getElementById('confirmBtnSim').addEventListener('click', () => {
        fecharModal('confirmModal');
        if (typeof callbackConfirmacao === 'function') callbackConfirmacao();
        callbackConfirmacao = null;
    });
    document.getElementById('confirmBtnNao').addEventListener('click', () => {
        fecharModal('confirmModal');
        callbackConfirmacao = null;
    });
});
