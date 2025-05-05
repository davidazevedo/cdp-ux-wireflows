import { ScreenLoader } from '../../utils/screenLoader.js';

export class SocialScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.loaderElement = document.querySelector('.screen-loader');
        this.loader = document.querySelector('.loader');
        this.govLoginBtn = document.getElementById('login-btn');
        
        if (!this.loaderElement || !this.loader || !this.govLoginBtn) {
            console.error('Elementos necessários não encontrados');
            return;
        }
    }

    setupEventListeners() {
        if (this.govLoginBtn) {
            this.govLoginBtn.addEventListener('click', () => this.handleGovLogin());
        }
    }

    async handleGovLogin() {
        try {
            this.showLoader();
            
            // Simula o processo de login
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Salva o estado do usuário
            localStorage.setItem('currentAssisted', JSON.stringify({
                origin: 'volunteer',
                name: 'Assistente Social',
                email: 'assistente@exemplo.com',
                cpf: '000.000.000-00',
                phone: '(00) 00000-0000'
            }));
            
            // Navega para a tela de voluntário usando o ScreenLoader
            const success = await this.screenLoader.loadScreen('volunteer');
            if (!success) {
                throw new Error('Falha ao carregar a tela de voluntário');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.hideLoader();
            alert('Erro ao realizar o login. Por favor, tente novamente.');
        }
    }

    showLoader() {
        if (this.loaderElement) {
            this.loaderElement.classList.add('active');
        }
    }

    hideLoader() {
        if (this.loaderElement) {
            this.loaderElement.classList.remove('active');
        }
    }
}

// Inicializa a tela quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SocialScreen();
}); 