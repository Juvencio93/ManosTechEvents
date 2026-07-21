// Inicialização e navegação
function showPage(nome) {
    fecharModal('eventoModal');
    fecharModal('funcionarioModal');
    fecharModal('qrModal');
    fecharModal('portalModal');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pagina = document.getElementById('page-' + nome);
    if (pagina) pagina.classList.add('active');
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.sidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) a.classList.add('active');
    });
    const eventoSelector = document.getElementById('eventoSelectorDashboard');
    if (eventoSelector) eventoSelector.style.display = (nome === 'dashboard') ? 'flex' : 'none';
    if (nome === 'financeiro') atualizarResumoFinanceiroGeral();
    if (nome === 'configuracao') atualizarInterfaceUsuario();
    if (nome === 'relatorios') preencherSelectsEventos();
    closeMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterfaceUsuario();
    preencherSelectsEventos();
    renderizarEventos();
    renderizarFuncionarios();
    atualizarResumoFinanceiroGeral();
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
