import { showMessage } from '../../utils/messages.js';

export class RegistrationModule {
    constructor() {
        this.elements = {
            registrationForm: null,
            skipRegistrationBtn: null,
            completeRegistrationBtn: null,
            govLoginBtn: null
        };
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.elements = {
            registrationForm: document.getElementById('registrationForm'),
            skipRegistrationBtn: document.getElementById('skipRegistrationBtn'),
            completeRegistrationBtn: document.getElementById('completeRegistrationBtn'),
            govLoginBtn: document.getElementById('govLoginBtn')
        };
    }

    initializeEventListeners() {
        if (this.elements.registrationForm) {
            this.elements.registrationForm.addEventListener('submit', this.handleSubmit.bind(this));
        }

        if (this.elements.skipRegistrationBtn) {
            this.elements.skipRegistrationBtn.addEventListener('click', this.handleSkip.bind(this));
        }

        if (this.elements.govLoginBtn) {
            this.elements.govLoginBtn.addEventListener('click', this.handleGovLogin.bind(this));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        // Aqui você pode adicionar a lógica para salvar os dados do formulário
        showMessage('Cadastro realizado com sucesso!', 'success');
        screenManager.showScreen('kitchens');
    }

    handleSkip() {
        showMessage('Cadastro pulado com sucesso!', 'info');
        screenManager.showScreen('kitchens');
    }

    handleGovLogin() {
        window.location.href = 'https://sso.acesso.gov.br/authorize';
    }
} 