// js/core/date-utils.js
const DATE_UTILS = (() => {
  function toISO(input) {
    if (!input) return null;
    let date = input;
    if (typeof input === 'string' && input.includes('/')) {
      const parts = input.split(' ');
      const dateParts = parts[0].split('/');
      let timeParts = ['00', '00', '00'];
      if (parts.length > 1) timeParts = parts[1].split(':');
      date = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[0]),
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
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function formatBR(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { timeZone: 'UTC' });
  }

  return { toISO, nowISO, formatBR };
})();
window.DATE_UTILS = DATE_UTILS;
