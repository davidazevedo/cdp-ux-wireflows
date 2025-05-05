import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class RegistrationScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.nameInput = document.getElementById('nameInput');
        this.emailInput = document.getElementById('emailInput');
        this.phoneInput = document.getElementById('phoneInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.backBtn = document.getElementById('backBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.govBrBtn = document.getElementById('govBrBtn');

        // Verifica se todos os elementos necessários foram encontrados
        if (!this.nameInput || !this.emailInput || !this.phoneInput || !this.submitBtn || !this.backBtn || !this.skipBtn || !this.govBrBtn) {
            console.error('Elementos do formulário não encontrados');
            return;
        }
    }

    initializeEventListeners() {
        if (!this.submitBtn || !this.backBtn || !this.skipBtn || !this.govBrBtn) return;

        // Adiciona os event listeners
        this.submitBtn.addEventListener('click', () => this.handleSubmit());
        this.backBtn.addEventListener('click', () => this.handleBack());
        this.skipBtn.addEventListener('click', () => this.handleSkip());
        this.govBrBtn.addEventListener('click', () => this.handleGovBrLogin());
        
        // Validação em tempo real
        if (this.nameInput && this.emailInput && this.phoneInput) {
            this.nameInput.addEventListener('input', () => this.validateForm());
            this.emailInput.addEventListener('input', () => this.validateForm());
            this.phoneInput.addEventListener('input', () => this.validateForm());
        }
    }

    validateForm() {
        if (!this.nameInput || !this.emailInput || !this.phoneInput || !this.submitBtn) return;

        const name = this.nameInput.value.trim();
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();

        const isNameValid = name.length >= 3;
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isPhoneValid = phone.replace(/\D/g, '').length >= 10;

        // Adiciona/remove classes de erro
        this.nameInput.classList.toggle('error', !isNameValid);
        this.emailInput.classList.toggle('error', !isEmailValid);
        this.phoneInput.classList.toggle('error', !isPhoneValid);

        this.submitBtn.disabled = !(isNameValid && isEmailValid && isPhoneValid);
    }

    async handleSubmit() {
        if (!this.nameInput || !this.emailInput || !this.phoneInput) return;

        const currentAssisted = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            cpf: localStorage.getItem('userCPF')
        };

        try {
            this.showLoading();
            // Simula uma chamada de API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Armazena os dados no localStorage
            localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
            
            // Carrega a próxima tela
            await this.screenLoader.loadScreen('location');
        } catch (error) {
            console.error('Erro ao processar registro:', error);
            showMessage('Erro ao processar registro. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleBack() {
        try {
            await this.screenLoader.loadScreen('welcome');
        } catch (error) {
            console.error('Erro ao voltar para a tela anterior:', error);
            showMessage('Erro ao voltar para a tela anterior.', 'error');
        }
    }

    async handleSkip() {
        try {
            this.showLoading();
            // Simula um delay para feedback visual
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Armazena um registro vazio no localStorage para indicar que o usuário pulou o cadastro
            const currentAssisted = {
                name: '',
                email: '',
                phone: '',
                cpf: localStorage.getItem('userCPF'),
                skippedRegistration: true
            };
            
            localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
            
            // Carrega a próxima tela
            await this.screenLoader.loadScreen('location');
        } catch (error) {
            console.error('Erro ao pular cadastro:', error);
            showMessage('Erro ao pular cadastro. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleGovBrLogin() {
        try {
            this.showLoading();
            // Aqui você implementaria a integração com o gov.br
            // Por enquanto, apenas simulamos um delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simula o sucesso do login
            const govBrData = {
                name: 'Usuário Gov.br',
                email: 'usuario@gov.br',
                phone: '(00) 00000-0000',
                cpf: localStorage.getItem('userCPF')
            };
            
            localStorage.setItem('currentAssisted', JSON.stringify(govBrData));
            await this.screenLoader.loadScreen('location');
        } catch (error) {
            console.error('Erro ao fazer login com Gov.br:', error);
            showMessage('Erro ao fazer login com Gov.br. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        const loadingHtml = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Processando...</p>
            </div>
        `;
        document.getElementById('screens-container').innerHTML = loadingHtml;
    }

    hideLoading() {
        // O loading será removido automaticamente quando a nova tela for carregada
    }
} 