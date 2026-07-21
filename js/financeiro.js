// Financeiro
function atualizarResumoFinanceiroGeral() {
    const totalCobrado = EV.reduce((acc, e) => acc + (e.valorCobrado || 0), 0);
    const totalCusto = EV.reduce((acc, e) => acc + (e.custoOperacional || 0), 0);
    const lucro = totalCobrado - totalCusto;
    document.getElementById('resumoTotalCobrado').textContent = formatarMoeda(totalCobrado);
    document.getElementById('resumoTotalCusto').textContent = formatarMoeda(totalCusto);
    document.getElementById('resumoLucroTotal').textContent = formatarMoeda(lucro);
    document.getElementById('resumoLucroTotal').style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
}

function selecionarEventoFinanceiro() {
    const id = parseInt(document.getElementById('eventoSelectFinanceiro').value);
    const content = document.getElementById('financeiroContent');
    const empty = document.getElementById('financeiroEmpty');
    if (!id) {
        content.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    const evento = EV.find(e => e.id === id);
    if (!evento) return;
    content.style.display = 'block';
    empty.style.display = 'none';

    const p = usuarioLogado?.permissoes || {};
    const semPermissao = !p.f;

    const valorCobrado = evento.valorCobrado || 0;
    const custo = evento.custoOperacional || 0;
    const pago = evento.valorPago || 0;
    const lucro = valorCobrado - custo;
    const margem = valorCobrado > 0 ? (lucro / valorCobrado) * 100 : 0;

    if (semPermissao) {
        ['finValorCobrado','finCustoOperacional','finLucro','finMargem','finValorTotal','finValorPago','finValorPendente'].forEach(id => document.getElementById(id).textContent = 'R$ ••••');
        document.getElementById('finStatusPagamento').innerHTML = '<span class="badge badge-secondary">🔒 Sem permissão</span>';
        document.getElementById('finParcelasTable').innerHTML = '<tr><td colspan="4">🔒</td></tr>';
        return;
    }

    document.getElementById('finValorCobrado').textContent = formatarMoeda(valorCobrado);
    document.getElementById('finCustoOperacional').textContent = formatarMoeda(custo);
    document.getElementById('finCustoOperacional').style.color = 'var(--red)';
    document.getElementById('finLucro').textContent = formatarMoeda(lucro);
    document.getElementById('finLucro').style.color = lucro >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('finMargem').textContent = margem.toFixed(1).replace('.', ',') + '%';

    const sp = statusPagamento(evento);
    document.getElementById('finStatusPagamento').innerHTML = `<span class="badge ${sp.classe}" style="font-size:14px;padding:8px 16px;">${sp.texto}</span>`;

    document.getElementById('finValorTotal').textContent = formatarMoeda(valorCobrado);
    document.getElementById('finValorPago').textContent = formatarMoeda(pago);
    document.getElementById('finValorPago').style.color = 'var(--green)';
    const saldoDevedor = Math.max(0, valorCobrado - pago);
    document.getElementById('finValorPendente').textContent = formatarMoeda(saldoDevedor);
    document.getElementById('finValorPendente').style.color = 'var(--yellow)';
    document.getElementById('finVencimento').textContent = evento.vencimento ? formatarData(evento.vencimento) : 'Não definido';
    document.getElementById('finFormaPagamento').textContent = {
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
    document.getElementById('finParcelasTable').innerHTML = htmlParcelas;
}
