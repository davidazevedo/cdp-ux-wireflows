import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class LocationScreen {
    constructor() {
        console.log('Iniciando LocationScreen...');
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        this.initializeElements();
        this.loadState();
        this.initializeCityAutocomplete();
    }

    loadState() {
        const currentAssisted = localStorage.getItem('currentAssisted');
        const userOrigin = localStorage.getItem('userOrigin');
        
        if (!currentAssisted || !userOrigin) {
            console.error('Estado do usuário não encontrado');
            showMessage('Erro ao carregar dados do usuário', 'error');
            this.screenLoader.loadScreen('welcome');
            return;
        }

        // Carrega dados salvos se existirem
        const locationData = localStorage.getItem('locationData');
        if (locationData) {
            const data = JSON.parse(locationData);
            if (this.elements.city) this.elements.city.value = data.city || '';
            if (this.elements.address) this.elements.address.value = data.address || '';
            if (this.elements.locationInput) this.elements.locationInput.value = data.location || '';
        }

        console.log('Estado carregado:', { currentAssisted: JSON.parse(currentAssisted), userOrigin });
    }

    initializeElements() {
        console.log('Inicializando elementos da localização...');
        this.elements = {
            locationForm: document.getElementById('locationForm'),
            city: document.getElementById('city'),
            address: document.getElementById('address'),
            locationInput: document.getElementById('locationInput'),
            getLocationBtn: document.getElementById('getLocationBtn'),
            continueBtn: document.getElementById('continueBtn'),
            backBtn: document.getElementById('backBtn'),
            citySuggestions: document.getElementById('citySuggestions')
        };

        if (this.elements.locationForm && this.elements.city && this.elements.address && 
            this.elements.locationInput && this.elements.getLocationBtn && 
            this.elements.continueBtn && this.elements.backBtn) {
            this.initializeEventListeners();
            this.updateButtonStates();
        } else {
            console.error('Alguns elementos não foram encontrados!');
            showMessage('Erro ao inicializar a tela. Por favor, recarregue a página.', 'error');
        }
    }

    initializeCityAutocomplete() {
        // Lista de municípios de Pernambuco
        const cities = [
            "Recife", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Petrolina",
            "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"
        ];

        if (this.elements.city && this.elements.citySuggestions) {
            this.elements.city.addEventListener('input', () => {
                const input = this.elements.city.value.toLowerCase();
                const filteredCities = cities.filter(city => 
                    city.toLowerCase().includes(input)
                );

                this.showCitySuggestions(filteredCities);
            });

            this.elements.city.addEventListener('blur', () => {
                setTimeout(() => {
                    if (this.elements.citySuggestions) {
                        this.elements.citySuggestions.style.display = 'none';
                    }
                }, 200);
            });
        }
    }

    showCitySuggestions(cities) {
        if (!this.elements.citySuggestions) return;

        this.elements.citySuggestions.innerHTML = '';
        this.elements.citySuggestions.style.display = 'block';

        cities.forEach(city => {
            const div = document.createElement('div');
            div.textContent = city;
            div.addEventListener('click', () => {
                if (this.elements.city) {
                    this.elements.city.value = city;
                    this.elements.citySuggestions.style.display = 'none';
                    this.updateButtonStates();
                }
            });
            this.elements.citySuggestions.appendChild(div);
        });
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners da localização...');
        
        if (this.elements.locationForm) {
            this.elements.locationForm.addEventListener('input', () => this.updateButtonStates());
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
    }

    updateButtonStates() {
        if (this.elements.continueBtn) {
            const city = this.elements.city?.value.trim();
            const location = this.elements.locationInput?.value.trim();
            const address = this.elements.address?.value.trim();

            // Validação do município
            if (this.elements.city) {
                if (!city) {
                    this.elements.city.classList.add('invalid');
                    const errorMessage = this.elements.city.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.textContent = 'Por favor, informe o município';
                        errorMessage.classList.add('show');
                    }
                } else {
                    this.elements.city.classList.remove('invalid');
                    const errorMessage = this.elements.city.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.classList.remove('show');
                    }
                }
            }

            // Validação da localização
            if (this.elements.locationInput) {
                if (!location) {
                    this.elements.locationInput.classList.add('invalid');
                    const errorMessage = this.elements.locationInput.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.textContent = 'Por favor, obtenha sua localização';
                        errorMessage.classList.add('show');
                    }
                } else {
                    this.elements.locationInput.classList.remove('invalid');
                    const errorMessage = this.elements.locationInput.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.classList.remove('show');
                    }
                }
            }

            // Habilita o botão apenas se todos os campos obrigatórios estiverem preenchidos
            const isValid = city && location;
            this.elements.continueBtn.disabled = !isValid;

            // Atualiza o texto do botão baseado no estado
            if (isValid) {
                this.elements.continueBtn.innerHTML = '<span class="material-icons">arrow_forward</span> Continuar';
                this.elements.continueBtn.classList.add('ready');
            } else {
                this.elements.continueBtn.innerHTML = '<span class="material-icons">arrow_forward</span> Preencha os campos obrigatórios';
                this.elements.continueBtn.classList.remove('ready');
            }
        }
    }

    async handleGetLocation() {
        try {
            if (!navigator.geolocation) {
                showMessage('Geolocalização não é suportada pelo seu navegador.', 'error');
                return;
            }

            // Desabilita o botão e mostra loading
            this.elements.getLocationBtn.disabled = true;
            this.elements.getLocationBtn.innerHTML = '<span class="material-icons">sync</span> Obtendo localização...';
            showMessage('Obtendo sua localização...', 'info');

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            
            // Usa a API do Nominatim para obter o endereço
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error('Erro ao obter endereço');
            }

            const data = await response.json();
            const address = data.display_name;
            const city = data.address.city || data.address.town || data.address.village || '';
            
            // Monta o endereço completo
            const street = data.address.road || data.address.pedestrian || '';
            const number = data.address.house_number || '';
            const neighborhood = data.address.suburb || data.address.neighbourhood || '';
            const fullAddress = `${street}${number ? ', ' + number : ''}${neighborhood ? ' - ' + neighborhood : ''}`;

            // Atualiza os campos
            if (this.elements.locationInput) {
                this.elements.locationInput.value = `${latitude}, ${longitude}`;
                this.elements.locationInput.classList.add('location-obtained');
            }
            if (this.elements.city && city) {
                this.elements.city.value = city;
                this.elements.city.classList.add('location-obtained');
            }
            if (this.elements.address && fullAddress) {
                this.elements.address.value = fullAddress;
                this.elements.address.classList.add('location-obtained');
            }

            // Atualiza o botão
            this.elements.getLocationBtn.innerHTML = '<span class="material-icons">check</span> Localização obtida';
            this.elements.getLocationBtn.disabled = true;

            showMessage('Localização obtida com sucesso!', 'success');

            // Salva os dados da localização
            const locationData = {
                latitude,
                longitude,
                address: fullAddress,
                city,
                location: `${latitude}, ${longitude}`,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('locationData', JSON.stringify(locationData));

            this.updateButtonStates();
            
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            
            // Adiciona mensagem de erro
            if (this.elements.locationInput) {
                this.elements.locationInput.classList.add('invalid');
                const errorMessage = this.elements.locationInput.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = 'Erro ao obter localização. Por favor, tente novamente ou digite manualmente.';
                    errorMessage.classList.add('show');
                }
            }
            
            showMessage('Erro ao obter localização. Por favor, tente novamente ou digite manualmente.', 'error');
            
            // Reseta o botão
            this.elements.getLocationBtn.disabled = false;
            this.elements.getLocationBtn.innerHTML = '<span class="material-icons">my_location</span> Obter Localização';
        }
    }

    async handleContinue() {
        const city = this.elements.city?.value.trim();
        const location = this.elements.locationInput?.value.trim();
        const address = this.elements.address?.value.trim();

        if (city && location) {
            try {
                // Atualiza os dados do usuário com a localização
                const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
                currentAssisted.location = location;
                currentAssisted.city = city;
                currentAssisted.address = address;
                currentAssisted.locationTimestamp = new Date().toISOString();
                localStorage.setItem('currentAssisted', JSON.stringify(currentAssisted));
                
                showMessage('Localização salva!', 'success');

                // Verifica se o CPF é nulo para determinar a próxima tela
                const nextScreen = currentAssisted.cpf === null ? 'volunteer' : 'result';
                const success = await this.screenLoader.loadScreen(nextScreen);
                
                if (!success) {
                    showMessage('Erro ao carregar próxima tela', 'error');
                }
            } catch (error) {
                console.error('Erro ao carregar próxima tela:', error);
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } else {
            showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
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
}

// Inicializa a tela quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LocationScreen();
}); 