export const config = {
    api: {
        baseUrl: 'https://api.cidadaoamigo.pe.gov.br',
        endpoints: {
            kitchens: '/kitchens',
            feedback: '/feedback',
            auth: '/auth'
        }
    },
    colors: {
        primary: '#1A5F7A',
        secondary: '#1351B4',
        success: '#388E3C',
        error: '#D32F2F',
        warning: '#F57C00',
        info: '#1976D2',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#333333'
    },
    messages: {
        cpf: {
            initial: 'Digite seu CPF para continuar',
            checking: 'Validando CPF...',
            invalid: 'CPF inválido. Por favor, verifique e tente novamente.',
            valid: 'CPF válido!',
            required: 'CPF é obrigatório'
        },
        feedback: {
            success: 'Feedback enviado com sucesso!',
            error: 'Erro ao enviar feedback. Tente novamente.'
        },
        location: {
            denied: 'Permissão de localização negada. Por favor, informe manualmente.',
            unavailable: 'Localização não disponível. Por favor, informe manualmente.',
            error: 'Erro ao obter localização. Por favor, tente novamente.'
        }
    }
}; 