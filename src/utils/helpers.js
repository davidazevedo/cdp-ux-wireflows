/**
 * Função para limitar a frequência de chamadas de uma função
 * @param {Function} func - A função a ser debounced
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} - Função debounced
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Função para criptografar dados sensíveis
 * @param {string} data - Dados a serem criptografados
 * @returns {string} - Dados criptografados
 */
export function encrypt(data) {
    if (!data) return '';
    // Em produção, usar uma biblioteca de criptografia robusta
    // Aqui estamos apenas simulando a criptografia
    return btoa(data);
}

/**
 * Função para descriptografar dados
 * @param {string} encryptedData - Dados criptografados
 * @returns {string} - Dados descriptografados
 */
export function decrypt(encryptedData) {
    if (!encryptedData) return '';
    // Em produção, usar uma biblioteca de criptografia robusta
    // Aqui estamos apenas simulando a descriptografia
    return atob(encryptedData);
}

/**
 * Função para sanitizar dados de entrada
 * @param {string} data - Dados a serem sanitizados
 * @returns {string} - Dados sanitizados
 */
export function sanitize(data) {
    if (!data) return '';
    return data
        .replace(/[<>]/g, '') // Remove caracteres HTML
        .replace(/javascript:/gi, '') // Remove protocolos javascript
        .trim();
}

/**
 * Função para validar se um valor está dentro de um intervalo
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - true se o valor estiver dentro do intervalo
 */
export function isInRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Função para formatar um número com separadores de milhar
 * @param {number} number - Número a ser formatado
 * @returns {string} - Número formatado
 */
export function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR').format(number);
}

/**
 * Função para formatar uma data
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Função para validar um email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se o email for válido
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Função para validar uma URL
 * @param {string} url - URL a ser validada
 * @returns {boolean} - true se a URL for válida
 */
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Função para gerar um ID único
 * @returns {string} - ID único
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Função para copiar texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} - true se o texto foi copiado com sucesso
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erro ao copiar texto:', err);
        return false;
    }
}

/**
 * Função para verificar se um elemento está visível na viewport
 * @param {Element} element - Elemento a ser verificado
 * @returns {boolean} - true se o elemento estiver visível
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Função para rolar suavemente até um elemento
 * @param {Element} element - Elemento alvo
 * @param {Object} options - Opções de scroll
 */
export function smoothScrollTo(element, options = {}) {
    const defaultOptions = {
        behavior: 'smooth',
        block: 'center'
    };
    element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Função para adicionar um tooltip a um elemento
 * @param {Element} element - Elemento que receberá o tooltip
 * @param {string} text - Texto do tooltip
 */
export function addTooltip(element, text) {
    element.setAttribute('title', text);
    element.setAttribute('data-tooltip', text);
}

/**
 * Função para remover um tooltip de um elemento
 * @param {Element} element - Elemento que terá o tooltip removido
 */
export function removeTooltip(element) {
    element.removeAttribute('title');
    element.removeAttribute('data-tooltip');
} 