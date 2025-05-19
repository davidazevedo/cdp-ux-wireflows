import { showMessage } from '../../utils/messages.js';
import { CPFValidator } from '../../utils/cpfValidator.js';
import { Formatters } from '../../utils/formatters.js';
import { ScreenLoader } from '../../utils/screenLoader.js';
import { debounce, encrypt, sanitize, addTooltip, smoothScrollTo } from '../../utils/helpers.js';

export class CpfScreen {
    constructor() {
        console.log('Iniciando CpfScreen...');
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        this.elements = {};
        this.currentField = null;
        this.recognition = null;
        this.isRecording = false;
        this.validationTimeout = null;

        
    }

    async initialize() {
        console.log('Inicializando CpfScreen...');
        //this.clearLocalStorage();
       
        this.elements = {
            cpfInput: document.getElementById('cpfInput'),
            nisInput: document.getElementById('nisInput'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            voiceInputBtnNis: document.getElementById('voiceInputBtnNis'),
            continueBtn: document.getElementById('continueBtn'),
            backBtn: document.getElementById('backBtn'),
            validationMessage: document.getElementById('validationMessage'),
            validationMessageNis: document.getElementById('validationMessageNis'),
            inputWrapper: document.querySelector('.input-wrapper'),
            helpBtn: document.getElementById('helpBtn'),
            nisHelpBtn: document.getElementById('nisHelpBtn'),
            nisHelpModal: document.getElementById('nisHelpModal'),
            closeModalBtn: document.querySelector('.close-modal')
        };

        this.initializeElements();
        this.initializeVoiceRecognition();
    }


    clearLocalStorage() {
        console.log('Limpando localStorage...');
        localStorage.removeItem('currentAssisted');
        localStorage.removeItem('userOrigin');
        localStorage.removeItem('locationData');
        localStorage.removeItem('volunteerCache');

    }

    initializeElements() {
        console.log('Inicializando elementos do CPF...');
        
        // Adiciona tooltips aos elementos
        if (this.elements.cpfInput) addTooltip(this.elements.cpfInput, 'Digite seu CPF (opcional)');
        if (this.elements.nisInput) addTooltip(this.elements.nisInput, 'Digite seu NIS (opcional)');
        if (this.elements.voiceInputBtn) addTooltip(this.elements.voiceInputBtn, 'Usar reconhecimento de voz');
        if (this.elements.voiceInputBtnNis) addTooltip(this.elements.voiceInputBtnNis, 'Usar reconhecimento de voz');
        if (this.elements.helpBtn) addTooltip(this.elements.helpBtn, 'Precisa de ajuda?');
        if (this.elements.nisHelpBtn) addTooltip(this.elements.nisHelpBtn, 'Como encontrar meu NIS?');
        if (this.elements.nisHelpModal) addTooltip(this.elements.nisHelpModal, 'Como encontrar meu NIS?');
        
        console.log('Todos os elementos foram encontrados:', this.elements);
        this.initializeEventListeners();
        this.updateButtonStates();
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners...');

        // Event listeners para o CPF com debounce
        if (this.elements.cpfInput) {
            this.elements.cpfInput.addEventListener('input', debounce((e) => this.handleCPFInput(e), 300));
            this.elements.cpfInput.addEventListener('focus', () => {
                this.elements.inputWrapper.classList.add('focused');
                this.showValidationMessage('Digite seu CPF (opcional)', 'info');
            });
            this.elements.cpfInput.addEventListener('blur', () => {
                this.elements.inputWrapper.classList.remove('focused');
                this.validateField(this.elements.cpfInput);
            });
            this.elements.cpfInput.addEventListener('keypress', (event) => this.handleKeyPress(event));
        }

        // Event listeners para o NIS com debounce
        if (this.elements.nisInput) {
            this.elements.nisInput.addEventListener('input', debounce((e) => this.handleNISInput(e), 300));
            this.elements.nisInput.addEventListener('focus', () => {
                this.elements.inputWrapper.classList.add('focused');
                this.showValidationMessageNis('Digite seu NIS (opcional)', 'info');
            });
            this.elements.nisInput.addEventListener('blur', () => {
                this.elements.inputWrapper.classList.remove('focused');
                this.validateField(this.elements.nisInput);
            });
            this.elements.nisInput.addEventListener('keypress', (event) => this.handleKeyPress(event));
        }

        // Event listeners para os botões de voz
        if (this.elements.voiceInputBtn) {
            this.elements.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput('cpf'));
        }

        if (this.elements.voiceInputBtnNis) {
            this.elements.voiceInputBtnNis.addEventListener('click', () => this.toggleVoiceInput('nis'));
        }

        // Event listeners para os botões de ação
        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', () => this.handleContinue());
        }

        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => this.handleBack());
        }

        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.handleHelp());
        }

        // Event listeners para o modal de ajuda do NIS
        if (this.elements.nisHelpBtn) {
            this.elements.nisHelpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showNisHelpModal();
            });
        }

        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideNisHelpModal();
            });
        }

        // Fechar modal ao clicar fora dele
        if (this.elements.nisHelpModal) {
            this.elements.nisHelpModal.addEventListener('click', (event) => {
                if (event.target === this.elements.nisHelpModal) {
                    this.hideNisHelpModal();
                }
            });
        }

        // Prevenir que o clique no conteúdo do modal feche o modal
        const modalContent = this.elements.nisHelpModal?.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    updateButtonStates() {
        if (this.elements.continueBtn) {
            const cpf = Formatters.clean(this.elements.cpfInput.value);
            const nis = Formatters.clean(this.elements.nisInput.value);
            
            // Habilita o botão se ambos os campos estiverem vazios ou válidos
            const isCpfValid = !cpf || CPFValidator.validate(cpf);
            const isNisValid = !nis || nis.length === 11;
            
            this.elements.continueBtn.disabled = !(isCpfValid && isNisValid);
        }
    }

    handleCPFInput(e) {
        const value = sanitize(e.target.value);
        const formattedValue = Formatters.formatCPF(value);
        e.target.value = formattedValue;
        this.validateField(e.target);
    }

    handleNISInput(e) {
        const value = sanitize(e.target.value);
        const formattedValue = Formatters.formatNIS(value);
        e.target.value = formattedValue;
        this.validateField(e.target);
    }

    validateField(input) {
        const wrapper = input.parentElement;
        const validationMessage = wrapper.nextElementSibling;
        const value = Formatters.clean(input.value);

        if (input.id === 'cpf') {
            if (value && !CPFValidator.validate(value)) {
                wrapper.classList.add('invalid');
                wrapper.classList.remove('valid');
                validationMessage.textContent = 'CPF inválido';
                validationMessage.className = 'validation-message error';
            } else if (value) {
                wrapper.classList.add('valid');
                wrapper.classList.remove('invalid');
                validationMessage.textContent = 'CPF válido';
                validationMessage.className = 'validation-message success';
            } else {
                wrapper.classList.remove('valid', 'invalid');
                validationMessage.textContent = '';
            }
        } else if (input.id === 'nis') {
            if (value && value.length !== 11) {
                wrapper.classList.add('invalid');
                wrapper.classList.remove('valid');
                validationMessage.textContent = 'NIS deve ter 11 dígitos';
                validationMessage.className = 'validation-message error';
            } else if (value) {
                wrapper.classList.add('valid');
                wrapper.classList.remove('invalid');
                validationMessage.textContent = 'NIS válido';
                validationMessage.className = 'validation-message success';
            } else {
                wrapper.classList.remove('valid', 'invalid');
                validationMessage.textContent = '';
            }
        }

        this.updateButtonStates();
    }

    showValidationMessage(message, type) {
        if (!this.elements.validationMessage) return;
        
        this.elements.validationMessage.textContent = message;
        this.elements.validationMessage.className = 'validation-message';
        if (type) {
            this.elements.validationMessage.classList.add(type);
        }
    }

    showValidationMessageNis(message, type) {
        if (!this.elements.validationMessageNis) return;
        
        this.elements.validationMessageNis.textContent = message;
        this.elements.validationMessageNis.className = 'validation-message';
        if (type) {
            this.elements.validationMessageNis.classList.add(type);
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !this.elements.continueBtn.disabled) {
            this.handleContinue();
        }
    }

    async handleContinue() {
        const cpf = Formatters.clean(this.elements.cpfInput.value);
        const nis = Formatters.clean(this.elements.nisInput.value);
        
        // Se CPF ou NIS for fornecido, valida
        if (cpf && !CPFValidator.validate(cpf)) {
            this.showValidationMessage('CPF inválido!', 'error');
            smoothScrollTo(this.elements.cpfInput);
            return;
        }

        if (nis && nis.length !== 11) {
            this.showValidationMessageNis('NIS deve ter 11 dígitos!', 'error');
            smoothScrollTo(this.elements.nisInput);
            return;
        }

        try {
            // Salva CPF e NIS apenas se foram fornecidos, com criptografia
            const currentAssisted = {
                cpf: cpf ? encrypt(cpf) : null,
                nis: nis ? encrypt(nis) : null,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
            
            if (cpf || nis) {
                showMessage('CPF e NIS válidos!', 'success');
            }
            
            const success = await this.screenLoader.loadScreen('location');
            if (!success) {
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar próxima tela:', error);
            showMessage('Erro ao carregar próxima tela', 'error');
        }
    }

    async handleBack() {
        try {
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

    handleHelp() {
        showMessage('Precisa de ajuda? Entre em contato com o suporte.', 'info');
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
            
            if (this.currentField === 'cpf') {
                if (numbers.length === 11) {
                    // Aplica a máscara do CPF
                    const formattedCPF = numbers.slice(0, 3) + '.' + 
                                       numbers.slice(3, 6) + '.' + 
                                       numbers.slice(6, 9) + '-' + 
                                       numbers.slice(9);
                    this.elements.cpfInput.value = formattedCPF;
                }
            } else if (this.currentField === 'nis') {
                if (numbers.length === 11) {
                    this.elements.nisInput.value = numbers;
                }
            }
            
            this.updateButtonStates();
        };

        this.recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            showMessage('Erro no reconhecimento de voz. Tente novamente.', 'error');
            this.stopVoiceRecognition();
        };

        this.recognition.onend = () => {
            this.stopVoiceRecognition();
        };
    }

    toggleVoiceInput(field) {
        if (!this.recognition) {
            this.initializeVoiceRecognition();
        }

        if (this.isRecording) {
            this.stopVoiceRecognition();
        } else {
            this.currentField = field;
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        if (this.recognition) {
            try {
                this.recognition.start();
                this.isRecording = true;
                const button = this.currentField === 'cpf' ? this.elements.voiceInputBtn : this.elements.voiceInputBtnNis;
                button.classList.add('recording');
                showMessage('Gravando...', 'info');
            } catch (error) {
                console.error('Erro ao iniciar reconhecimento de voz:', error);
                showMessage('Erro ao iniciar reconhecimento de voz. Tente novamente.', 'error');
                this.stopVoiceRecognition();
            }
        }
    }

    stopVoiceRecognition() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Erro ao parar reconhecimento de voz:', error);
            }
        }
        this.isRecording = false;
        this.currentField = null;
        if (this.elements.voiceInputBtn) this.elements.voiceInputBtn.classList.remove('recording');
        if (this.elements.voiceInputBtnNis) this.elements.voiceInputBtnNis.classList.remove('recording');
    }

    showNisHelpModal() {
        if (this.elements.nisHelpModal) {
            this.elements.nisHelpModal.style.display = 'flex';
            setTimeout(() => {
                this.elements.nisHelpModal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    }

    hideNisHelpModal() {
        if (this.elements.nisHelpModal) {
            this.elements.nisHelpModal.classList.remove('show');
            setTimeout(() => {
                this.elements.nisHelpModal.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        }
    }
}

// Inicializa a tela
const cpfScreen = new CpfScreen();
cpfScreen.initialize(); 