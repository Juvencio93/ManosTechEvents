// ========== NOVA ÁREA DO CLIENTE ==========

// Variáveis de controle
let clienteViewAtual = 'inicio';
let visitantesCompleto = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 20;

// Toggle do menu hambúrguer
function toggleMenuCliente() {
    const menu = document.getElementById('clienteSidebarMenu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Navegação entre views
function navegarCliente(view) {
    document.getElementById('clienteViewInicio').style.display = 'none';
    document.getElementById('clienteViewVisitantes').style.display = 'none';
    document.getElementById('clienteViewRelatorios').style.display = 'none';
    if (view === 'inicio') document.getElementById('clienteViewInicio').style.display = 'block';
    else if (view === 'visitantes') document.getElementById('clienteViewVisitantes').style.display = 'block';
    else if (view === 'relatorios') document.getElementById('clienteViewRelatorios').style.display = 'block';
    clienteViewAtual = view;
    toggleMenuCliente(); // fecha o menu após seleção
}

// Animação de contagem
function animarContagem(elemento, valorFinal, duracao = 800) {
    const passo = Math.ceil(valorFinal / (duracao / 16));
    let atual = 0;
    const timer = setInterval(() => {
        atual += passo;
        if (atual >= valorFinal) {
            elemento.textContent = valorFinal;
            clearInterval(timer);
        } else {
            elemento.textContent = atual;
        }
    }, 16);
}

// Função principal (substitui a antiga)
async function abrirAreaClienteEvento(evento) {
    eventoClienteAtual = evento;

    // Cabeçalho
    document.getElementById('clienteEventoNome').textContent = evento.nome;
    document.getElementById('clienteEventoPeriodo').textContent =
        `${formatarData(evento.dataInicio)} a ${formatarData(evento.dataFim)}`;
    document.getElementById('clienteEventoLocal').textContent = evento.local;
    document.getElementById('clienteLogoHeader').innerHTML = evento.logoUrl
        ? `<img src="${evento.logoUrl}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">`
        : '🎪';

    const status = calcularStatusEvento(evento);
    const badge = document.getElementById('clienteStatusBadge');
    badge.textContent = status;
    badge.className = 'badge ' + statusBadgeClass(status);
    badge.style.display = 'inline-block';

    // Visitantes
    let visitantes = [];
    try {
        visitantes = await apiListarVisitantes(evento.id);
    } catch (e) {
        visitantes = evento.visitantes || [];
    }
    visitantesCompleto = visitantes;
    const total = visitantes.length;
    animarContagem(document.getElementById('clienteTotalVisitantes'), total, 600);

    // Pico de acessos (maior hora)
    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    visitantes.forEach(v => {
        const h = v.hora || 8;
        if (horas[h] !== undefined) horas[h]++;
    });
    const max = Math.max(...Object.values(horas), 1);
    const pico = Object.entries(horas).find(([h, c]) => c === max);
    document.getElementById('clientePicoHora').textContent = pico ? `${pico[0]}h (${pico[1]})` : '--';

    // Dispositivo predominante
    const disp = { iPhone: 0, Android: 0, Desktop: 0, Outros: 0 };
    visitantes.forEach(v => {
        const d = v.dispositivo || 'Desktop';
        if (/iPhone|iPad|iPod/.test(d)) disp.iPhone++;
        else if (/Android/.test(d)) disp.Android++;
        else if (/Desktop|Windows|Mac|Linux/.test(d)) disp.Desktop++;
        else disp.Outros++;
    });
    const predominante = Object.entries(disp).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('clienteDispositivoPred').textContent = predominante ? predominante[0] : '--';

    // Heatmap
    document.getElementById('clienteHeatmapContainer').innerHTML = Object.entries(horas)
        .map(([h, c]) => `<div class="heatmap-bar" style="height:${Math.max((c / max) * 140, 4)}px;" title="${h}h: ${c}"></div>`)
        .join('');

    // Pizza de dispositivos (verde, azul, amarelo)
    const totalDisp = total || 1;
    const pIos = (disp.iPhone / totalDisp) * 100;
    const pAnd = (disp.Android / totalDisp) * 100;
    const pDesk = (disp.Desktop / totalDisp) * 100;
    const pOut = (disp.Outros / totalDisp) * 100;
    const pie = document.getElementById('clientePieChart');
    if (pie) {
        pie.style.background = `conic-gradient(#2ecc71 0% ${pIos}%, #3498db ${pIos}% ${pIos + pAnd}%, #f1c40f ${pIos + pAnd}% ${pIos + pAnd + pDesk}%, #95a5a6 ${pIos + pAnd + pDesk}% 100%)`;
    }

    // Cards últimos 12 visitantes
    const cardsContainer = document.getElementById('clienteVisitantesCards');
    if (cardsContainer) {
        const ultimos12 = visitantes.slice(-12).reverse(); // mais recentes primeiro
        cardsContainer.innerHTML = ultimos12.map(v => {
            const iniciais = v.nome.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
            const icone = /iPhone|Android/.test(v.dispositivo || '') ? '📱' : '💻';
            return `<div style="background:var(--glass); backdrop-filter:blur(10px); border:1px solid var(--glass-border); border-radius:var(--r); padding:16px; display:flex; align-items:center; gap:12px;">
                        <div style="width:40px;height:40px;border-radius:50%;background:rgba(77,168,218,0.2);display:flex;align-items:center;justify-content:center;font-weight:bold;color:var(--azul);">${escapeHtml(iniciais)}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(v.nome)}</div>
                            <div style="font-size:12px;color:var(--text2);">${v.acesso} • ${icone}</div>
                        </div>
                    </div>`;
        }).join('');
    }

    // Tabela paginada
    paginaAtual = 1;
    renderizarTabelaPaginada();

    // Garante que a view inicial seja exibida
    navegarCliente('inicio');
}

function renderizarTabelaPaginada() {
    const tbody = document.getElementById('clienteVisitantesTable');
    const pagDiv = document.getElementById('clientePaginacao');
    if (!tbody || !pagDiv) return;

    const totalPaginas = Math.ceil(visitantesCompleto.length / ITENS_POR_PAGINA);
    if (totalPaginas === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum visitante registrado.</td></tr>';
        pagDiv.innerHTML = '';
        return;
    }
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const paginaVisitantes = visitantesCompleto.slice(inicio, inicio + ITENS_POR_PAGINA);

    tbody.innerHTML = paginaVisitantes.map(v =>
        `<tr>
            <td><strong>${escapeHtml(v.nome)}</strong></td>
            <td>${escapeHtml(v.email)}</td>
            <td>${escapeHtml(v.whatsapp)}</td>
            <td>${v.acesso}</td>
            <td>${escapeHtml(v.dispositivo || 'Desktop')}</td>
        </tr>`
    ).join('');

    let htmlPag = '';
    htmlPag += `<button class="btn btn-sm" style="background:var(--glass);" onclick="mudarPagina(${paginaAtual - 1})" ${paginaAtual === 1 ? 'disabled' : ''}>◀</button>`;
    for (let i = 1; i <= totalPaginas; i++) {
        htmlPag += `<button class="btn btn-sm" style="background:${i === paginaAtual ? 'var(--azul)' : 'var(--glass)'};color:${i === paginaAtual ? 'white' : 'var(--text)'};" onclick="mudarPagina(${i})">${i}</button>`;
    }
    htmlPag += `<button class="btn btn-sm" style="background:var(--glass);" onclick="mudarPagina(${paginaAtual + 1})" ${paginaAtual === totalPaginas ? 'disabled' : ''}>▶</button>`;
    pagDiv.innerHTML = htmlPag;
}

function mudarPagina(novaPagina) {
    const totalPaginas = Math.ceil(visitantesCompleto.length / ITENS_POR_PAGINA);
    if (novaPagina < 1 || novaPagina > totalPaginas) return;
    paginaAtual = novaPagina;
    renderizarTabelaPaginada();
}

// Exportar Excel (XLSX verdadeiro)
function exportarExcelCliente() {
    if (!eventoClienteAtual) {
        alert('Nenhum evento carregado.');
        return;
    }
    let visitantes = eventoClienteAtual.visitantes || visitantesCompleto;
    if (visitantes.length === 0 && eventoClienteAtual.id) {
        apiListarVisitantes(eventoClienteAtual.id).then(data => {
            eventoClienteAtual.visitantes = data;
            visitantesCompleto = data;
            gerarXLSX(data);
        }).catch(() => alert('Erro ao carregar visitantes.'));
    } else {
        gerarXLSX(visitantes);
    }
}

function gerarXLSX(visitantes) {
    if (!visitantes || visitantes.length === 0) {
        alert('Nenhum visitante para exportar.');
        return;
    }
    const dados = visitantes.map(v => ({
        Nome: v.nome,
        'E-mail': v.email,
        WhatsApp: v.whatsapp,
        Horário: v.acesso,
        Dispositivo: v.dispositivo || 'Desktop'
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitantes");
    XLSX.writeFile(wb, `visitantes_${eventoClienteAtual.nome.replace(/\s+/g, '_')}.xlsx`);
}

// Função mantida para compatibilidade (não usada na UI, mas pode ser chamada por outros scripts)
function copiarLinkPortalCliente() {
    if (!eventoClienteAtual) return;
    const link = gerarLinkPortal(eventoClienteAtual);
    navigator.clipboard.writeText(link).then(() => toast('📋 Link do portal copiado!'));
}

async function atualizarAreaClienteSeAtiva() {
    if (eventoClienteAtual) {
        await abrirAreaClienteEvento(eventoClienteAtual);
    }
}

// Observer para reabrir a dashboard quando ficar visível (apoio ao init.js)
(function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'clienteDashboard' && mutation.target.style.display === 'block') {
                if (typeof eventoClienteAtual !== 'undefined' && eventoClienteAtual) {
                    abrirAreaClienteEvento(eventoClienteAtual);
                }
            }
        });
    });
    const dash = document.getElementById('clienteDashboard');
    if (dash) observer.observe(dash, { attributes: true, attributeFilter: ['style'] });
})();
