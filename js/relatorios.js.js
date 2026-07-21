// Relatórios
function gerarPDF() {
    const id = document.getElementById('relatorioEventoSelect').value;
    if (!id) { alert('⚠️ Selecione um evento!'); return; }
    const evento = EV.find(ev => ev.id === parseInt(id));
    if (evento) gerarPDFEvento(evento);
}

function gerarRelatorioCliente() {
    if (eventoClienteAtual) gerarPDFEvento(eventoClienteAtual);
}

function gerarPDFEvento(evento) {
    const empresaLogo = CFG.logoUrl ? `<img src="${CFG.logoUrl}" style="max-height:60px;" />` : `<strong>${CFG.empresaNome}</strong>`;
    const eventoLogo = evento.logoUrl ? `<img src="${evento.logoUrl}" style="max-height:60px;" />` : '<span style="font-size:24px;">🎪</span>';

    const visitantesRows = (evento.visitantes || []).map(v =>
        `<tr><td>${escapeHtml(v.nome)}</td><td>${escapeHtml(v.email)}</td><td>${escapeHtml(v.whatsapp)}</td><td>${v.acesso}</td></tr>`
    ).join('');

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 30px; color: #333; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4da8da; padding-bottom: 15px; margin-bottom: 20px;">
            <div>${empresaLogo}</div>
            <div style="text-align: right;"><h2 style="margin:0; color: #4da8da;">${CFG.empresaNome}</h2><small>${CFG.email} | ${CFG.telefoneSuporte}</small></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <div>
                <h1 style="margin:0; font-size: 24px;">${escapeHtml(evento.nome)}</h1>
                <p style="margin:5px 0;">Cliente: ${escapeHtml(evento.cliente)}</p>
                <p style="margin:5px 0;">Período: ${formatarData(evento.dataInicio)} a ${formatarData(evento.dataFim)}</p>
                <p style="margin:5px 0;">Local: ${escapeHtml(evento.local)}</p>
            </div>
            <div>${eventoLogo}</div>
        </div>
        <h3 style="color: #4da8da;">Visitantes (Total: ${evento.totalVisitantes})</h3>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead><tr style="background: #f0f6fa;"><th style="padding: 10px; border: 1px solid #ddd;">Nome</th><th style="padding: 10px; border: 1px solid #ddd;">E-mail</th><th style="padding: 10px; border: 1px solid #ddd;">WhatsApp</th><th style="padding: 10px; border: 1px solid #ddd;">Horário</th></tr></thead>
            <tbody>${visitantesRows || '<tr><td colspan="4" style="text-align:center;padding:20px;">Nenhum visitante registrado.</td></tr>'}</tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">Relatório gerado em ${new Date().toLocaleString('pt-BR')} | ${CFG.empresaNome}</div>
    </div>`;

    const elemento = document.createElement('div');
    elemento.innerHTML = html;
    document.body.appendChild(elemento);

    const opt = {
        margin: 5,
        filename: `relatorio_${evento.nome.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elemento).save().then(() => {
        document.body.removeChild(elemento);
        toast('📄 PDF gerado com sucesso!');
    });
}