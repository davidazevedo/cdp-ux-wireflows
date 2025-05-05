export function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit = remainder > 9 ? 0 : remainder;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    digit = remainder > 9 ? 0 : remainder;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
}

export function formatCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Limita a 11 dígitos
    cpf = cpf.substring(0, 11);

    // Aplica a máscara
    if (cpf.length <= 3) {
        return cpf;
    } else if (cpf.length <= 6) {
        return `${cpf.substring(0, 3)}.${cpf.substring(3)}`;
    } else if (cpf.length <= 9) {
        return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6)}`;
    } else {
        return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
    }
} 