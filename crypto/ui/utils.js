// Ayudantes del DOM (si fuesen necesarios)
// Estas funciones proporcionan alias cortos para métodos comunes del DOM, 
// lo que mejora la legibilidad y reduce la verbosidad en el código UI (ui/auth.js, ui/dashboard.js).

/**
 * Función 'query selector' abreviada.
 * Busca el primer elemento que coincide con el selector CSS.
 * * @param {string} selector - El selector CSS a buscar (ej. '#login-form', '.price').
 * @param {Element} [scope] - (Opcional) El elemento dentro del cual buscar. Por defecto es 'document'.
 * @returns {Element | null} El primer elemento encontrado o null.
 */
export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

/**
 * Función 'query selector all' abreviada.
 * Busca todos los elementos que coinciden con el selector CSS.
 * * @param {string} selector - El selector CSS a buscar (ej. '.watchlist-item', 'li').
 * @param {Element} [scope] - (Opcional) El elemento dentro del cual buscar. Por defecto es 'document'.
 * @returns {Element[]} Un Array con todos los elementos encontrados.
 */
export function qsa(selector, scope = document) {
    // querySelectorAll devuelve un NodeList. 
    // Utilizamos Array.from() para convertirlo en un Array nativo de JavaScript, 
    // permitiendo el uso de métodos Array como map, filter, forEach, etc.
    return Array.from(scope.querySelectorAll(selector));
}