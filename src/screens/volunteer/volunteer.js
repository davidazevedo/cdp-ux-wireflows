import { ScreenLoader } from '../../utils/screenLoader.js';

// Variável global para controlar o carregamento da API
let googleMapsLoading = false;
let googleMapsLoaded = false;

// Função para carregar a API do Google Maps
function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            googleMapsLoaded = true;
            resolve();
            return;
        }

        if (googleMapsLoading) {
            // Se já está carregando, aguarda o carregamento
            const checkLoaded = setInterval(() => {
                if (googleMapsLoaded) {
                    clearInterval(checkLoaded);
                    resolve();
                }
            }, 100);
            return;
        }

        googleMapsLoading = true;

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            googleMapsLoaded = true;
            resolve();
        };
        
        script.onerror = (error) => {
            googleMapsLoading = false;
            reject(error);
        };
        
        document.head.appendChild(script);
    });
}

export class VolunteerScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        
        // Initialize properties
        this.volunteerLocation = null;
        this.assistedLocation = null;
        this.assistedList = [];
        this.photoFile = null;
        this.volunteerData = {};
        
        // Add required fields array
        this.requiredFields = [
            'volunteer-name',
            'volunteerGender',
            'volunteer-birthdate',
            'volunteer-city',
            'volunteer-cpf',
            'volunteer-location'
        ];

        // Add assisted required fields array
        this.assistedRequiredFields = [
            'assisted-name',
            'assisted-cpf',
            'assisted-phone',
            'assisted-location'
        ];
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
        
        // Tornar o método navigateToKitchens disponível globalmente
        window.navigateToKitchens = (index) => this.navigateToKitchens(index);
        window.removeAssisted = (index) => this.removeAssisted(index);
    }

    initialize() {
        try {
            if (!this.screensContainer) {
                console.error('Container de telas não encontrado');
                return;
            }

            // Primeiro, inicializa os elementos
            this.initializeElements();
            
            // Depois, cria os modais
            this.createModals();
            
            // Continua com o resto da inicialização
            this.setupEventListeners();
            this.initializeVoiceInput();
            this.initializeSpeechRecognition();
            this.loadCachedData();
            this.initializeGeolocation();
            this.updateUIState();

            // Adiciona event listener para o botão de adicionar assistido
            const addAssistedBtn = document.getElementById('add-assisted');
            if (addAssistedBtn) {
                addAssistedBtn.addEventListener('click', () => {
                    console.log('Botão de adicionar assistido clicado');
                    this.showAssistedForm();
                });
            }

            // Adiciona event listener para o botão de fechar do modal
            const closeModalBtn = document.querySelector('#assisted-form .close-modal');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    console.log('Botão de fechar modal clicado');
                    this.hideAssistedForm();
                });
            }

        } catch (error) {
            console.error('Erro ao inicializar a tela:', error);
        }
    }

    initializeElements() {
        try {
            // Volunteer form elements
            this.volunteerForm = document.getElementById('volunteer-form');
            this.volunteerPhoto = document.getElementById('volunteer-photo');
            this.volunteerName = document.getElementById('volunteer-name');
            this.volunteerSocialName = document.getElementById('volunteer-social-name');
            this.volunteerBirthdate = document.getElementById('volunteer-birthdate');
            this.volunteerGender = document.getElementById('volunteerGender');
            this.volunteerCity = document.getElementById('volunteer-city');
            this.volunteerAddress = document.getElementById('volunteer-address');
            this.volunteerCpf = document.getElementById('volunteer-cpf');
            this.volunteerNis = document.getElementById('volunteer-nis');
            this.volunteerLocation = document.getElementById('volunteer-location');
            this.volunteerLocationBtn = document.getElementById('volunteer-location-btn');
            this.submitVolunteerBtn = document.getElementById('submit-volunteer');
            this.citySuggestions = document.getElementById('city-suggestions');

            // Assisted form elements
            this.assistedForm = document.getElementById('assisted-form');
            this.assistedPhoto = document.getElementById('assisted-photo');
            this.assistedName = document.getElementById('assisted-name');
            this.assistedNickname = document.getElementById('assisted-nickname');
            this.assistedCpf = document.getElementById('assisted-cpf');
            this.assistedNis = document.getElementById('assisted-nis');
            this.assistedPhone = document.getElementById('assisted-phone');
            this.assistedLocation = document.getElementById('assisted-location');
            this.assistedLocationBtn = document.getElementById('assisted-location-btn');
            this.situationsGrid = document.getElementById('situations-grid');
            this.submitAssistedBtn = document.getElementById('submit-assisted');

            // Other elements
            this.addAssistedBtn = document.getElementById('add-assisted');
            this.assistedList = document.getElementById('assisted-list');
            this.emptyListMessage = document.getElementById('empty-list-message');
            this.logoutBtn = document.getElementById('logoutBtn');

            // Volunteer profile elements
            this.volunteerProfile = document.querySelector('.volunteer-profile');
            this.volunteerAvatar = document.querySelector('.volunteer-avatar');
            this.volunteerInfo = document.querySelector('.volunteer-info');
            this.volunteerNameElement = document.querySelector('.volunteer-info h1');
            this.volunteerSubtitle = document.querySelector('.volunteer-info .subtitle');

            // Photo elements
            this.volunteerPhotoPreview = document.getElementById('volunteer-photo-preview');
            this.assistedPhotoPreview = document.getElementById('assisted-photo-preview');

            // Verifica se os elementos necessários foram encontrados
            if (!this.volunteerForm) {
                console.error('Formulário de cidadão apoiador não encontrado');
            }

            // Aplicar máscaras
            this.applyMasks();

            // Inicializar autocomplete de municípios
            this.initializeCityAutocomplete();

            // Add social name elements
            this.socialNameGroup = document.getElementById('social-name-group');
            this.socialNameCheckbox = document.getElementById('social-name-checkbox');

            // Add gender event listener
            if (this.volunteerGender) {
                this.volunteerGender.addEventListener('change', () => this.handleGenderChange());
            }

            // Add social name checkbox event listener
            if (this.socialNameCheckbox) {
                this.socialNameCheckbox.addEventListener('change', () => this.handleSocialNameCheckbox());
            }

            // Hide social name group initially
            if (this.socialNameGroup) {
                this.socialNameGroup.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao inicializar elementos:', error);
        }
    }

    applyMasks() {
        try {
            // CPF mask
            if (this.volunteerCpf) {
                this.volunteerCpf.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        value = value.replace(/(\d{3})(\d)/, '$1.$2');
                        value = value.replace(/(\d{3})(\d)/, '$1.$2');
                        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        e.target.value = value;
                    }
                });
            }

            if (this.assistedCpf) {
                this.assistedCpf.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        value = value.replace(/(\d{3})(\d)/, '$1.$2');
                        value = value.replace(/(\d{3})(\d)/, '$1.$2');
                        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        e.target.value = value;
                    }
                });
            }

            // Birth date mask
            if (this.volunteerBirthdate) {
                this.volunteerBirthdate.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                        value = value.replace(/(\d{2})(\d)/, '$1/$2');
                        value = value.replace(/(\d{2})(\d)/, '$1/$2');
                        e.target.value = value;
                    }
                });
            }

            // Phone mask
            if (this.assistedPhone) {
                this.assistedPhone.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        if (value.length <= 10) {
                            value = value.replace(/(\d{2})(\d)/, '($1) $2');
                            value = value.replace(/(\d{4})(\d)/, '$1-$2');
                        } else {
                            value = value.replace(/(\d{2})(\d)/, '($1) $2');
                            value = value.replace(/(\d{5})(\d)/, '$1-$2');
                        }
                        e.target.value = value;
                    }
                });

                // Handle paste event
                this.assistedPhone.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                    let value = pastedData;
                    if (value.length <= 11) {
                        if (value.length <= 10) {
                            value = value.replace(/(\d{2})(\d)/, '($1) $2');
                            value = value.replace(/(\d{4})(\d)/, '$1-$2');
                        } else {
                            value = value.replace(/(\d{2})(\d)/, '($1) $2');
                            value = value.replace(/(\d{5})(\d)/, '$1-$2');
                        }
                        e.target.value = value;
                    }
                });
            }

            // NIS mask (11 digits)
            if (this.volunteerNis) {
                this.volunteerNis.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        e.target.value = value;
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao aplicar máscaras:', error);
        }
    }

    initializeCityAutocomplete() {
        // Lista de municípios de Pernambuco (exemplo)
        const cities = [
            "Recife", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Petrolina",
            "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"
        ];

        this.volunteerCity.addEventListener('input', () => {
            const input = this.volunteerCity.value.toLowerCase();
            const filteredCities = cities.filter(city => 
                city.toLowerCase().includes(input)
            );

            this.showCitySuggestions(filteredCities);
        });

        this.volunteerCity.addEventListener('blur', () => {
            setTimeout(() => {
                this.citySuggestions.style.display = 'none';
            }, 200);
        });
    }

    showCitySuggestions(cities) {
        this.citySuggestions.innerHTML = '';
        this.citySuggestions.style.display = 'block';

        cities.forEach(city => {
            const div = document.createElement('div');
            div.textContent = city;
            div.addEventListener('click', () => {
                this.volunteerCity.value = city;
                this.citySuggestions.style.display = 'none';
            });
            this.citySuggestions.appendChild(div);
        });
    }

    validateForm() {
        let isValid = true;
        const errors = [];

        // Validar nome
        if (!this.volunteerName.value.trim()) {
            errors.push('Por favor, preencha o campo obrigatório: Nome Completo');
            isValid = false;
        }

        // Validar município
        if (!this.volunteerCity.value.trim()) {
            errors.push('Por favor, preencha o campo obrigatório: Município');
            isValid = false;
        }

        // Validar CPF
        if (this.volunteerCpf.value && !this.validateCPF(this.volunteerCpf.value)) {
            errors.push('O CPF informado não é válido. Verifique e tente novamente.');
            isValid = false;
        }

        // Validar data de nascimento
        if (this.volunteerBirthdate.value && !this.validateBirthDate(this.volunteerBirthdate.value)) {
            errors.push('Informe uma data válida no formato dd/mm/aaaa.');
            isValid = false;
        }

        // Validar situação de rua
        const homelessRadio = document.querySelector('input[name="homeless"]:checked');
        if (!homelessRadio) {
            errors.push('Por favor, informe se está em situação de rua.');
            isValid = false;
        }

        // Validar quem está preenchendo
        const fillingForCheckbox = document.querySelector('input[name="filling_for"]:checked');
        if (!fillingForCheckbox) {
            errors.push('Por favor, informe quem está preenchendo o formulário.');
            isValid = false;
        }

        // Validar localização
        if (!this.volunteerLocation.value) {
            errors.push('Por favor, obtenha a localização.');
            isValid = false;
        }

        return { isValid, errors };
    }

    validateBirthDate(date) {
        // Check format
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
            return false;
        }

        // Split date
        const [day, month, year] = date.split('/').map(Number);

        // Check if date is valid
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getFullYear() !== year || 
            dateObj.getMonth() !== month - 1 || 
            dateObj.getDate() !== day) {
            return false;
        }

        // Check if date is not in the future
        const today = new Date();
        if (dateObj > today) {
            return false;
        }

        // Check if age is reasonable (between 0 and 120 years)
        const age = today.getFullYear() - year;
        if (age < 0 || age > 120) {
            return false;
        }

        return true;
    }

    handleLogout() {
        if (confirm('Tem certeza que deseja sair? Todos os dados serão apagados.')) {
            // Limpa todos os dados do localStorage
            localStorage.removeItem('volunteerCache');
            localStorage.removeItem('assistedList');
            
            // Reseta o estado da aplicação
            this.assistedList = [];
            this.volunteerLocation = null;
            this.assistedLocation = null;
            this.locationConfirmed = false;
            
            // Atualiza a UI
            this.updateUIState();
            
            // Navega para a tela inicial
            this.screenLoader.loadScreen('welcome');
        }
    }

    addLocationButtons() {
        // Add location button to volunteer form
        const volunteerLocationGroup = document.createElement('div');
        volunteerLocationGroup.className = 'form-group';
        volunteerLocationGroup.appendChild(this.volunteerLocationBtn);
        this.volunteerForm.querySelector('.form-section').appendChild(volunteerLocationGroup);

        // Add location button to assisted form
        const assistedLocationGroup = document.createElement('div');
        assistedLocationGroup.className = 'form-group';
        assistedLocationGroup.appendChild(this.assistedLocationBtn);
        this.assistedForm.appendChild(assistedLocationGroup);
    }

    createLocationButton(id) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'location-btn';
        btn.id = id;
        btn.innerHTML = '<span class="material-icons">location_on</span> Obter Localização';
        btn.addEventListener('click', () => this.getLocation(btn));
        return btn;
    }

    initializeGeolocation() {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser.');
            return;
        }
    }

    async getLocation(button) {
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocalização não é suportada neste navegador');
            }

            // Desabilita o botão e mostra indicador de carregamento
            button.disabled = true;
            button.innerHTML = '<span class="material-icons">sync</span> Obtendo localização...';

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            // Determina qual input deve receber a localização
            const locationInput = button.id === 'volunteer-location-btn' 
                ? document.getElementById('volunteer-location')
                : document.getElementById('assisted-location');

            if (locationInput) {
                locationInput.value = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
                locationInput.classList.add('location-obtained');
                
                // Atualiza o botão para mostrar sucesso
                button.innerHTML = '<span class="material-icons">check_circle</span> Localização obtida';
                button.classList.add('success');
                
                // Habilita o botão novamente após 2 segundos
                setTimeout(() => {
                    button.disabled = false;
                }, 2000);
            }

        } catch (error) {
            console.error('Erro ao obter localização:', error);
            
            // Atualiza o botão para mostrar erro
            button.innerHTML = '<span class="material-icons">error</span> Erro ao obter localização';
            button.classList.add('error');
            
            // Habilita o botão novamente após 2 segundos
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = '<span class="material-icons">location_on</span> Obter Localização';
                button.classList.remove('error');
            }, 2000);
            
            alert('Não foi possível obter a localização. Por favor, verifique as permissões do navegador e tente novamente.');
        }
    }

    showLocationInfo(form, location) {
        const existingInfo = form.querySelector('.location-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        const locationInfo = document.createElement('div');
        locationInfo.className = 'location-info';
        locationInfo.innerHTML = `
            <span class="material-icons">location_on</span>
            <span>Lat: ${location.latitude.toFixed(6)}, Long: ${location.longitude.toFixed(6)}</span>
        `;
        form.appendChild(locationInfo);
    }

    addMicrophoneButtons() {
        // Add microphone button to name input
        const nameGroup = this.volunteerName.parentElement;
        const nameMicBtn = this.createMicrophoneButton(this.volunteerName);
        nameGroup.appendChild(nameMicBtn);

        // Add microphone button to assisted name input
        const assistedNameInput = document.getElementById('assistedName');
        if (assistedNameInput) {
            const assistedNameGroup = assistedNameInput.parentElement;
            const assistedNameMicBtn = this.createMicrophoneButton(assistedNameInput);
            assistedNameGroup.appendChild(assistedNameMicBtn);
        }
    }

    createMicrophoneButton(inputElement) {
        const micBtn = document.createElement('button');
        micBtn.type = 'button';
        micBtn.className = 'mic-btn';
        micBtn.innerHTML = '<span class="material-icons">mic</span>';
        micBtn.addEventListener('click', () => this.startSpeechRecognition(inputElement));
        return micBtn;
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pt-BR';

        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            if (this.currentInput) {
                this.currentInput.classList.add('listening');
            }
        };

        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            if (this.currentInput) {
                this.currentInput.classList.remove('listening');
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.currentInput) {
                this.currentInput.value = transcript;
                this.validateInput(this.currentInput);
                this.checkFormValidity();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.currentInput) {
                this.currentInput.classList.remove('listening');
            }
        };
    }

    handleVoiceInput(button) {
        const inputId = button.getAttribute('data-input');
        const input = document.getElementById(inputId);
        
        if (!input) {
            console.error('Input element not found:', inputId);
            return;
        }

        try {
            if (!this.recognition) {
                this.initializeSpeechRecognition();
            }

            if (button.classList.contains('listening')) {
                this.recognition.stop();
                button.classList.remove('listening');
                return;
            }

            this.currentInput = input;
            button.classList.add('listening');
            this.recognition.start();
        } catch (error) {
            console.error('Error in voice input:', error);
            button.classList.remove('listening');
        }
    }

    setupEventListeners() {
        try {
            if (!this.volunteerPhotoPreview || !this.volunteerPhoto) {
                console.error('Photo elements not found');
                return;
            }

            // Volunteer form event listeners
            if (this.volunteerPhoto) {
                this.volunteerPhoto.addEventListener('change', (event) => this.handlePhotoUpload(event, 'volunteer'));
            }
            if (this.volunteerPhotoPreview) {
                this.volunteerPhotoPreview.addEventListener('click', () => this.volunteerPhoto?.click());
            }

            // Assisted form event listeners
            const addAssistedBtn = document.getElementById('add-assisted');
            if (addAssistedBtn) {
                addAssistedBtn.addEventListener('click', () => {
                    console.log('Botão de adicionar assistido clicado (setupEventListeners)');
                    this.showAssistedForm();
                });
            }

            // Add close button event listener for assisted form
            const closeAssistedFormBtn = document.querySelector('#assisted-form .close-modal');
            if (closeAssistedFormBtn) {
                closeAssistedFormBtn.addEventListener('click', () => {
                    console.log('Botão de fechar modal clicado (setupEventListeners)');
                    this.hideAssistedForm();
                });
            }

            // Add submit button event listener for assisted form
            const submitAssistedBtn = document.getElementById('submit-assisted');
            if (submitAssistedBtn) {
                submitAssistedBtn.addEventListener('click', () => {
                    console.log('Botão de submit do formulário de assistido clicado');
                    this.handleAssistedSubmit();
                });
            }

            // Add photo upload event listeners for assisted form
            const assistedPhoto = document.getElementById('assisted-photo');
            const assistedPhotoPreview = document.getElementById('assisted-photo-preview');
            if (assistedPhoto && assistedPhotoPreview) {
                assistedPhoto.addEventListener('change', (event) => this.handlePhotoUpload(event, 'assisted'));
                assistedPhotoPreview.addEventListener('click', () => assistedPhoto.click());
            }

            // Add location button event listener for assisted form
            const assistedLocationBtn = document.getElementById('assisted-location-btn');
            if (assistedLocationBtn) {
                assistedLocationBtn.addEventListener('click', () => this.getLocation(assistedLocationBtn));
            }

            // Modal close events
            this.elements.closeModalBtn.forEach(button => {
                button.addEventListener('click', () => this.closeModals());
            });

            // Voice input events
            this.initializeVoiceInput();

            // Logout event
            if (this.logoutBtn) {
                this.logoutBtn.addEventListener('click', () => this.handleLogout());
            }

            // Add CPF validation
            if (this.volunteerCpf) {
                this.volunteerCpf.addEventListener('blur', () => {
                    const cpf = this.volunteerCpf.value;
                    const errorMessage = this.volunteerCpf.parentElement.nextElementSibling;
                    
                    if (cpf && !this.validateCPF(cpf)) {
                        errorMessage.textContent = 'CPF inválido';
                        errorMessage.classList.add('show');
                        this.volunteerCpf.classList.add('invalid');
                    } else {
                        errorMessage.classList.remove('show');
                        this.volunteerCpf.classList.remove('invalid');
                    }
                });
            }

            if (this.assistedCpf) {
                this.assistedCpf.addEventListener('blur', () => {
                    const cpf = this.assistedCpf.value;
                    const errorMessage = this.assistedCpf.parentElement.nextElementSibling;
                    
                    if (cpf && !this.validateCPF(cpf)) {
                        errorMessage.textContent = 'CPF inválido';
                        errorMessage.classList.add('show');
                        this.assistedCpf.classList.add('invalid');
                    } else {
                        errorMessage.classList.remove('show');
                        this.assistedCpf.classList.remove('invalid');
                    }
                });
            }

            // Add birth date validation
            if (this.volunteerBirthdate) {
                this.volunteerBirthdate.addEventListener('blur', () => {
                    const date = this.volunteerBirthdate.value;
                    const errorMessage = this.volunteerBirthdate.parentElement.nextElementSibling;
                    
                    if (date && !this.validateBirthDate(date)) {
                        errorMessage.textContent = 'Data de nascimento inválida';
                        errorMessage.classList.add('show');
                        this.volunteerBirthdate.classList.add('invalid');
                    } else {
                        errorMessage.classList.remove('show');
                        this.volunteerBirthdate.classList.remove('invalid');
                    }
                });
            }

            // Add input event listeners for form validation
            this.requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => this.checkFormValidity());
                }
            });

            this.assistedRequiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => this.checkAssistedFormValidity());
                }
            });

            // Add form submission event listener
            if (this.volunteerForm) {
                this.volunteerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleVolunteerSubmit();
                });
            }

            // Add click event listener for submit button
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.addEventListener('click', () => {
                    this.handleVolunteerSubmit();
                });
            }

            // Add auto-fill button event listener
            const autoFillBtn = document.getElementById('auto-fill');
            if (autoFillBtn) {
                autoFillBtn.addEventListener('click', () => this.autoFillForm());
            }

            // Adicionar listeners para validação em tempo real
            const formInputs = document.querySelectorAll('#volunteer-form input, #volunteer-form select');
            formInputs.forEach(input => {
                input.addEventListener('input', () => {
                    console.log('Input changed:', input.id, input.value);
                    this.checkFormValidity();
                });
                input.addEventListener('change', () => {
                    console.log('Change event:', input.id, input.value);
                    this.checkFormValidity();
                });
            });

            // Adicionar listener para radio buttons e checkboxes
            const radioGroups = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
            radioGroups.forEach(input => {
                input.addEventListener('change', () => {
                    console.log('Radio/Checkbox changed:', input.name, input.checked);
                    this.checkFormValidity();
                });
            });
        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (input.id) {
            case 'name':
                isValid = value.length >= 3;
                errorMessage = 'Nome deve ter pelo menos 3 caracteres';
                break;
            case 'cpf':
                isValid = this.validateCPF(value);
                errorMessage = 'CPF inválido';
                break;
            case 'phone':
                isValid = value.replace(/\D/g, '').length >= 10;
                errorMessage = 'Telefone inválido';
                break;
        }

        this.updateInputValidation(input, isValid, errorMessage);
        return isValid;
    }

    validateCPF(cpf) {
        // Remove all non-numeric characters
        cpf = cpf.replace(/[^\d]/g, '');

        // Check if it has 11 digits
        if (cpf.length !== 11) {
            return false;
        }

        // Check if all digits are the same
        if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        // Validate first digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        if (remainder !== parseInt(cpf.charAt(9))) {
            return false;
        }

        // Validate second digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) {
            remainder = 0;
        }
        if (remainder !== parseInt(cpf.charAt(10))) {
            return false;
        }

        return true;
    }

    updateInputValidation(input, isValid, errorMessage) {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message') || document.createElement('div');
        
        if (!formGroup.querySelector('.error-message')) {
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }

        if (!isValid) {
            input.classList.add('invalid');
            errorElement.textContent = errorMessage;
        } else {
            input.classList.remove('invalid');
            errorElement.textContent = '';
        }
    }

    formatCPF() {
        let value = this.volunteerCpf.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            this.volunteerCpf.value = value;
        }
    }

    formatPhone() {
        let value = this.volunteerPhone.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            this.volunteerPhone.value = value;
        }
    }

    async handlePhotoUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photoData = e.target.result;
            const previewElement = type === 'volunteer' ? this.volunteerPhotoPreview : this.assistedPhotoPreview;
            
            if (previewElement) {
                previewElement.innerHTML = '';
                const img = document.createElement('img');
                img.src = photoData;
                img.alt = 'Foto do ' + (type === 'volunteer' ? 'voluntário' : 'assistido');
                previewElement.appendChild(img);
            }

            this.savePhotoToCache(photoData, type);
        };

        reader.readAsDataURL(file);
    }

    savePhotoToCache(photoData, type) {
        const cache = JSON.parse(localStorage.getItem('volunteerCache') || '{}');
        
        if (type === 'volunteer') {
            cache.volunteer = {
                ...cache.volunteer,
                photo: photoData
            };
        } else {
            cache.assisted = {
                ...cache.assisted,
                photo: photoData
            };
        }
        
        localStorage.setItem('volunteerCache', JSON.stringify(cache));
    }

    async handleVolunteerSubmit() {
        const { isValid, errors } = this.validateForm();
        
        if (!isValid) {
            errors.forEach(error => {
                alert(error);
            });
            return;
        }

        const formData = {
            name: this.volunteerName.value,
            socialName: this.volunteerSocialName.value,
            birthdate: this.volunteerBirthdate.value,
            gender: this.volunteerGender.value,
            city: this.volunteerCity.value,
            address: this.volunteerAddress.value,
            cpf: this.volunteerCpf.value,
            nis: this.volunteerNis.value,
            homeless: document.querySelector('input[name="homeless"]:checked').value,
            fillingFor: Array.from(document.querySelectorAll('input[name="filling_for"]:checked')).map(cb => cb.value),
            location: this.volunteerLocation.value,
            photo: this.volunteerPhoto.files[0],
            role: 'volunteer'
        };

        try {
            this.submitVolunteerBtn.disabled = true;
            this.submitVolunteerBtn.innerHTML = '<span class="material-icons">sync</span> Salvando...';

            // Salvar no localStorage como userData
            localStorage.setItem('userData', JSON.stringify(formData));
            
            // Atualizar o perfil do voluntário
            this.updateVolunteerProfile(formData.name, formData.photo);
            
            // Atualizar o estado da UI
            this.updateUIState();
            
            this.submitVolunteerBtn.innerHTML = '<span class="material-icons">check</span> Dados recebidos com sucesso!';
            this.submitVolunteerBtn.style.backgroundColor = 'var(--success-color)';

            setTimeout(() => {
                this.submitVolunteerBtn.disabled = false;
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                this.submitVolunteerBtn.style.backgroundColor = 'var(--primary-color)';
            }, 2000);

        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            alert('Houve um problema ao enviar seus dados. Tente novamente mais tarde.');
            this.submitVolunteerBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
            this.submitVolunteerBtn.style.backgroundColor = 'var(--error-color)';
        }
    }

    loadCachedData() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData && userData.role === 'volunteer') {
            const now = new Date().getTime();
            const oneDay = 24 * 60 * 60 * 1000;

            if (now - userData.timestamp < oneDay) {
                // Preencher formulário com dados em cache
                this.volunteerCpf.value = userData.cpf || '';
                this.volunteerName.value = userData.name || '';
                this.volunteerSocialName.value = userData.socialName || '';
                this.volunteerBirthdate.value = userData.birthdate || '';
                this.volunteerGender.value = userData.gender || '';
                this.volunteerCity.value = userData.city || '';
                this.volunteerAddress.value = userData.address || '';
                this.volunteerNis.value = userData.nis || '';
                
                if (userData.photo) {
                    const photoPreview = document.getElementById('volunteer-photo-preview');
                    const avatar = document.querySelector('.volunteer-avatar');
                    
                    if (photoPreview) {
                        photoPreview.style.backgroundImage = `url(${userData.photo})`;
                        photoPreview.classList.add('has-photo');
                    }
                    
                    if (avatar) {
                        avatar.style.backgroundImage = `url(${userData.photo})`;
                        avatar.classList.add('has-photo');
                    }
                }

                if (userData.location) {
                    this.volunteerLocation.value = userData.location;
                    this.showLocationInfo(this.elements.volunteerForm, userData.location);
                    this.volunteerLocationBtn.innerHTML = '<span class="material-icons">check_circle</span> Localização Obtida';
                    this.volunteerLocationBtn.disabled = true;
                }

                // Carregar lista de assistidos do cache
                if (userData.assistedList) {
                    this.assistedList = userData.assistedList;
                }

                // Update profile
                this.updateVolunteerProfile(userData.name, userData.photo);

                // Update UI state
                this.updateUIState();
            } else {
                // Cache expirado
                localStorage.removeItem('userData');
                this.assistedList = [];
                this.updateUIState();
            }
        } else {
            // Cache vazio - habilitar formulário
            this.assistedList = [];
            this.updateUIState();
        }
    }

    showAssistedForm() {
        const assistedForm = document.getElementById('assisted-form');
        if (assistedForm) {
            assistedForm.style.display = 'flex';
            assistedForm.classList.add('active');
            // Reset form when opening
            this.resetAssistedForm();
        } else {
            console.error('Modal de assistido não encontrado');
        }
    }

    hideAssistedForm() {
        const assistedForm = document.getElementById('assisted-form');
        if (assistedForm) {
            assistedForm.style.display = 'none';
            assistedForm.classList.remove('active');
            this.resetAssistedForm();
        }
    }

    resetAssistedForm() {
        if (this.assistedPhoto) this.assistedPhoto.value = '';
        if (this.assistedName) this.assistedName.value = '';
        if (this.assistedNickname) this.assistedNickname.value = '';
        if (this.assistedCpf) this.assistedCpf.value = '';
        if (this.assistedNis) this.assistedNis.value = '';
        if (this.assistedPhone) this.assistedPhone.value = '';
        if (this.assistedLocation) this.assistedLocation.value = '';
        
        // Reset photo preview
        if (this.assistedPhotoPreview) {
            this.assistedPhotoPreview.innerHTML = `
                <span class="material-icons">add_a_photo</span>
                <p>Adicionar foto</p>
            `;
        }

        // Reset checkboxes
        document.querySelectorAll('.situation-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    updateAssistedList() {
        const assistedList = document.getElementById('assisted-list');
        const emptyListMessage = document.querySelector('.empty-list-message');
        
        if (!assistedList || !emptyListMessage) return;

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const assistedListData = userData.assistedList || [];

        if (assistedListData.length === 0) {
            assistedList.innerHTML = `
                <div class="empty-list-message">
                    <p>Nenhuma pessoa cadastrada ainda.</p>
                    <p>Clique no botão acima para adicionar.</p>
                </div>
            `;
            return;
        }

        assistedList.innerHTML = assistedListData.map((assisted, index) => `
            <div class="assisted-card">
                <div class="assisted-photo">
                    ${assisted.photo ? 
                        `<img src="${URL.createObjectURL(assisted.photo)}" alt="Foto de ${assisted.name}">` :
                        `<span class="material-icons">person</span>`
                    }
                </div>
                <div class="assisted-info">
                    <h3>${assisted.name}</h3>
                    ${assisted.nickname ? `<p>Apelido: ${assisted.nickname}</p>` : ''}
                    <p>CPF: ${assisted.cpf}</p>
                    ${assisted.nis ? `<p>NIS: ${assisted.nis}</p>` : ''}
                    <p>Telefone: ${assisted.phone}</p>
                    <p>Localização: ${assisted.location}</p>
                    <div class="situations">
                        ${assisted.situations.map(situation => `
                            <span class="situation-tag">${situation}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="assisted-actions">
                    <button onclick="window.navigateToKitchens(${index})" class="btn-primary">
                        <span class="material-icons">restaurant</span>
                        Buscar Cozinhas
                    </button>
                    <button onclick="window.removeAssisted(${index})" class="btn-secondary">
                        <span class="material-icons">delete</span>
                        Remover
                    </button>
                </div>
            </div>
        `).join('');
    }

    getNickname(name) {
        // Gera um apelido baseado nas iniciais do nome
        const words = name.split(' ');
        if (words.length === 1) return words[0];
        return `${words[0]} ${words[words.length - 1][0]}.`;
    }

    navigateToKitchens(index) {
        localStorage.setItem('userOrigin', 'volunteer');
        this.addAssistedBtn.style.display = 'show';
        if (this.assistedList && this.assistedList[index]) {
            const assisted = this.assistedList[index];
            // Salvar dados do assistido para a próxima tela
            localStorage.setItem('currentAssisted', JSON.stringify(assisted));
            // Navegar para a tela de cozinhas
            this.screenLoader.loadScreen('result');
        }
    }

    removeAssisted(index) {
        if (this.assistedList && this.assistedList.length > index) {
            this.assistedList.splice(index, 1);
            
            // Update cache
            const cachedData = localStorage.getItem('volunteerCache');
            if (cachedData) {
                const cache = JSON.parse(cachedData);
                cache.assistedList = this.assistedList;
                localStorage.setItem('volunteerCache', JSON.stringify(cache));
            }
            
            this.updateAssistedList();
        }
    }

    handleNavigation(screen, data = null) {
        try {
            if (data) {
                localStorage.setItem('currentAssisted', JSON.stringify(data));
            }
            this.screenLoader.loadScreen(screen);
            console.log(`Navigation to ${screen} successful`);
        } catch (error) {
            console.error(`Navigation to ${screen} failed:`, error);
        }
    }

    updateVolunteerProfile(name, photo, role = 'Cidadão Apoiador') {
        if (this.volunteerNameElement) {
            this.volunteerNameElement.textContent = name || 'Cidadão Apoiador';
        }
        if (this.volunteerSubtitle) {
            this.volunteerSubtitle.textContent = role;
        }
        if (photo) {
            this.volunteerAvatar.innerHTML = `<img src="${photo}" alt="Foto do cidadão apoiador">`;
        } else {
            this.volunteerAvatar.innerHTML = '<span class="material-icons">person</span>';
        }
    }

    updateUIState() {
        try {
            const addAssistedBtn = document.getElementById('add-assisted');
            const assistedList = document.getElementById('assisted-list');
            const volunteerForm = document.getElementById('volunteer-form');
            const assistedForm = document.getElementById('assisted-form');
            const assistedSection = document.getElementById('assisted-section');
            
            // Verificar se há dados no localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const isUserLoggedIn = userData && userData.role === 'volunteer';
            
            // Ocultar/mostrar seção de assistidos baseado no login
            if (assistedSection) {
                assistedSection.style.display = isUserLoggedIn ? 'block' : 'none';
            }
            
            if (addAssistedBtn) {
                addAssistedBtn.style.display = isUserLoggedIn ? 'block' : 'none';
            }
            
            if (assistedList) {
                const assistedListData = userData.assistedList || [];
                assistedList.style.display = assistedListData.length > 0 ? 'block' : 'none';
            }
            
            if (volunteerForm) {
                volunteerForm.style.display = isUserLoggedIn ? 'none' : 'block';
            }
            
            if (assistedForm) {
                assistedForm.style.display = 'none';
                assistedForm.classList.remove('active');
            }

            // Atualizar a lista de assistidos
            this.updateAssistedList();
        } catch (error) {
            console.error('Erro ao atualizar o estado da UI:', error);
        }
    }

    async handleAssistedClick(assisted) {
        try {
            // Salva a pessoa em atendimento no localStorage
            localStorage.setItem('currentAssisted', JSON.stringify(assisted));
            
            // Navega para a tela de resultado
            const success = await this.screenLoader.loadScreen('result');
            if (!success) {
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } catch (error) {
            console.error('Erro ao navegar para próxima tela:', error);
            showMessage('Erro ao navegar para próxima tela', 'error');
        }
    }

    initializeVoiceInput() {
        const voiceButtons = document.querySelectorAll('.voice-input-btn');
        voiceButtons.forEach(button => {
            const inputId = button.closest('.input-wrapper').querySelector('input').id;
            button.setAttribute('data-input', inputId);
            button.addEventListener('click', () => this.handleVoiceInput(button));
        });
    }

    showPhotoModal(preview) {
        const backgroundImage = preview.style.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
            this.photoModalContent.innerHTML = `<img src="${backgroundImage.slice(5, -2)}" alt="Foto">`;
            this.photoModal.classList.add('active');
        }
    }

    showLocationModal() {
        console.warn('Método showLocationModal foi removido. Use getLocation diretamente.');
    }

    initMap() {
        console.warn('Método initMap foi removido. Use getLocation diretamente.');
    }

    updateLocationInput() {
        console.warn('Método updateLocationInput foi removido. Use getLocation diretamente.');
    }

    confirmLocation() {
        console.warn('Método confirmLocation foi removido. Use getLocation diretamente.');
    }

    closeModals() {
        if (this.photoModal) {
            this.photoModal.classList.remove('active');
        }
        if (this.elements.locationModal) {
            this.elements.locationModal.classList.remove('active');
        }
        if (this.elements.assistedForm) {
            this.elements.assistedForm.classList.remove('active');
        }
    }

    createModals() {
        try {
            // Remove modais existentes se houver
            const existingPhotoModal = document.getElementById('photo-modal');
            if (existingPhotoModal) {
                existingPhotoModal.remove();
            }

            // Cria o modal de foto
            const photoModal = document.createElement('div');
            photoModal.id = 'photo-modal';
            photoModal.className = 'modal';
            photoModal.style.display = 'none';
            photoModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div id="photo-modal-content"></div>
                </div>
            `;
            this.screensContainer.appendChild(photoModal);
            this.photoModal = photoModal;

            // Atualiza as referências dos elementos
            this.elements = {
                photoModal: this.photoModal,
                closeModalBtn: document.querySelectorAll('.close-modal'),
                photoModalContent: document.getElementById('photo-modal-content')
            };

            // Adiciona event listeners
            this.elements.closeModalBtn.forEach(button => {
                button.addEventListener('click', () => this.closeModals());
            });

            // Adiciona event listener para o botão de adicionar assistido
            const addAssistedBtn = document.getElementById('add-assisted');
            if (addAssistedBtn) {
                addAssistedBtn.addEventListener('click', () => {
                    const assistedForm = document.getElementById('assisted-form');
                    if (assistedForm) {
                        assistedForm.style.display = 'flex';
                        assistedForm.classList.add('active');
                    }
                });
            }

        } catch (error) {
            console.error('Erro ao criar modais:', error);
        }
    }

    checkFormValidity() {
        const submitButton = document.getElementById('submit-volunteer');
        if (!submitButton) return;

        let isValid = true;

        // Verificar campos obrigatórios
        this.requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
            }
        });

        // Verificar se a situação de rua foi selecionada
        const homelessSelected = document.querySelector('input[name="homeless"]:checked');
        if (!homelessSelected) {
            isValid = false;
        }

        // Verificar se quem está preenchendo foi selecionado
        const fillingForSelected = document.querySelector('input[name="filling_for"]:checked');
        if (!fillingForSelected) {
            isValid = false;
        }

        // Habilitar/desabilitar o botão de submit
        submitButton.disabled = !isValid;

        // Atualizar o estilo do botão
        if (isValid) {
            submitButton.classList.remove('disabled');
            submitButton.classList.add('enabled');
        } else {
            submitButton.classList.remove('enabled');
            submitButton.classList.add('disabled');
        }

        console.log('Form validation:', isValid);
        console.log('Submit button disabled:', submitButton.disabled);
    }

    checkAssistedFormValidity() {
        const submitButton = document.getElementById('submit-assisted');
        if (!submitButton) return;

        const isValid = this.assistedRequiredFields.every(fieldId => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim() !== '';
        });

        submitButton.disabled = !isValid;
    }

    handleGenderChange() {
        if (!this.volunteerGender || !this.socialNameGroup) return;

        const selectedGender = this.volunteerGender.value;
        const uncommonGenders = ['transgender', 'non_binary', 'other'];

        if (uncommonGenders.includes(selectedGender)) {
            this.socialNameGroup.style.display = 'block';
        } else {
            this.socialNameGroup.style.display = 'none';
            if (this.socialNameCheckbox) {
                this.socialNameCheckbox.checked = false;
            }
            if (this.volunteerSocialName) {
                this.volunteerSocialName.value = '';
            }
        }

        this.checkFormValidity();
    }

    handleSocialNameCheckbox() {
        if (!this.socialNameCheckbox || !this.volunteerSocialName) return;

        if (this.socialNameCheckbox.checked) {
            this.volunteerSocialName.required = true;
        } else {
            this.volunteerSocialName.required = false;
            this.volunteerSocialName.value = '';
        }

        this.checkFormValidity();
    }

    autoFillForm() {
        // Dados fictícios para teste
        const fakeData = {
            name: 'João da Silva Santos',
            gender: 'male',
            birthdate: '15/05/1985',
            city: 'Recife',
            address: 'Rua das Flores, 123 - Boa Viagem',
            cpf: '123.456.789-00',
            nis: '12345678901',
            homeless: 'nao',
            fillingFor: ['self'],
            location: '-8.047562, -34.877002'
        };

        // Preencher campos do formulário
        if (this.volunteerName) this.volunteerName.value = fakeData.name;
        if (this.volunteerGender) this.volunteerGender.value = fakeData.gender;
        if (this.volunteerBirthdate) this.volunteerBirthdate.value = fakeData.birthdate;
        if (this.volunteerCity) this.volunteerCity.value = fakeData.city;
        if (this.volunteerAddress) this.volunteerAddress.value = fakeData.address;
        if (this.volunteerCpf) this.volunteerCpf.value = fakeData.cpf;
        if (this.volunteerNis) this.volunteerNis.value = fakeData.nis;
        if (this.volunteerLocation) this.volunteerLocation.value = fakeData.location;

        // Selecionar opções de rádio e checkbox
        const homelessRadio = document.querySelector(`input[name="homeless"][value="${fakeData.homeless}"]`);
        if (homelessRadio) homelessRadio.checked = true;

        fakeData.fillingFor.forEach(value => {
            const fillingForCheckbox = document.querySelector(`input[name="filling_for"][value="${value}"]`);
            if (fillingForCheckbox) fillingForCheckbox.checked = true;
        });

        // Simular upload de foto
        if (this.volunteerPhotoPreview) {
            this.volunteerPhotoPreview.style.backgroundImage = 'url("https://avatars.githubusercontent.com/u/984221?v=4&size=64")';
            this.volunteerPhotoPreview.classList.add('has-photo');
        }

        // Disparar eventos de input para todos os campos preenchidos
        const formInputs = document.querySelectorAll('#volunteer-form input, #volunteer-form select');
        formInputs.forEach(input => {
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        });

        // Disparar eventos de change para radio buttons e checkboxes
        const radioGroups = document.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
        radioGroups.forEach(input => {
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });

        // Forçar atualização da validação
        setTimeout(() => {
            this.checkFormValidity();
        }, 100);

        // Mostrar mensagem de sucesso
        alert('Formulário preenchido automaticamente com dados de teste!');
    }

    async handleAssistedSubmit() {
        try {
            // Get form data
            const formData = {
                name: this.assistedName.value,
                nickname: this.assistedNickname.value,
                cpf: this.assistedCpf.value,
                nis: this.assistedNis.value,
                phone: this.assistedPhone.value,
                location: this.assistedLocation.value,
                photo: this.assistedPhoto.files[0],
                situations: Array.from(document.querySelectorAll('.situation-checkbox input:checked'))
                    .map(checkbox => checkbox.value)
            };

            // Validate required fields
            if (!formData.name || !formData.cpf || !formData.phone || !formData.location) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Disable submit button and show loading state
            this.submitAssistedBtn.disabled = true;
            this.submitAssistedBtn.innerHTML = '<span class="material-icons">sync</span> Salvando...';

            // Simulate backend call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save to localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (!userData.assistedList) {
                userData.assistedList = [];
            }
            userData.assistedList.push(formData);
            localStorage.setItem('userData', JSON.stringify(userData));

            // Update UI
            this.updateAssistedList();
            this.hideAssistedForm();
            
            // Show success message
            this.submitAssistedBtn.innerHTML = '<span class="material-icons">check</span> Salvo com sucesso!';
            this.submitAssistedBtn.style.backgroundColor = 'var(--success-color)';

            // Reset button after 2 seconds
            setTimeout(() => {
                this.submitAssistedBtn.disabled = false;
                this.submitAssistedBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                this.submitAssistedBtn.style.backgroundColor = 'var(--primary-color)';
            }, 2000);

        } catch (error) {
            console.error('Erro ao salvar dados do assistido:', error);
            this.submitAssistedBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
            this.submitAssistedBtn.style.backgroundColor = 'var(--error-color)';
        }
    }
}

// Initialize screen when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const screen = new VolunteerScreen();
    window.screen = screen; // Make screen instance available globally
}); 