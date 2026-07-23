// js/core/api.js
const SUPABASE_URL = 'https://uojdbrjxeapzfrulcipr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZGrmIWRubt_0MgPi_a4mgQ_RNYdNflM';

const supabaseClient = window.__SUPABASE__ || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.__SUPABASE__ = supabaseClient;

// ------------------- HELPERS (iguais aos seus) -------------------
function toSnakeCase(obj) {
  const novo = {};
  for (const chave in obj) {
    if (obj[chave] === undefined) continue;
    let snake = chave.replace(/[A-Z]/g, letra => '_' + letra.toLowerCase());
    let valor = obj[chave];
    if (Array.isArray(valor)) valor = JSON.stringify(valor);
    novo[snake] = valor;
  }
  return novo;
}

function toCamelCase(obj) {
  const novo = {};
  for (const chave in obj) {
    const camel = chave.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase());
    novo[camel] = obj[chave];
  }
  return novo;
}

// ------------------- API PRINCIPAL -------------------
const API = (() => {

  // ---------- AUTENTICAÇÃO ----------
  async function login(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      
      const { data: perfil, error: perfilError } = await supabaseClient
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (perfilError) throw new Error('Perfil não encontrado');

      // Lógica especial do Admin que você tinha
      try {
        const { data: configData } = await supabaseClient.from('config').select('admin_nome').eq('id', 1).single();
        if (configData?.admin_nome && perfil.nivel === 'Administrador' && perfil.nome !== configData.admin_nome) {
          await supabaseClient.from('perfis').update({ nome: configData.admin_nome }).eq('id', data.user.id);
          perfil.nome = configData.admin_nome;
        }
      } catch (e) {}

      return {
        success: true,
        user: { id: data.user.id, email: data.user.email },
        perfil: { nome: perfil.nome, nivel: perfil.nivel, permissoes: perfil.permissoes || {} },
        token: data.session?.access_token || null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    try {
      await supabaseClient.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function alterarSenha(novaSenha) {
    try {
      const { error } = await supabaseClient.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ---------- CONFIGURAÇÕES ----------
  async function getConfig() {
    try {
      const { data, error } = await supabaseClient.from('config').select('*').eq('id', 1).single();
      if (error) throw error;
      return {
        success: true,
        data: {
          empresaNome: data.empresa_nome,
          email: data.email,
          telefoneSuporte: data.telefone_suporte,
          adminNome: data.admin_nome,
          adminEmail: data.admin_email,
          logoUrl: data.logo_url
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function salvarConfig(cfg) {
    try {
      const { error } = await supabaseClient.from('config').update({
        empresa_nome: cfg.empresaNome,
        email: cfg.email,
        telefone_suporte: cfg.telefoneSuporte,
        admin_nome: cfg.adminNome,
        admin_email: cfg.adminEmail,
        logo_url: cfg.logoUrl
      }).eq('id', 1);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ---------- EVENTOS ----------
  async function getEventos() {
    try {
      const { data, error } = await supabaseClient.from('eventos').select('*').order('id', { ascending: false });
      if (error) throw error;
      const eventos = data.map(e => {
        const ev = toCamelCase(e);
        if (typeof ev.patrocinadoresLogos === 'string') {
          try { ev.patrocinadoresLogos = JSON.parse(ev.patrocinadoresLogos); } catch (_) { ev.patrocinadoresLogos = []; }
        }
        ev.visitantes = [];
        return ev;
      });
      return { success: true, data: eventos };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  async function salvarEvento(evento) {
    try {
      let dados = { ...evento };
      if (!dados.id) {
        dados.token = 'tok_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      }
      const dadosSnake = toSnakeCase(dados);
      
      let result;
      if (dados.id) {
        result = await supabaseClient.from('eventos').update(dadosSnake).eq('id', dados.id);
      } else {
        result = await supabaseClient.from('eventos').insert([dadosSnake]);
      }
      if (result.error) throw result.error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function excluirEvento(id) {
    try {
      const { error } = await supabaseClient.from('eventos').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ---------- VISITANTES ----------
  async function registrarVisitante(token, dados) {
    try {
      const { data: evento, error: errEvento } = await supabaseClient.from('eventos').select('id').eq('token', token).single();
      if (errEvento || !evento) throw new Error('Evento não encontrado');
      
      dados.evento_id = parseInt(evento.id, 10);
      const { error } = await supabaseClient.from('visitantes').insert([toSnakeCase(dados)]);
      if (error) throw error;

      // Atualiza total de visitantes
      try {
        const { count } = await supabaseClient.from('visitantes').select('*', { count: 'exact', head: true }).eq('evento_id', evento.id);
        if (count !== null) {
          await supabaseClient.from('eventos').update({ totalVisitantes: count }).eq('id', evento.id);
        }
      } catch (e) {}
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function getVisitantes(eventoId) {
    try {
      const { data, error } = await supabaseClient.from('visitantes').select('*').eq('evento_id', eventoId).order('id', { ascending: false });
      if (error) throw error;
      return { success: true, data: data.map(toCamelCase) };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  // ---------- FUNCIONÁRIOS ----------
  async function getFuncionarios() {
    try {
      const { data, error } = await supabaseClient.from('funcionarios').select('*').order('id');
      if (error) throw error;
      const funcs = data.map(f => {
        const func = toCamelCase(f);
        if (typeof func.permissoes === 'string') {
          try { func.permissoes = JSON.parse(func.permissoes); } catch (e) { func.permissoes = {}; }
        }
        return func;
      });
      return { success: true, data: funcs };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  }

  async function salvarFuncionario(func) {
    try {
      const dados = { ...func };
      if (typeof dados.permissoes === 'object') dados.permissoes = JSON.stringify(dados.permissoes);
      const dadosSnake = toSnakeCase(dados);
      
      let result;
      if (dados.id) {
        result = await supabaseClient.from('funcionarios').update(dadosSnake).eq('id', dados.id);
      } else {
        result = await supabaseClient.from('funcionarios').insert([dadosSnake]);
      }
      if (result.error) throw result.error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function excluirFuncionario(id) {
    try {
      const { error } = await supabaseClient.from('funcionarios').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ---------- MIKROTIK ----------
  async function mikrotikLogin(token) {
    try {
      const { error } = await supabaseClient.functions.invoke('mikrotik-login', { body: { token } });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function mikrotikAtivos() {
    try {
      const { data, error } = await supabaseClient.functions.invoke('mikrotik-ativos');
      if (error) throw error;
      return { success: true, total: data.total };
    } catch (error) {
      return { success: false, error: error.message, total: 0 };
    }
  }

  // ---------- EXPORTA TUDO ----------
  return {
    login,
    logout,
    alterarSenha,
    getConfig,
    salvarConfig,
    getEventos,
    salvarEvento,
    excluirEvento,
    registrarVisitante,
    getVisitantes,
    getFuncionarios,
    salvarFuncionario,
    excluirFuncionario,
    mikrotikLogin,
    mikrotikAtivos
  };
})();

window.API = API;
