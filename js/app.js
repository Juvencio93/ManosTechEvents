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

            // Oculta card Financeiro se usuário não tiver permissão
            if (nome === 'inicio') {
                const cardFinanceiro = document.getElementById('cardFinanceiro');
                if (cardFinanceiro) {
                    cardFinanceiro.style.display = (usuarioLogado?.permissoes?.f) ? 'block' : 'none';
                }
            }

            // Ações pós‑carregamento (com verificação de existência das funções)
            if (nome === 'dashboard') {
                if (typeof preencherSelectsEventos === 'function') preencherSelectsEventos();
                if (eventoSelecionadoId) {
                    const select = document.getElementById('eventoSelect');
                    if (select) {
                        select.value = eventoSelecionadoId;
                        if (typeof selecionarEvento === 'function') selecionarEvento();
                    }
                }
            } else if (nome === 'financeiro') {
                if (typeof preencherSelectsEventos === 'function') preencherSelectsEventos();
                if (typeof atualizarResumoFinanceiroGeral === 'function') atualizarResumoFinanceiroGeral();
            } else if (nome === 'eventos') {
                if (typeof renderizarEventos === 'function') renderizarEventos();
            } else if (nome === 'funcionarios') {
                if (typeof renderizarFuncionarios === 'function') renderizarFuncionarios();
            } else if (nome === 'relatorios') {
                if (typeof preencherSelectsEventos === 'function') preencherSelectsEventos();
            } else if (nome === 'configuracao') {
                if (typeof preencherCamposConfiguracao === 'function') preencherCamposConfiguracao();
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar a página.</p>';
        });

    closeMenu();
}

document.addEventListener('DOMContentLoaded', () => {
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
