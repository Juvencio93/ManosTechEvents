// Funcionários (com API)

async function carregarFuncionarios() {
    try {
        FN = await apiListarFuncionarios();
    } catch (e) {
        console.error('Erro ao carregar funcionários:', e);
        FN = [];
    }
    renderizarFuncionarios();
}

function abrirModalFuncionario() {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    funcionarioEmEdicao = null;
    document.getElementById('funcionarioModalTitle').textContent = '👷 Novo Funcionário';
    document.getElementById('funcNome').value = '';
    document.getElementById('funcEmail').value = '';
    document.getElementById('funcNivel').value = 'Técnico';
    document.getElementById('funcSenha').value = '';
    document.getElementById('funcEventos').value = '';
    atualizarPermPadrao();
    abrirModal('funcionarioModal');
}

function editarFuncionario(index) {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    funcionarioEmEdicao = index;
    document.getElementById('funcionarioModalTitle').textContent = '✏️ Editar Funcionário';
    const f = FN[index];
    document.getElementById('funcNome').value = f.nome;
    document.getElementById('funcEmail').value = f.email;
    document.getElementById('funcNivel').value = f.nivel;
    document.getElementById('funcSenha').value = f.senha || '';
    document.getElementById('funcEventos').value = f.eventos || '';
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        let checked = false;
        if (label.includes('visualizar')) checked = f.permissoes.v;
        else if (label.includes('dashboard')) checked = f.permissoes.d;
        else if (label.includes('visitantes')) checked = f.permissoes.vi;
        else if (label.includes('editar')) checked = f.permissoes.e;
        else if (label.includes('excluir')) checked = f.permissoes.x;
        else if (label.includes('financeiro')) checked = f.permissoes.f;
        else if (label.includes('gerenciar')) checked = f.permissoes.g;
        else if (label.includes('configuraç')) checked = f.permissoes.c;
        else if (label.includes('relatório')) checked = f.permissoes.r;
        cb.checked = checked;
        cb.parentElement.classList.toggle('checked', checked);
    });
    abrirModal('funcionarioModal');
}

function atualizarPermPadrao() {
    const nivel = document.getElementById('funcNivel').value;
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        let checked = nivel === 'Administrador' ? true :
            (label.includes('visualizar') || label.includes('dashboard') || label.includes('visitantes') || label.includes('editar') || label.includes('relatório'));
        cb.checked = checked;
        cb.parentElement.classList.toggle('checked', checked);
    });
}

async function salvarFuncionario() {
    const nome = document.getElementById('funcNome').value.trim();
    const email = document.getElementById('funcEmail').value.trim();
    if (!nome || !email) { alert('⚠️ Preencha nome e e-mail!'); return; }
    if (!validarEmail(email)) { alert('⚠️ E-mail inválido!'); return; }

    const permissoes = {};
    document.querySelectorAll('#permissoesGroup input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement.textContent.toLowerCase();
        if (label.includes('visualizar')) permissoes.v = cb.checked;
        else if (label.includes('dashboard')) permissoes.d = cb.checked;
        else if (label.includes('visitantes')) permissoes.vi = cb.checked;
        else if (label.includes('editar')) permissoes.e = cb.checked;
        else if (label.includes('excluir')) permissoes.x = cb.checked;
        else if (label.includes('financeiro')) permissoes.f = cb.checked;
        else if (label.includes('gerenciar')) permissoes.g = cb.checked;
        else if (label.includes('configuraç')) permissoes.c = cb.checked;
        else if (label.includes('relatório')) permissoes.r = cb.checked;
    });

    const dados = {
        nome, email,
        nivel: document.getElementById('funcNivel').value,
        senha: document.getElementById('funcSenha').value || '123456',
        eventos: document.getElementById('funcEventos').value.trim(),
        permissoes
    };

    try {
        if (funcionarioEmEdicao !== null) {
            const id = FN[funcionarioEmEdicao].id;
            await apiAtualizarFuncionario(id, dados);
            toast('✅ Funcionário atualizado!');
        } else {
            await apiCriarFuncionario(dados);
            toast('✅ Funcionário criado!');
        }
        await carregarFuncionarios(); // recarrega do Supabase
        fecharModal('funcionarioModal');
    } catch (e) {
        toast('❌ Erro ao salvar funcionário: ' + e.message);
    }
    funcionarioEmEdicao = null;
}

async function excluirFuncionario(index) {
    if (!usuarioLogado?.permissoes?.g) { toast('🔒 Sem permissão!'); return; }
    confirmarAcao('Deseja realmente excluir este funcionário?', async () => {
        try {
            const id = FN[index].id;
            await apiExcluirFuncionario(id);
            await carregarFuncionarios();
            toast('🗑️ Funcionário excluído!');
        } catch (e) {
            toast('❌ Erro ao excluir funcionário: ' + e.message);
        }
    });
}

function renderizarFuncionarios() {
    const tbody = document.getElementById('funcionariosTable');
    if (!tbody) return;
    tbody.innerHTML = FN.map((f, i) => {
        const perms = [];
        if (f.permissoes?.v) perms.push('👁');
        if (f.permissoes?.e) perms.push('✏️');
        if (f.permissoes?.f) perms.push('💰');
        return `<tr>
            <td><strong>${escapeHtml(f.nome)}</strong></td>
            <td>${escapeHtml(f.email)}</td>
            <td><span class="badge ${f.nivel === 'Administrador' ? 'badge-info' : 'badge-success'}">${f.nivel}</span></td>
            <td>${perms.join(' ') || '-'}</td>
            <td>${escapeHtml(f.eventos || '')}</td>
            <td>
                <button class="btn btn-xs btn-ghost" onclick="editarFuncionario(${i})">✏️</button>
                <button class="btn btn-xs btn-danger" onclick="excluirFuncionario(${i})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

// Carrega automaticamente ao acessar a página de funcionários
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda o showPage carregar a página de funcionários para renderizar
    // A função showPage chama renderizarFuncionarios quando nome === 'funcionarios'
    // Mas precisamos garantir que FN esteja carregado antes de renderizar.
    // Vamos carregar no init.js após a restauração da sessão.
});
