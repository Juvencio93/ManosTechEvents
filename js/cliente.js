// Área do Cliente – enriquecida (sem Tempo Médio e % Mobile)

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

    // Status
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

    const total = visitantes.length;
    document.getElementById('clienteTotalVisitantes').textContent = total;
    const conectados = total > 0 ? Math.max(1, Math.floor(total * 0.3)) : 0;
    document.getElementById('clienteLiveConnected').textContent = conectados;

    // Mapa de calor
    const horas = {};
    for (let h = 8; h <= 20; h++) horas[h] = 0;
    visitantes.forEach(v => {
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

    // Pizza de dispositivos
    const dispositivos = { iPhone: 0, Android: 0, Desktop: 0, Outros: 0 };
    visitantes.forEach(v => {
        const d = v.dispositivo || 'Desktop';
        if (d.includes('iPhone') || d.includes('iPad') || d.includes('iPod')) dispositivos.iPhone++;
        else if (d.includes('Android')) dispositivos.Android++;
        else if (d.includes('Desktop') || d.includes('Windows') || d.includes('Mac') || d.includes('Linux')) dispositivos.Desktop++;
        else dispositivos.Outros++;
    });
    const totalDisp = total || 1;
    const iosPct = (dispositivos.iPhone / totalDisp) * 100;
    const androidPct = (dispositivos.Android / totalDisp) * 100;
    const desktopPct = (dispositivos.Desktop / totalDisp) * 100;
    const outrosPct = (dispositivos.Outros / totalDisp) * 100;
    const pie = document.getElementById('clientePieChart');
    if (pie) {
        pie.style.background = `conic-gradient(var(--azul) 0% ${iosPct}%, #40a0ff ${iosPct}% ${iosPct + androidPct}%, var(--yellow) ${iosPct + androidPct}% ${iosPct + androidPct + desktopPct}%, var(--red) ${iosPct + androidPct + desktopPct}% 100%)`;
    }

    // Cards últimos visitantes
    const cardsContainer = document.getElementById('clienteVisitantesCards');
    if (cardsContainer) {
        cardsContainer.innerHTML = visitantes.slice(0, 10).map(v => {
            const iniciais = v.nome.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
            const dispositivo = v.dispositivo || 'Desktop';
            const icone = dispositivo.includes('iPhone') || dispositivo.includes('Android') ? '📱' : '💻';
            return `
                <div style="background:var(--glass); backdrop-filter:blur(10px); border:1px solid var(--glass-border); border-radius:var(--r); padding:16px; display:flex; align-items:center; gap:12px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:rgba(77,168,218,0.2);display:flex;align-items:center;justify-content:center;font-weight:bold;color:var(--azul);">${escapeHtml(iniciais)}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(v.nome)}</div>
                        <div style="font-size:12px;color:var(--text2);">${v.acesso} • ${icone}</div>
                    </div>
                </div>`;
        }).join('');
    }

    // Tabela completa
    const tbody = document.getElementById('clienteVisitantesTable');
    if (tbody) {
        tbody.innerHTML = visitantes.map(v =>
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

// Copiar link
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

async function gerarRelatorioCliente() {
    if (!eventoClienteAtual) { alert('Nenhum evento carregado.'); return; }
    let visitantes = [];
    try { visitantes = await apiListarVisitantes(eventoClienteAtual.id); } catch (e) {}
    gerarPDFEvento({ ...eventoClienteAtual, visitantes, totalVisitantes: visitantes.length });
}

function cancelarConfiguracao() {
    carregarDados();
    atualizarInterfaceUsuario();
    showPage('inicio');
    toast('Alterações canceladas.');
}
