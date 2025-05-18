import { Formatters } from './formatters.js';

export class CPFValidator {
    /**
     * Valida um número de CPF
     * @param {string} cpf - O CPF a ser validado
     * @returns {boolean} - true se o CPF for válido, false caso contrário
     */
    static validate(cpf) {
        if (!cpf) return false;
        
        // Remove caracteres não numéricos
        const numbers = Formatters.clean(cpf);
        
        // Verifica se tem 11 dígitos
        if (numbers.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(numbers)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(numbers.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit > 9) digit = 0;
        if (digit !== parseInt(numbers.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(numbers.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit > 9) digit = 0;
        if (digit !== parseInt(numbers.charAt(10))) return false;
        
        return true;
    }

    /**
     * Formata um número de CPF
     * @param {string} cpf - O CPF a ser formatado
     * @returns {string} - O CPF formatado
     */
    static format(cpf) {
        return Formatters.formatCPF(cpf);
    }

    /**
     * Limpa um número de CPF, removendo caracteres não numéricos
     * @param {string} cpf - O CPF a ser limpo
     * @returns {string} - O CPF limpo
     */
    static clean(cpf) {
        return Formatters.clean(cpf);
    }
} 