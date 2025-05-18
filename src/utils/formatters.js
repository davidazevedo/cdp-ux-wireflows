export class Formatters {
    /**
     * Formata um número de CPF
     * @param {string} value - O valor a ser formatado
     * @returns {string} - O valor formatado
     */
    static formatCPF(value) {
        if (!value) return '';
        
        // Remove caracteres não numéricos
        const numbers = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        const limitedNumbers = numbers.slice(0, 11);
        
        // Aplica a máscara usando regex
        return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    /**
     * Formata um número de telefone
     * @param {string} value - O valor a ser formatado
     * @returns {string} - O valor formatado
     */
    static formatPhone(value) {
        if (!value) return '';
        
        // Remove caracteres não numéricos
        const numbers = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        const limitedNumbers = numbers.slice(0, 11);
        
        // Aplica a máscara baseada no tamanho
        if (limitedNumbers.length <= 10) {
            return limitedNumbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    }

    /**
     * Formata uma data
     * @param {string} value - O valor a ser formatado
     * @returns {string} - O valor formatado
     */
    static formatDate(value) {
        if (!value) return '';
        
        // Remove caracteres não numéricos
        const numbers = value.replace(/\D/g, '');
        
        // Limita a 8 dígitos
        const limitedNumbers = numbers.slice(0, 8);
        
        // Aplica a máscara
        return limitedNumbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }

    /**
     * Formata um número de NIS
     * @param {string} value - O valor a ser formatado
     * @returns {string} - O valor formatado
     */
    static formatNIS(value) {
        if (!value) return '';
        
        // Remove caracteres não numéricos
        const numbers = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        return numbers.slice(0, 11);
    }

    /**
     * Limpa um valor, removendo caracteres não numéricos
     * @param {string} value - O valor a ser limpo
     * @returns {string} - O valor limpo
     */
    static clean(value) {
        if (!value) return '';
        return value.replace(/\D/g, '');
    }
} 