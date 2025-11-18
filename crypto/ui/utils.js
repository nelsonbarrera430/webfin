// Ayudantes del DOM (si fuesen necesarios)

/**
 * Función 'query selector' abreviada
 * @param {string} selector 
 * @param {Element} [scope] 
 */
export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

/**
 * Función 'query selector all' abreviada
 * @param {string} selector 
 * @param {Element} [scope] 
 */
export function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}