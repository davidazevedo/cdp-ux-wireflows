import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class ConfirmationScreen {
    constructor() {
        console.log('Iniciando ConfirmationScreen...');
        this.initializeElements();
        this.setupEventListeners();
        this.loadState();
        this.screenLoader = new ScreenLoader();
    }

    initializeElements() {
        // Elementos do cabeçalho
        this.headerTitle = document.querySelector('.confirmation-header h1');
        
        // Elementos da cozinha
        this.kitchenName = document.getElementById('kitchen-name');
        this.kitchenAddress = document.getElementById('kitchen-address');
        this.kitchenTime = document.getElementById('kitchen-time');
        this.kitchenCapacity = document.getElementById('kitchen-capacity');
        
        // Elementos do formulário
        this.nameInput = document.getElementById('name');
        this.phoneInput = document.getElementById('phone');
        this.nameVoiceBtn = document.querySelector('label[for="name"] + .input-wrapper .voice-input');
        this.phoneVoiceBtn = document.querySelector('label[for="phone"] + .input-wrapper .voice-input');
        this.favoriteCheckbox = document.getElementById('favorite');
        this.confirmationForm = document.querySelector('.confirmation-form');
        
        // Elementos da pessoa atendida
        this.assistedInfo = document.querySelector('.assisted-info');
        this.assistedName = document.getElementById('assisted-name');
        this.assistedCpf = document.getElementById('assisted-cpf');
        this.assistedSituations = document.getElementById('assisted-situations');
        
        // Botões de ação
        this.confirmBtn = document.querySelector('.btn-primary');
        this.backBtn = document.querySelector('.btn-secondary');
        
        // Verificar se todos os elementos necessários estão presentes
        if (!this.headerTitle || !this.kitchenName || !this.kitchenAddress || 
            !this.kitchenTime || !this.kitchenCapacity || !this.confirmationForm || 
            !this.assistedInfo || !this.confirmBtn || !this.backBtn) {
            console.error('Elementos necessários não encontrados');
            return;
        }
    }

    setupEventListeners() {
        // Eventos dos campos de entrada (apenas para CPF)
        if (this.nameInput && this.phoneInput) {
            this.nameInput.addEventListener('input', () => this.validateForm());
            this.phoneInput.addEventListener('input', () => this.validateForm());
            
            // Eventos dos botões de voz
            this.nameVoiceBtn.addEventListener('click', () => this.startVoiceInput('name'));
            this.phoneVoiceBtn.addEventListener('click', () => this.startVoiceInput('phone'));
            
            // Evento do checkbox
            this.favoriteCheckbox.addEventListener('change', () => this.handleFavoriteChange());
        }
        
        // Eventos dos botões de ação
        this.confirmBtn.addEventListener('click', () => this.handleConfirm());
        this.backBtn.addEventListener('click', () => this.handleBack());
    }

    loadState() {
        try {
            // Carregar dados da cozinha selecionada
            const selectedKitchen = JSON.parse(localStorage.getItem('selectedKitchen'));
            if (!selectedKitchen) {
                throw new Error('Dados da cozinha não encontrados');
            }

            // Atualizar informações da cozinha
            this.kitchenName.textContent = selectedKitchen.name;
            this.kitchenAddress.textContent = selectedKitchen.address;
            this.kitchenTime.textContent = selectedKitchen.time;
            this.kitchenCapacity.textContent = selectedKitchen.capacity;

            // Verificar origem do usuário
            const userOrigin = localStorage.getItem('userOrigin');
            if (userOrigin === 'volunteer') {
                // Mostrar informações da pessoa atendida
                this.showAssistedInfo();
                this.confirmationForm.style.display = 'none';
                // Habilitar botão de confirmação para voluntários
                this.confirmBtn.disabled = false;
            } else {
                // Mostrar formulário de preenchimento
                this.assistedInfo.style.display = 'none';
                this.loadcurrentAssisted();
                // Validar formulário inicial
                this.validateForm();
            }
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
            this.showError('Erro ao carregar dados. Por favor, tente novamente.');
        }
    }

    showAssistedInfo() {
        try {
            const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
            if (!currentAssisted) {
                throw new Error('Dados da pessoa atendida não encontrados');
            }

            this.assistedName.textContent = currentAssisted.name || 'Não informado';
            this.assistedCpf.textContent = currentAssisted.cpf || 'Não informado';
            
            // Mostrar situações se existirem
            if (currentAssisted.situations && currentAssisted.situations.length > 0) {
                this.assistedSituations.innerHTML = currentAssisted.situations
                    .map(situation => `<span class="situation-tag">${situation}</span>`)
                    .join('');
            } else {
                this.assistedSituations.innerHTML = '<span class="no-situations">Nenhuma situação informada</span>';
            }
        } catch (error) {
            console.error('Erro ao carregar informações da pessoa atendida:', error);
            this.showError('Erro ao carregar dados da pessoa atendida.');
        }
    }

    loadcurrentAssisted() {
        const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
        if (currentAssisted) {
            this.nameInput.value = currentAssisted.name || '';
            this.phoneInput.value = currentAssisted.phone || '';
            this.favoriteCheckbox.checked = currentAssisted.favorite || false;
        }
    }

    validateForm() {
        if (localStorage.getItem('userOrigin') === 'volunteer') {
            this.confirmBtn.disabled = false;
            return;
        }

        const nameValid = this.nameInput.value.trim().length > 0;
        const phoneValid = this.phoneInput.value.trim().length > 0;
        
        this.confirmBtn.disabled = !(nameValid && phoneValid);
    }

    async startVoiceInput(field) {
        try {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'pt-BR';
            
            recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                if (field === 'name') {
                    this.nameInput.value = result;
                } else {
                    this.phoneInput.value = result;
                }
                this.validateForm();
            };
            
            recognition.onerror = (event) => {
                console.error('Erro no reconhecimento de voz:', event.error);
                this.showError('Erro ao reconhecer voz. Por favor, tente novamente.');
            };
            
            recognition.start();
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento de voz:', error);
            this.showError('Reconhecimento de voz não disponível neste navegador.');
        }
    }

    handleFavoriteChange() {
        const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted')) || {};
        currentAssisted.favorite = this.favoriteCheckbox.checked;
        localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
    }

    async handleConfirm() {
        try {
            this.showLoader();
            
            if (localStorage.getItem('userOrigin') === 'volunteer') {
                // Para voluntários, apenas navegar para a tela final
                this.screenLoader.loadScreen('final');
                return;
            }
            
            // Para CPF, salvar dados do usuário
            const currentAssisted = {
                name: this.nameInput.value.trim(),
                phone: this.phoneInput.value.trim(),
                favorite: this.favoriteCheckbox.checked
            };
            localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
            
            // Navegar para a tela final
            this.screenLoader.loadScreen('final');
        } catch (error) {
            console.error('Erro ao confirmar:', error);
            this.showError('Erro ao processar confirmação. Por favor, tente novamente.');
        } finally {
            this.hideLoader();
        }
    }

    handleBack() {
        window.history.back();
    }

    showLoader() {
        // Implementar loader se necessário
    }

    hideLoader() {
        // Implementar esconder loader se necessário
    }

    showError(message) {
        // Implementar exibição de erro se necessário
        console.error(message);
    }
}

// Inicializar a tela quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ConfirmationScreen();
}); 