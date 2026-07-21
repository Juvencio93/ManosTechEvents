// Financeiro
function atualizarResumoFinanceiroGeral() {
    const elTotalCobrado = document.getElementById('resumoTotalCobrado');
    if (!elTotalCobrado) return; // elemento só existe na página financeiro
    const elTotalCusto = document.getElementById('resumoTotalCusto');
    const elLucroTotal = document.getElementById('resumoLucroTotal');

    const totalCobrado = EV.reduce((acc, e) => acc + (e.valorCobrado || 0), 0);
    const totalCusto = EV.reduce((acc, e) => acc + (e.custoOperacional || 0), 0);
    const lucro = totalCobrado - totalCusto;

    elTotalCobrado.textContent = formatarMoeda(totalCobrado);
    elTotalCusto.textContent = formatarMoeda(totalCusto);
    elLucroTotal.textContent = formatarMoeda(lucro);
    elLucroTotal.style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
}

function selecionarEventoFinanceiro() {
    const id = parseInt(document.getElementById('eventoSelectFinanceiro').value);
    const content = document.getElementById('financeiroContent');
    const empty = document.getElementById('financeiroEmpty');
    if (!id) {
        if (content) content.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    const evento = EV.find(e => e.id === id);
    if (!evento) return;
    if (content) content.style.display = 'block';
    if (empty) empty.style.display = 'none';

    const p = usuarioLogado?.permissoes || {};
    const semPermissao = !p.f;

    const valorCobrado = evento.valorCobrado || 0;
    const custo = evento.custoOperacional || 0;
    const pago = evento.valorPago || 0;
    const lucro = valorCobrado - custo;
    const margem = valorCobrado > 0 ? (lucro / valorCobrado) * 100 : 0;

    if (semPermissao) {
        ['finValorCobrado','finCustoOperacional','finLucro','finMargem','finValorTotal','finValorPago','finValorPendente'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'R$ ••••';
        });
        const statusEl = document.getElementById('finStatusPagamento');
        if (statusEl) statusEl.innerHTML = '<span class="badge badge-secondary">🔒 Sem permissão</span>';
        const tabela = document.getElementById('finParcelasTable');
        if (tabela) tabela.innerHTML = '<tr><td colspan="4">🔒</td></tr>';
        return;
    }

    const elValorCobrado = document.getElementById('finValorCobrado');
    if (elValorCobrado) elValorCobrado.textContent = formatarMoeda(valorCobrado);
    const elCusto = document.getElementById('finCustoOperacional');
    if (elCusto) {
        elCusto.textContent = formatarMoeda(custo);
        elCusto.style.color = 'var(--red)';
    }
    const elLucro = document.getElementById('finLucro');
    if (elLucro) {
        elLucro.textContent = formatarMoeda(lucro);
        elLucro.style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
    }
    const elMargem = document.getElementById('finMargem');
    if (elMargem) elMargem.textContent = margem.toFixed(1).replace('.', ',') + '%';

    const sp = statusPagamento(evento);
    const statusEl = document.getElementById('finStatusPagamento');
    if (statusEl) statusEl.innerHTML = `<span class="badge ${sp.classe}" style="font-size:14px;padding:8px 16px;">${sp.texto}</span>`;

    const elTotal = document.getElementById('finValorTotal');
    if (elTotal) elTotal.textContent = formatarMoeda(valorCobrado);
    const elPago = document.getElementById('finValorPago');
    if (elPago) {
        elPago.textContent = formatarMoeda(pago);
        elPago.style.color = 'var(--green)';
    }
    const saldoDevedor = Math.max(0, valorCobrado - pago);
    const elPendente = document.getElementById('finValorPendente');
    if (elPendente) {
        elPendente.textContent = formatarMoeda(saldoDevedor);
        elPendente.style.color = 'var(--yellow)';
    }
    const elVencimento = document.getElementById('finVencimento');
    if (elVencimento) elVencimento.textContent = evento.vencimento ? formatarData(evento.vencimento) : 'Não definido';
    const elForma = document.getElementById('finFormaPagamento');
    if (elForma) elForma.textContent = {
        pix: 'PIX', boleto: 'Boleto', cartao: 'Cartão', transferencia: 'Transferência'
    }[evento.formaPagamento] || 'Não definido';

    const parcelas = evento.parcelas || 1;
    let htmlParcelas = '';
    if (saldoDevedor <= 0) {
        htmlParcelas = '<tr><td colspan="4">✅ Totalmente quitado</td></tr>';
    } else {
        const valorParcela = saldoDevedor / parcelas;
        for (let i = 1; i <= parcelas; i++) {
            htmlParcelas += `<tr><td>${i}ª</td><td>${formatarMoeda(valorParcela)}</td><td>${evento.vencimento ? formatarData(evento.vencimento) : '-'}</td><td><span class="badge badge-warning">Pendente</span></td></tr>`;
        }
    }
    const tabelaParcelas = document.getElementById('finParcelasTable');
    if (tabelaParcelas) tabelaParcelas.innerHTML = htmlParcelas;
}
