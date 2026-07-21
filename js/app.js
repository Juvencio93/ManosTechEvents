// js/app.js - Inicialização e navegação
function showPage(nome) {
    fecharModal('eventoModal');
    fecharModal('funcionarioModal');
    fecharModal('qrModal');
    fecharModal('portalModal');
    
    // Atualiza menu ativo
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) {
            a.classList.add('active');
        }
    });
    
    // Mostra/esconde seletor de evento no dashboard
    const eventoSelector = document.getElementById('eventoSelectorDashboard');
    if (eventoSelector) eventoSelector.style.display = (nome === 'dashboard') ? 'flex' : 'none';
    
    // Carrega a página solicitada via fetch
    fetch(`pages/${nome}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Página não encontrada');
            return response.text();
        })
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
            
            // Dispara ações específicas após carregar
            if (nome === 'dashboard') {
                preencherSelectsEventos();
                if (eventoSelecionadoId) {
                    document.getElementById('eventoSelect').value = eventoSelecionadoId;
                    selecionarEvento();
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
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar a página.</p>';
        });
    
    closeMenu();
}

// Atualização da entrada no sistema para carregar a página inicial
function entrarSistema() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('menuToggle').style.display = 'flex';
    atualizarInterfaceUsuario();
    aplicarPermissoes();
    showPage('inicio'); // carrega a página inicial dinamicamente
    salvarDados();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceUsuario();
    aplicarPermissoes();

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
