// Área do Cliente – com menu lateral funcional

let clienteVisitantesCache = [];

// Toggle do menu hamburguer do cliente
function toggleClienteMenu() {
    const sb = document.getElementById('clienteSidebar');
    if (sb) sb.classList.toggle('open');
}

async function abrirAreaClienteEvento(evento) {
    eventoClienteAtual = evento;

    // Atualiza sidebar
    document.getElementById('clienteSidebarNome').textContent = evento.nome;
    document.getElementById('clienteSidebarLogo').innerHTML = evento.logoUrl
        ? `<img src="${evento.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">`
        : '🎪';

    // Status
    const status = calcularStatusEvento(evento);
    const badge = document.getElementById('clienteStatusBadge');
    badge.textContent = status;
    badge.className = 'badge ' + statusBadgeClass(status);
    badge.style.display = 'inline-block';

    // Busca visitantes
    try {
        clienteVisitantesCache = await apiListarVisitantes(evento.id);
    } catch (e) {
        clienteVisitantesCache = [];
    }

    // Total com animação
    animarContador('clienteTotalVisitantes', clienteVisitantesCache.length);

    // Mapa de calor
    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    clienteVisitantesCache.forEach(v => {
        const h = v.hora || 8;
        if (horas[h] !== undefined) horas[h]++;
    });
    const max = Math.max(...Object.values(horas), 1);
    const heatmapEl = document.getElementById('clienteHeatmapContainer');
    if (heatmapEl) {
        heatmapEl.innerHTML = Object.entries(horas).map(([h, c]) =>
            `<div class="heatmap-bar" style="height:${Math.max((c / max) * 140, 4)}px;" title="${h}h: ${c}"></div>`
        ).join('');
    }

    // Pizza
    const dispositivos = { iPhone: 0, Android: 0, Desktop: 0 };
    clienteVisitantesCache.forEach(v => {
        const d = v.dispositivo || 'Desktop';
        if (d.includes('iPhone') || d.includes('iPad') || d.includes('iPod')) dispositivos.iPhone++;
        else if (d.includes('Android')) dispositivos.Android++;
        else dispositivos.Desktop++;
    });
    const totalDisp = clienteVisitantesCache.length || 1;
    const iosPct = (dispositivos.iPhone / totalDisp) * 100;
    const androidPct = (dispositivos.Android / totalDisp) * 100;
    const desktopPct = (dispositivos.Desktop / totalDisp) * 100;
    const pie = document.getElementById('clientePieChart');
    if (pie) {
        pie.style.background = `conic-gradient(var(--azul) 0% ${iosPct}%, var(--green) ${iosPct}% ${iosPct + androidPct}%, var(--yellow) ${iosPct + androidPct}% 100%)`;
    }

    // Cards últimos 10
    const cardsContainer = document.getElementById('clienteUltimosCards');
    if (cardsContainer) {
        cardsContainer.innerHTML = clienteVisitantesCache.slice(0, 10).map(v => {
            const iniciais = v.nome.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
            const dispositivo = v.dispositivo || 'Desktop';
            const icone = dispositivo.includes('iPhone') || dispositivo.includes('Android') ? '📱' : '💻';
            return `
                <div style="background:var(--glass); backdrop-filter:blur(10px); border:1px solid var(--glass-border); border-radius:var(--r); padding:16px; display:flex; align-items:center; gap:12px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:rgba(77,168,218,0.2);display:flex;align-items:center;justify-content:center;font-weight:bold;color:var(--azul);">${escapeHtml(iniciais)}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;font-size:14px;">${escapeHtml(v.nome)}</div>
                        <div style="font-size:12px;color:var(--text2);">${v.acesso} • ${icone} ${escapeHtml(dispositivo)}</div>
                    </div>
                </div>`;
        }).join('');
    }

    // Tabela completa
    const tbody = document.getElementById('clienteVisitantesTable');
    if (tbody) {
        tbody.innerHTML = clienteVisitantesCache.map(v =>
            `<tr>
                <td><strong>${escapeHtml(v.nome)}</strong></td>
                <td>${escapeHtml(v.email)}</td>
                <td>${escapeHtml(v.whatsapp)}</td>
                <td>${v.acesso}</td>
                <td>${escapeHtml(v.dispositivo || 'Desktop')}</td>
            </tr>`
        ).join('');
    }
}

// Navegação do cliente
function showClientePage(nome) {
    document.querySelectorAll('#clienteMainContent .page').forEach(p => p.classList.remove('active'));
    const pagina = document.getElementById('clientePage-' + nome);
    if (pagina) pagina.classList.add('active');

    document.querySelectorAll('#clienteSidebar nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('#clienteSidebar nav a').forEach(a => {
        if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${nome}'`)) {
            a.classList.add('active');
        }
    });
}

// Animação do contador
function animarContador(elementId, valorFinal) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duracao = 1000;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duracao, 1);
        el.textContent = Math.floor(progress * valorFinal);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = valorFinal;
    }
    requestAnimationFrame(update);
}

// Relatórios
async function gerarRelatorioClientePDF() {
    if (!eventoClienteAtual) { alert('Nenhum evento carregado.'); return; }
    gerarPDFEvento({ ...eventoClienteAtual, visitantes: clienteVisitantesCache, totalVisitantes: clienteVisitantesCache.length });
}

function gerarRelatorioClienteExcel() {
    if (!eventoClienteAtual || clienteVisitantesCache.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    const dados = clienteVisitantesCache.map(v => ({
        Nome: v.nome,
        Email: v.email,
        WhatsApp: v.whatsapp,
        Acesso: v.acesso,
        Dispositivo: v.dispositivo || 'Desktop'
    }));
    const csv = [
        Object.keys(dados[0]).join(','),
        ...dados.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitantes_${eventoClienteAtual.nome.replace(/\s+/g, '_')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
}

// Mantida para compatibilidade
async function gerarRelatorioCliente() {
    gerarRelatorioClientePDF();
}

// Configuração (mantida)
function previewLogoConfig(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            configLogoTemp = e.target.result;
            atualizarPreviewLogoConfig();
        };
        reader.readAsDataURL(file);
    }
}

async function salvarConfiguracao() {
    CFG.empresaNome = document.getElementById('configEmpresaNome').value.trim() || 'Manos Tech';
    CFG.email = document.getElementById('configEmail').value.trim();
    CFG.telefoneSuporte = document.getElementById('configTelefoneSuporte').value.trim();
    CFG.adminNome = document.getElementById('configAdminNome').value.trim();
    CFG.adminEmail = document.getElementById('configAdminEmail').value.trim();
    const novaSenha = document.getElementById('configAdminSenha').value.trim();

    if (configLogoTemp !== null && configLogoTemp !== undefined) {
        CFG.logoUrl = configLogoTemp;
    }

    try {
        await apiSalvarConfig(CFG);

        if (sessao?.id) {
            const { error: perfilError } = await supabaseClient
                .from('perfis')
                .update({ nome: CFG.adminNome })
                .eq('id', sessao.id);
            if (perfilError) console.warn('Erro ao atualizar nome no perfil:', perfilError);
        }

        if (usuarioLogado && usuarioLogado.nivel === 'Administrador') {
            usuarioLogado.nome = CFG.adminNome;
            const userEl = document.getElementById('sidebarUserName');
            if (userEl) userEl.textContent = CFG.adminNome.split(' ')[0];
        }

        if (novaSenha) {
            if (novaSenha.length < 4) { toast('⚠️ Senha deve ter no mínimo 4 caracteres'); return; }
            try {
                await apiAlterarSenha(novaSenha);
                document.getElementById('configAdminSenha').value = '';
                toast('🔒 Senha alterada. Você será desconectado para usar a nova senha.');
                setTimeout(() => sairDoSistema(), 2000);
                return;
            } catch (e) {
                toast('❌ Erro ao alterar senha: ' + e.message);
                return;
            }
        }

        atualizarInterfaceUsuario();
        toast('✅ Configurações salvas!');
        showPage('inicio');
    } catch (e) {
        toast('❌ Erro ao salvar configurações: ' + e.message);
    }
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}
