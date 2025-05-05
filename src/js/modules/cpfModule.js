import { showMessage } from '../../utils/messages.js';

export class CPFModule {
    constructor() {
        this.elements = {
            cpfInput: null,
            continueBtn: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }


    static format(cpf) {
        if (!cpf) return '';
        // Remove todos os caracteres não numéricos
        const numbers = cpf.replace(/\D/g, '');
        
        // Aplica a máscara do CPF
        if (numbers.length > 3) {
            const part1 = numbers.substring(0, 3);
            const part2 = numbers.substring(3, 6);
            const part3 = numbers.substring(6, 9);
            const part4 = numbers.substring(9, 11);
            
            if (numbers.length <= 6) {
                return `${part1}.${part2}`;
            } else if (numbers.length <= 9) {
                return `${part1}.${part2}.${part3}`;
            } else {
                return `${part1}.${part2}.${part3}-${part4}`;
            }
        }
        
        return numbers;
    }

    static validate(cpf) {
        if (!cpf) return false;
        
        // Remove todos os caracteres não numéricos
        const numbers = cpf.replace(/\D/g, '');
        
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

    static clean(cpf) {
        return cpf.replace(/\D/g, '');
    }
} 