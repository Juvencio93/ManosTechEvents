// js/core/auth.js
const Auth = (() => {
  let currentUser = null;
  let currentToken = null;
  let currentProfile = null;

  function loadFromStorage() {
    try {
      const savedUser = localStorage.getItem('manos_user');
      const savedToken = localStorage.getItem('manos_token');
      const savedProfile = localStorage.getItem('manos_profile');
      if (savedUser) currentUser = JSON.parse(savedUser);
      if (savedToken) currentToken = savedToken;
      if (savedProfile) currentProfile = JSON.parse(savedProfile);
    } catch (e) {}
  }
  loadFromStorage();

  async function login(email, password) {
    const result = await API.login(email, password);
    if (result.success) {
      currentUser = result.user;
      currentToken = result.token || null;
      currentProfile = result.perfil || { nivel: 'Usuário', permissoes: {} };
      localStorage.setItem('manos_user', JSON.stringify(currentUser));
      if (currentToken) localStorage.setItem('manos_token', currentToken);
      localStorage.setItem('manos_profile', JSON.stringify(currentProfile));
      return { success: true, user: currentUser };
    }
    return result;
  }

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

  function usuario() { return currentUser; }
  function perfil() { return currentProfile; }

  function temPermissao(permissao) {
    if (!currentProfile) return false;
    if (currentProfile.nivel === 'Administrador') return true;
    if (Array.isArray(currentProfile.permissoes)) {
      return currentProfile.permissoes.includes(permissao);
    }
    return false;
  }

  function isLoggedIn() {
    return !!currentToken;
  }

  return { login, logout, usuario, perfil, temPermissao, isLoggedIn };
})();
window.Auth = Auth;
