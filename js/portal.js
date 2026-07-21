// Portal cativo (integrado ao Supabase, sem localStorage)

function abrirPortalCat(id) {
    const evento = EV.find(ev => ev.id === id);
    if (!evento) {
        toast('⚠️ Evento não encontrado.');
        return;
    }

    const logoGrande = document.getElementById('portalLogoGrande');
    if (logoGrande) {
        const logoSrc = evento.logoUrl || '';
        if (logoSrc.startsWith('http') || logoSrc.startsWith('data:')) {
            logoGrande.innerHTML = `<img src="${logoSrc}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none'">`;
        } else {
            logoGrande.innerHTML = '<span style="font-size:48px;">🎪</span>';
        }
    }

    const faixa = document.getElementById('carrosselFaixa');
    if (faixa) {
        const logosOriginais = Array.isArray(evento.patrocinadoresLogos) ? evento.patrocinadoresLogos : [];
        const logosValidos = logosOriginais.filter(url =>
            typeof url === 'string' && url.length > 20 && (url.startsWith('http') || url.startsWith('data:'))
        );

        if (logosValidos.length > 4) {
            const duplicados = [...logosValidos, ...logosValidos];
            faixa.innerHTML = duplicados.map(url => `<img src="${url}" alt="Patrocinador" onerror="this.style.display='none'">`).join('');
            faixa.style.animation = 'scrollPatrocinadores 20s linear infinite';
        } else if (logosValidos.length > 0) {
            faixa.innerHTML = logosValidos.map(url => `<img src="${url}" alt="Patrocinador" onerror="this.style.display='none'">`).join('');
            faixa.style.animation = 'none';
        } else {
            faixa.innerHTML = '';
        }
    }

    ['portalNome','portalEmail','portalWhatsApp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const lgpdCheck = document.getElementById('portalLGPD');
    if (lgpdCheck) lgpdCheck.checked = false;
    const lgpdError = document.getElementById('lgpdError');
    if (lgpdError) lgpdError.style.display = 'none';

    abrirModal('portalModal');
}

function formatWhatsApp(input) {
    let valor = input.value.replace(/[^\d+\-() ]/g, '');
    input.value = valor;
}

async function simularConexao() {
    const nome = document.getElementById('portalNome')?.value.trim();
    const email = document.getElementById('portalEmail')?.value.trim();
    const whatsapp = document.getElementById('portalWhatsApp')?.value.trim();

    if (!nome) { alert('⚠️ Preencha seu nome!'); return; }
    if (!email) { alert('⚠️ Preencha seu e-mail!'); return; }
    if (whatsapp && whatsapp.replace(/\D/g, '').length < 7) {
        alert('⚠️ Número de WhatsApp inválido. Mínimo 7 dígitos.');
        return;
    }
    if (!document.getElementById('portalLGPD')?.checked) {
        const err = document.getElementById('lgpdError');
        if (err) err.style.display = 'block';
        return;
    }

    const evento = EV.find(ev => ev.id === eventoSelecionadoId) || eventoClienteAtual;
    if (!evento) {
        alert('Evento não encontrado.');
        return;
    }

    const visitante = {
        nome: escapeHtml(nome),
        email: email,
        whatsapp: whatsapp || '(não informado)',
        acesso: new Date().toISOString(),
        hora: new Date().getHours(),
        dispositivo: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        ip: '0.0.0.0'
    };

    try {
        await apiRegistrarVisitante(evento.token, visitante);
        // Atualiza interface local (dashboard) sem localStorage
        if (eventoSelecionadoId === evento.id) selecionarEvento();
        if (eventoClienteAtual?.id === evento.id) abrirAreaClienteEvento(evento);
        renderizarEventos();
        fecharModal('portalModal');
        toast('✅ Conectado!');
    } catch (e) {
        toast('❌ Erro ao registrar: ' + e.message);
    }
}
