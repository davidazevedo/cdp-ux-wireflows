import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class LocationScreen {
    constructor() {
        console.log('Iniciando LocationScreen...');
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        this.initializeElements();
        this.loadState();
        this.recognition = null;
        this.initializeSpeechRecognition();
    }

    loadState() {
        // Carrega o estado do usuário
        const currentAssisted = localStorage.getItem('currentAssisted');
        const userOrigin = localStorage.getItem('userOrigin');
        
        
        if (!currentAssisted || !userOrigin) {
            console.error('Estado do usuário não encontrado');
            showMessage('Erro ao carregar dados do usuário', 'error');
            this.screenLoader.loadScreen('welcome');
            return;
        }

        console.log('Estado carregado:', { currentAssisted: JSON.parse(currentAssisted), userOrigin });
    }

    initializeElements() {
        console.log('Inicializando elementos da localização...');
        this.elements = {
            locationInput: document.getElementById('locationInput'),
            getLocationBtn: document.getElementById('getLocationBtn'),
            continueBtn: document.getElementById('continueBtn'),
            backBtn: document.getElementById('backBtn'),
            validationMessage: document.getElementById('validationMessage'),
            inputWrapper: document.querySelector('.input-wrapper'),
            voiceInputBtn: document.getElementById('voiceInputBtn')
        };

        console.log('Elementos encontrados:', this.elements);

        if (this.elements.locationInput && this.elements.getLocationBtn && 
            this.elements.continueBtn && this.elements.backBtn && 
            this.elements.validationMessage && this.elements.inputWrapper &&
            this.elements.voiceInputBtn) {
            this.initializeEventListeners();
            this.updateButtonStates();
        } else {
            console.error('Alguns elementos não foram encontrados!');
            showMessage('Erro ao inicializar a tela. Por favor, recarregue a página.', 'error');
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'pt-BR';

            this.recognition.onstart = () => {
                console.log('Iniciando reconhecimento de voz...');
                if (this.elements.voiceInputBtn) {
                    this.elements.voiceInputBtn.classList.add('recording');
                }
            };

            this.recognition.onend = () => {
                console.log('Reconhecimento de voz finalizado.');
                if (this.elements.voiceInputBtn) {
                    this.elements.voiceInputBtn.classList.remove('recording');
                }
            };

            this.recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                console.log('Resultado do reconhecimento:', result);
                if (this.elements.locationInput) {
                    this.elements.locationInput.value = result;
                    this.updateButtonStates();
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Erro no reconhecimento de voz:', event.error);
                showMessage('Erro no reconhecimento de voz. Tente novamente.', 'error');
                if (this.elements.voiceInputBtn) {
                    this.elements.voiceInputBtn.classList.remove('recording');
                }
            };
        } else {
            console.warn('Reconhecimento de voz não suportado neste navegador.');
            if (this.elements.voiceInputBtn) {
                this.elements.voiceInputBtn.style.display = 'none';
            }
        }
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners da localização...');
        
        if (this.elements.locationInput) {
            this.elements.locationInput.addEventListener('input', this.handleLocationInput.bind(this));
            this.elements.locationInput.addEventListener('focus', () => {
                this.elements.inputWrapper.classList.add('focused');
            });
            this.elements.locationInput.addEventListener('blur', () => {
                this.elements.inputWrapper.classList.remove('focused');
            });
        }

        if (this.elements.getLocationBtn) {
            this.elements.getLocationBtn.addEventListener('click', this.handleGetLocation.bind(this));
        }

        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', this.handleContinue.bind(this));
        }

        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', this.handleBack.bind(this));
        }

        if (this.elements.voiceInputBtn) {
            this.elements.voiceInputBtn.addEventListener('click', this.handleVoiceInput.bind(this));
        }
    }

    updateButtonStates() {
        if (this.elements.continueBtn) {
            const location = this.elements.locationInput.value.trim();
            this.elements.continueBtn.disabled = !location;
        }
    }

    handleLocationInput() {
        this.updateButtonStates();
    }

    async handleGetLocation() {
        try {
            const position = await this.getCurrentPosition();
            const location = `${position.coords.latitude}, ${position.coords.longitude}`;
            this.elements.locationInput.value = location;
            this.updateButtonStates();
            showMessage('Localização obtida com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            showMessage('Erro ao obter localização. Por favor, insira manualmente.', 'error');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => reject(error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }

    async handleContinue() {
        const location = this.elements.locationInput.value.trim();
        if (location) {
            try {
                // Atualiza os dados do usuário com a localização
                const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
                currentAssisted.location = location;
                currentAssisted.locationTimestamp = new Date().toISOString();
                localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
                
                showMessage('Localização salva!', 'success');
                const success = await this.screenLoader.loadScreen('result');
                if (!success) {
                    showMessage('Erro ao carregar próxima tela', 'error');
                }
            } catch (error) {
                console.error('Erro ao carregar próxima tela:', error);
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } else {
            showMessage('Por favor, insira ou obtenha uma localização', 'error');
        }
    }

    async handleBack() {
        try {
            const success = await this.screenLoader.loadScreen('cpf');
            if (!success) {
                showMessage('Erro ao voltar para tela anterior', 'error');
            }
        } catch (error) {
            console.error('Erro ao voltar para tela anterior:', error);
            showMessage('Erro ao voltar para tela anterior', 'error');
        }
    }

    handleVoiceInput() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Erro ao iniciar reconhecimento de voz:', error);
                showMessage('Erro ao iniciar reconhecimento de voz. Tente novamente.', 'error');
            }
        } else {
            showMessage('Reconhecimento de voz não suportado neste navegador.', 'error');
        }
    }
}

// Inicializa a tela quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LocationScreen();
}); 