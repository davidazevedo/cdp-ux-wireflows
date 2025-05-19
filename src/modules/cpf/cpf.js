import { CPFValidator } from '../../utils/cpfValidator.js';
import { Formatters } from '../../utils/formatters.js';
import { showMessage } from '../../utils/messages.js';

export class CpfModule {
    constructor() {
        this.validator = CPFValidator;
        this.formatter = Formatters;
    }

    validate(cpf) {
        return this.validator.validate(cpf);
    }

    format(cpf) {
        return this.formatter.formatCPF(cpf);
    }

    clean(cpf) {
        return this.formatter.clean(cpf);
    }

    showValidationMessage(message, type = 'info') {
        showMessage(message, type);
    }
}

export default new CpfModule(); 