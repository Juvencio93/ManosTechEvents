// js/core/auth.js

const Auth = (() => {
  // Estado interno (singleton)
  let currentUser = null;
  let currentToken = null;
  let currentProfile = null;

  // Carrega estado salvo ao iniciar
  function loadFromStorage() {
    try {
      const savedUser = localStorage.getItem('manos_user');
      const savedToken = localStorage.getItem('manos_token');
      const savedProfile = localStorage.getItem('manos_profile');
      
      if (savedUser) currentUser = JSON.parse(savedUser);
      if (savedToken) currentToken = savedToken;
      if (savedProfile) currentProfile = JSON.parse(savedProfile);
    } catch (e) {
      console.warn('[Auth] Erro ao carregar storage:', e);
    }
  }
  loadFromStorage();

  /**
   * Realiza login via API e já guarda o estado
   */
  async function login(email, password) {
    const result = await API.login(email, password);
    if (result.success) {
      // Define o estado interno
      currentUser = result.user;
      currentToken = result.token || result.session?.access_token || null;
      currentProfile = result.user?.profile || { role: 'user' };

      // Persiste no localStorage
      localStorage.setItem('manos_user', JSON.stringify(currentUser));
      if (currentToken) localStorage.setItem('manos_token', currentToken);
      localStorage.setItem('manos_profile', JSON.stringify(currentProfile));

      return { success: true, user: currentUser };
    }
    return result;
  }

  /**
   * Logout (limpa tudo)
   */
  async function logout() {
    await API.logout();
    currentUser = null;
    currentToken = null;
    currentProfile = null;
    localStorage.removeItem('manos_user');
    localStorage.removeItem('manos_token');
    localStorage.removeItem('manos_profile');
    return { success: true };
  }

  /**
   * Retorna o usuário atual (objeto)
   */
  function usuario() {
    return currentUser;
  }

  /**
   * Retorna o perfil do usuário (ex: { role: 'admin' })
   */
  function perfil() {
    return currentProfile;
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   * @param {string} permissao - Ex: 'admin', 'editor', 'viewer'
   */
  function temPermissao(permissao) {
    if (!currentProfile) return false;
    // Lógica flexível: pode ser array de permissões ou hierarquia
    if (Array.isArray(currentProfile.permissoes)) {
      return currentProfile.permissoes.includes(permissao);
    }
    // Se for role simples
    if (permissao === 'admin' && currentProfile.role === 'admin') return true;
    if (permissao === 'editor' && ['admin', 'editor'].includes(currentProfile.role)) return true;
    return currentProfile.role === permissao;
  }

  /**
   * Verifica se o usuário está logado (token existe e não expirou)
   */
  function isLoggedIn() {
    if (!currentToken) return false;
    // Se quiser, pode checar expiração do JWT aqui
    return true;
  }

  // --- EXPORTAÇÃO ---
  return {
    login,
    logout,
    usuario,
    perfil,
    temPermissao,
    isLoggedIn,
  };
})();

window.Auth = Auth;
