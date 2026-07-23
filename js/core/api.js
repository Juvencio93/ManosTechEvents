// js/core/api.js

const API = (() => {
  // Configuração interna
  const CONFIG = {
    baseURL: window.location.origin + '/api', // ou a URL do seu Supabase
    storageType: 'supabase', // 'supabase' | 'local' | 'direct'
    supabaseUrl: 'https://seusupabase.supabase.co',
    supabaseKey: 'SUA_CHAVE_ANON',
  };

  // Cliente Supabase (se existir)
  let supabaseClient = null;
  if (typeof supabase !== 'undefined' && CONFIG.storageType === 'supabase') {
    supabaseClient = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }

  // --- MÉTODOS PÚBLICOS ---

  /**
   * Login do usuário
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  async function login(email, password) {
    try {
      if (CONFIG.storageType === 'supabase' && supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
      } else {
        // Fallback para chamada direta ao seu PHP (api/login.php)
        const response = await fetch(`${CONFIG.baseURL}/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no login');
        return { success: true, user: data.user, token: data.token };
      }
    } catch (error) {
      console.error('[API] Erro no login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      if (CONFIG.storageType === 'supabase' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      // Sempre limpa o localStorage também
      localStorage.removeItem('manos_user');
      localStorage.removeItem('manos_token');
      return { success: true };
    } catch (error) {
      console.error('[API] Erro no logout:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar eventos
   */
  async function getEventos(filtros = {}) {
    try {
      if (CONFIG.storageType === 'supabase' && supabaseClient) {
        let query = supabaseClient.from('eventos').select('*');
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.data_inicio) query = query.gte('data', filtros.data_inicio);
        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
      } else {
        // Fallback: busca do seu backend PHP
        const params = new URLSearchParams(filtros).toString();
        const response = await fetch(`${CONFIG.baseURL}/eventos.php?${params}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return { success: true, data };
      }
    } catch (error) {
      console.error('[API] Erro ao buscar eventos:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Salvar evento (criar ou atualizar)
   */
  async function salvarEvento(evento) {
    try {
      const payload = {
        ...evento,
        data: DATE_UTILS.toISO(evento.data) // Força ISO (vide item 2)
      };

      if (CONFIG.storageType === 'supabase' && supabaseClient) {
        let result;
        if (evento.id) {
          result = await supabaseClient.from('eventos').update(payload).eq('id', evento.id);
        } else {
          result = await supabaseClient.from('eventos').insert(payload);
        }
        if (result.error) throw result.error;
        return { success: true, data: result.data };
      } else {
        const response = await fetch(`${CONFIG.baseURL}/eventos.php`, {
          method: evento.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return { success: true, data };
      }
    } catch (error) {
      console.error('[API] Erro ao salvar evento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Registrar visitante
   */
  async function registrarVisitante(visitante) {
    try {
      const payload = {
        ...visitante,
        data_registro: DATE_UTILS.nowISO() // Força ISO
      };

      if (CONFIG.storageType === 'supabase' && supabaseClient) {
        const { data, error } = await supabaseClient.from('visitantes').insert(payload);
        if (error) throw error;
        return { success: true, data };
      } else {
        const response = await fetch(`${CONFIG.baseURL}/visitantes.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return { success: true, data };
      }
    } catch (error) {
      console.error('[API] Erro ao registrar visitante:', error);
      return { success: false, error: error.message };
    }
  }

  // --- EXPORTAÇÃO ---
  return {
    login,
    logout,
    getEventos,
    salvarEvento,
    registrarVisitante,
  };
})();

// Expor globalmente (já que o sistema é vanilla)
window.API = API;
