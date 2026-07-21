// Portal Cativo (simulação no admin)
function abrirPortalCat(id) {
    const evento = EV.find(ev => ev.id === id);
    if (!evento) return;
    document.getElementById('portalLogoGrande').innerHTML = evento.logoUrl ? `<img src="${evento.logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;">` : '<span style="font-size:48px;">🎪</span>';
    const faixa = document.getElementById('carrosselFaixa');
    const logos = evento.patrocinadoresLogos || [];
    if (logos.length > 4) {
        faixa.innerHTML = [...logos, ...logos].map(url => `<img src="${url}" alt="Patrocinador">`).join('');
        faixa.style.animation = 'scrollPatrocinadores 20s linear infinite';
    } else {
        faixa.innerHTML = logos.map(url => `<img src="${url}" alt="Patrocinador">`).join('');
        faixa.style.animation = 'none';
    }
    document.getElementById('portalNome').value = '';
    document.getElementById('portalEmail').value = '';
    document.getElementById('portalWhatsApp').value = '';
    document.getElementById('portalLGPD').checked = false;
    document.getElementById('lgpdError').style.display = 'none';
    abrirModal('portalModal');
}

function formatWhatsApp(input) {
    let valor = input.value.replace(/[^\d+\-() ]/g, '');
    input.value = valor;
}

function simularConexao() {
    const nome = document.getElementById('portalNome').value.trim();
    const email = document.getElementById('portalEmail').value.trim();
    const whatsapp = document.getElementById('portalWhatsApp').value.trim();
    if (!nome) { alert('⚠️ Preencha seu nome!'); return; }
    if (!email) { alert('⚠️ Preencha seu e-mail!'); return; }
    if (whatsapp && whatsapp.replace(/\D/g, '').length < 7) {
        alert('⚠️ Número de WhatsApp inválido. Mínimo 7 dígitos.');
        return;
    }
    if (!document.getElementById('portalLGPD').checked) {
        document.getElementById('lgpdError').style.display = 'block';
        return;
    }
    const evento = EV.find(ev => ev.id === eventoSelecionadoId) || eventoClienteAtual;
    if (evento) {
        const agora = new Date();
        evento.visitantes.unshift({
            nome: escapeHtml(nome),
            email: email,
            whatsapp: whatsapp || '(não informado)',
            acesso: agora.toLocaleString('pt-BR'),
            hora: agora.getHours(),
            dispositivo: ['iPhone 15 Pro', 'Samsung S24', 'MacBook Pro'][Math.floor(Math.random() * 3)],
            ip: '192.168.1.' + Math.floor(Math.random() * 255)
        });
        evento.totalVisitantes = evento.visitantes.length;
        salvarDados();
        if (eventoSelecionadoId === evento.id) selecionarEvento();
        if (eventoClienteAtual?.id === evento.id) abrirAreaClienteEvento(evento);
        renderizarEventos();
    }
    fecharModal('portalModal');
    toast('✅ Conectado!');
}