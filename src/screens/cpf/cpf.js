import { showMessage } from '../../utils/messages.js';
import { CPFModule } from '../../js/modules/cpfModule.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class CpfScreen {
    constructor() {
        console.log('Iniciando CpfScreen...');
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        this.elements = {};
        this.currentField = null;
        this.recognition = null;
        this.validationTimeout = null;
        
        // Limpa todas as variáveis do localStorage ao iniciar
        this.clearLocalStorage();
        
        this.initializeElements();
        this.initializeVoiceRecognition();
    }

    clearLocalStorage() {
        console.log('Limpando localStorage...');
        localStorage.removeItem('currentAssisted');
        localStorage.removeItem('userOrigin');
        localStorage.removeItem('currentAssisted');
        localStorage.removeItem('locationData');
        localStorage.removeItem('volunteerCache');
        localStorage.setItem('userOrigin', 'cpf');
    }

    initializeElements() {
        console.log('Inicializando elementos do CPF...');
        this.elements = {
            cpfInput: document.getElementById('cpfInput'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            continueBtn: document.getElementById('continueBtn'),
            backBtn: document.getElementById('backBtn'),
            validationMessage: document.getElementById('validationMessage'),
            inputWrapper: document.querySelector('.input-wrapper')
        };

        console.log('Elementos encontrados:', this.elements);

        if (this.elements.cpfInput && this.elements.voiceInputBtn && 
            this.elements.continueBtn && this.elements.backBtn && 
            this.elements.validationMessage && this.elements.inputWrapper) {
            this.initializeEventListeners();
            this.updateButtonStates();
        } else {
            console.error('Alguns elementos não foram encontrados!');
            showMessage('Erro ao inicializar a tela. Por favor, recarregue a página.', 'error');
        }
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners do CPF...');
        
        if (this.elements.cpfInput) {
            this.elements.cpfInput.addEventListener('input', this.handleCPFInput.bind(this));
            this.elements.cpfInput.addEventListener('focus', () => {
                this.elements.inputWrapper.classList.add('focused');
            });
            this.elements.cpfInput.addEventListener('blur', () => {
                this.elements.inputWrapper.classList.remove('focused');
            });
            this.elements.cpfInput.addEventListener('keypress', this.handleKeyPress.bind(this));
        }

        if (this.elements.voiceInputBtn) {
            this.elements.voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        }

        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', this.handleContinue.bind(this));
        }

        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', this.handleBack.bind(this));
        }
    }

    updateButtonStates() {
        if (this.elements.continueBtn) {
            const cpf = CPFModule.clean(this.elements.cpfInput.value);
            this.elements.continueBtn.disabled = !CPFModule.validate(cpf);
        }
    }

    handleCPFInput(event) {
        const value = event.target.value;
        const formattedValue = CPFModule.format(value);
        event.target.value = formattedValue;
        this.updateButtonStates();
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !this.elements.continueBtn.disabled) {
            this.handleContinue();
        }
    }

    async handleContinue() {
        const cpf = CPFModule.clean(this.elements.cpfInput.value);
        if (CPFModule.validate(cpf)) {
            try {
                // Salva o CPF e marca a origem como 'cpf'
                const currentAssisted = {
                    cpf: cpf,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
                localStorage.setItem('userOrigin', 'cpf');
                
                showMessage('CPF válido!', 'success');
                const success = await this.screenLoader.loadScreen('location');
                if (!success) {
                    showMessage('Erro ao carregar próxima tela', 'error');
                }
            } catch (error) {
                console.error('Erro ao carregar próxima tela:', error);
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } else {
            showMessage('CPF inválido!', 'error');
        }
    }

    async handleBack() {
        try {
            // Limpa o estado ao voltar
            localStorage.removeItem('currentAssisted');
            localStorage.removeItem('userOrigin');
            
            const success = await this.screenLoader.loadScreen('welcome');
            if (!success) {
                showMessage('Erro ao voltar para tela anterior', 'error');
            }
        } catch (error) {
            console.error('Erro ao voltar para tela anterior:', error);
            showMessage('Erro ao voltar para tela anterior', 'error');
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.initializeVoiceRecognition();
        }

        if (this.isRecording) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    initializeVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showMessage('Seu navegador não suporta reconhecimento de voz.', 'error');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            const numbers = result.replace(/\D/g, '');
            if (numbers.length === 11) {
                this.elements.cpfInput.value = CPFModule.format(numbers);
                this.updateButtonStates();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            showMessage('Erro no reconhecimento de voz. Tente novamente.', 'error');
        };
    }

    startVoiceRecognition() {
        if (this.recognition) {
            this.recognition.start();
            this.isRecording = true;
            this.elements.voiceInputBtn.classList.add('recording');
            showMessage('Gravando...', 'info');
        }
    }

    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
            this.isRecording = false;
            this.elements.voiceInputBtn.classList.remove('recording');
        }
    }
}

// Inicializa a tela quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando CPFScreen...');
    window.cpfScreen = new CPFScreen();
}); 