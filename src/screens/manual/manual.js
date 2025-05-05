import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class ManualScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.elements = {};
        this.formData = {
            cep: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: ''
        };
        this.recognition = null;
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.updateFormState();
    }

    initializeElements() {
        this.elements = {
            cepInput: document.getElementById('cep'),
            streetInput: document.getElementById('street'),
            numberInput: document.getElementById('number'),
            complementInput: document.getElementById('complement'),
            neighborhoodInput: document.getElementById('neighborhood'),
            cityInput: document.getElementById('city'),
            stateInput: document.getElementById('state'),
            searchCepBtn: document.getElementById('searchCepBtn'),
            backBtn: document.getElementById('backBtn'),
            confirmBtn: document.getElementById('confirmBtn'),
            streetVoiceBtn: document.getElementById('streetVoiceBtn'),
            numberVoiceBtn: document.getElementById('numberVoiceBtn'),
            complementVoiceBtn: document.getElementById('complementVoiceBtn'),
            neighborhoodVoiceBtn: document.getElementById('neighborhoodVoiceBtn'),
            cityVoiceBtn: document.getElementById('cityVoiceBtn')
        };

        if (!this.validateElements()) {
            showMessage('Erro ao inicializar a tela. Por favor, recarregue a página.', 'error');
            return;
        }

        // Adiciona a classe input-wrapper aos containers de input
        Object.keys(this.elements).forEach(key => {
            if (key.endsWith('Input')) {
                const input = this.elements[key];
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    input.addEventListener('focus', () => wrapper.classList.add('focused'));
                    input.addEventListener('blur', () => wrapper.classList.remove('focused'));
                }
            }
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'pt-BR';

            this.recognition.onstart = () => {
                if (this.currentVoiceButton) {
                    this.currentVoiceButton.classList.add('recording');
                }
                showMessage('Ouvindo...', 'info');
            };

            this.recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                if (this.currentVoiceInput) {
                    this.currentVoiceInput.value = result;
                    this.updateFormState();
                    showMessage('Texto reconhecido com sucesso!', 'success');
                }
            };

            this.recognition.onerror = (event) => {
                showMessage('Erro ao reconhecer voz. Tente novamente.', 'error');
                console.error('Erro no reconhecimento de voz:', event.error);
                if (this.currentVoiceButton) {
                    this.currentVoiceButton.classList.remove('recording');
                }
            };

            this.recognition.onend = () => {
                if (this.currentVoiceButton) {
                    this.currentVoiceButton.classList.remove('recording');
                }
            };
        } else {
            showMessage('Seu navegador não suporta reconhecimento de voz.', 'warning');
            // Oculta os botões de voz se não houver suporte
            Object.keys(this.elements).forEach(key => {
                if (key.endsWith('VoiceBtn')) {
                    this.elements[key].style.display = 'none';
                }
            });
        }
    }

    handleVoiceInput(input, button) {
        if (!this.recognition) {
            showMessage('Reconhecimento de voz não disponível.', 'error');
            return;
        }

        // Se já estiver gravando, para a gravação atual
        if (this.currentVoiceButton && this.currentVoiceButton.classList.contains('recording')) {
            this.recognition.stop();
            return;
        }

        this.currentVoiceInput = input;
        this.currentVoiceButton = button;

        try {
            this.recognition.start();
        } catch (error) {
            showMessage('Erro ao iniciar reconhecimento de voz.', 'error');
            console.error('Erro ao iniciar reconhecimento:', error);
            button.classList.remove('recording');
        }
    }

    validateElements() {
        return Object.values(this.elements).every(element => element !== null);
    }

    initializeEventListeners() {
        if (!this.validateElements()) {
            return;
        }

        this.elements.searchCepBtn.addEventListener('click', () => this.handleCepSearch());
        this.elements.backBtn.addEventListener('click', () => this.handleBack());
        this.elements.confirmBtn.addEventListener('click', () => this.handleConfirm());
        
        // Add input validation
        this.elements.cepInput.addEventListener('input', (e) => this.formatCep(e));
        this.elements.numberInput.addEventListener('input', (e) => this.validateNumber(e));

        // Add form validation on input
        const inputElements = [
            this.elements.cepInput,
            this.elements.streetInput,
            this.elements.numberInput,
            this.elements.neighborhoodInput,
            this.elements.cityInput,
            this.elements.stateInput
        ];

        inputElements.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updateFormState());
            }
        });

        // Add voice input listeners
        const voiceInputs = {
            streetVoiceBtn: this.elements.streetInput,
            numberVoiceBtn: this.elements.numberInput,
            complementVoiceBtn: this.elements.complementInput,
            neighborhoodVoiceBtn: this.elements.neighborhoodInput,
            cityVoiceBtn: this.elements.cityInput
        };

        Object.entries(voiceInputs).forEach(([buttonKey, input]) => {
            const button = this.elements[buttonKey];
            if (button && input) {
                button.addEventListener('click', () => this.handleVoiceInput(input, button));
            }
        });
    }

    updateFormState() {
        const isCepValid = this.elements.cepInput.value.replace(/\D/g, '').length === 8;
        const isStreetValid = this.elements.streetInput.value.trim().length >= 3;
        const isNumberValid = this.elements.numberInput.value.trim().length >= 1;
        const isNeighborhoodValid = this.elements.neighborhoodInput.value.trim().length >= 3;
        const isCityValid = this.elements.cityInput.value.trim().length >= 3;
        const isStateValid = this.elements.stateInput.value.trim().length === 2;

        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.disabled = !(isCepValid && isStreetValid && isNumberValid && 
                isNeighborhoodValid && isCityValid && isStateValid);
        }
    }

    formatCep(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        event.target.value = value;
        this.updateFormState();
    }

    validateNumber(event) {
        event.target.value = event.target.value.replace(/\D/g, '');
        this.updateFormState();
    }

    async handleCepSearch() {
        const cep = this.elements.cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            showMessage('Por favor, insira um CEP válido', 'error');
            return;
        }

        try {
            this.showLoading();
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            this.elements.streetInput.value = data.logradouro;
            this.elements.neighborhoodInput.value = data.bairro;
            this.elements.cityInput.value = data.localidade;
            this.elements.stateInput.value = data.uf;

            this.elements.numberInput.focus();
            this.updateFormState();
            showMessage('Endereço encontrado com sucesso!', 'success');
        } catch (error) {
            showMessage('Erro ao buscar CEP. Por favor, tente novamente.', 'error');
            console.error('Erro na busca do CEP:', error);
        } finally {
            this.hideLoading();
        }
    }

    async handleBack() {
        try {
            await this.screenLoader.loadScreen('location');
        } catch (error) {
            showMessage('Erro ao voltar. Tente novamente.', 'error');
        }
    }

    async handleConfirm() {
        if (!this.validateElements()) {
            showMessage('Erro ao processar o formulário. Por favor, recarregue a página.', 'error');
            return;
        }

        try {
            this.showLoading();
            
            const locationData = {
                cep: this.elements.cepInput.value.trim(),
                street: this.elements.streetInput.value.trim(),
                number: this.elements.numberInput.value.trim(),
                complement: this.elements.complementInput.value.trim(),
                neighborhood: this.elements.neighborhoodInput.value.trim(),
                city: this.elements.cityInput.value.trim(),
                state: this.elements.stateInput.value.trim()
            };

            // Simula uma chamada à API para salvar a localização
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Salva os dados no localStorage
            localStorage.setItem('locationData', JSON.stringify(locationData));
            
            // Redireciona para a tela de resultados
            await this.screenLoader.loadScreen('result');
        } catch (error) {
            showMessage('Ocorreu um erro ao salvar sua localização. Por favor, tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.disabled = true;
            this.elements.confirmBtn.innerHTML = `
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                Carregando...
            `;
        }
    }

    hideLoading() {
        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.disabled = false;
            this.elements.confirmBtn.innerHTML = `
                <span class="material-icons">check</span>
                Confirmar
            `;
        }
    }
}

// Initialize the screen when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const manualLocationScreen = new ManualScreen();
});

