// js/core/date-utils.js

const DATE_UTILS = (() => {
  /**
   * Converte qualquer entrada (Date, string, timestamp) para ISO string
   * @param {string|Date|number} input 
   * @returns {string} Ex: "2026-07-23T18:30:00.000Z"
   */
  function toISO(input) {
    if (!input) return null;
    
    let date = input;
    
    // Se for string no formato brasileiro "21/07/2026 18:30"
    if (typeof input === 'string' && input.includes('/')) {
      const parts = input.split(' ');
      const dateParts = parts[0].split('/'); // [dia, mes, ano]
      let timeParts = ['00', '00', '00'];
      if (parts.length > 1) {
        timeParts = parts[1].split(':');
      }
      // Mês no JS é 0-indexado (Janeiro = 0)
      date = new Date(
        parseInt(dateParts[2]), // ano
        parseInt(dateParts[1]) - 1, // mês
        parseInt(dateParts[0]), // dia
        parseInt(timeParts[0] || 0),
        parseInt(timeParts[1] || 0),
        parseInt(timeParts[2] || 0)
      );
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      date = new Date(input);
    }

    if (isNaN(date.getTime())) {
      console.warn('[DATE_UTILS] Data inválida:', input);
      return null;
    }

    return date.toISOString();
  }

  /**
   * Retorna o momento atual em ISO
   */
  function nowISO() {
    return new Date().toISOString();
  }

  /**
   * Exibe para o usuário (formato legível BR), mas SEMPRE guarda ISO
   */
  function formatBR(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { timeZone: 'UTC' });
  }

  return {
    toISO,
    nowISO,
    formatBR,
  };
})();

window.DATE_UTILS = DATE_UTILS;
