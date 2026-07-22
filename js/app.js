// app.js – Inicialização e navegação (não sobrescreve entrarSistema)
function showPage(nome) {
    fecharModal('eventoModal');
    fecharModal('funcionarioModal');
    fecharModal('qrModal');
    fecharModal('portalModal');
    
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) {
            a.classList.add('active');
        }
    });
    
    const eventoSelector = document.getElementById('eventoSelectorDashboard');
    if (eventoSelector) eventoSelector.style.display = (nome === 'dashboard') ? 'flex' : 'none';
    
    fetch(`pages/${nome}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Página não encontrada');
            return response.text();
        })
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
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
                preencherCamposConfiguracao();
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar a página.</p>';
        });
    
    closeMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    // Apenas listeners globais, sem modificar entrarSistema
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
