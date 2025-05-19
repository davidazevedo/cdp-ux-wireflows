import { ScreenLoader } from '../../utils/screenLoader.js';
import { showMessage } from '../../utils/messages.js';
import { CPFValidator } from '../../utils/cpfValidator.js';
import { Formatters } from '../../utils/formatters.js';

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
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
        
        // Make methods available globally
        window.navigateToKitchens = (index) => this.navigateToKitchens(index);
        window.removeAssisted = (index) => this.removeAssisted(index);
        this.setupAssistedForm();
    }

    initialize() {
        try {
            if (!this.screensContainer) {
                console.error('Container de telas não encontrado');
                return;
            }

            // Initialize elements
            this.initializeElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Add location buttons
            this.addLocationButtons();
            
            // Load cached data
            this.loadCachedData();
            
            // Update UI state
            this.updateUIState();

            // Update volunteer info based on userOrigin
            this.updateVolunteerInfo();

            // Debug log
            console.log('VolunteerScreen initialized');
        } catch (error) {
            console.error('Error initializing volunteer screen:', error);
        }
    }

    initializeElements() {
        try {
            const userOrigin = localStorage.getItem('userOrigin');
            const userTypeCard = document.createElement('div');

            // Add user type selection card
            if (userOrigin === 'volunteer') {



                userTypeCard.className = 'user-type-card';
                userTypeCard.innerHTML = `
                    <h2>Selecione seu perfil</h2>
                    <div class="user-type-options">
                        <label class="user-type-option">
                            <input type="radio" name="userType" value="volunteer" checked>
                            <div class="option-content">
                                <span class="material-icons">volunteer_activism</span>
                                <div class="option-text">
                                    <h3>Cidadão Amigo</h3>
                                    <p>Estou ajudando alguém em situação de vulnerabilidade</p>
                                </div>
                            </div>
                        </label>
                        <label class="user-type-option">
                            <input type="radio" name="userType" value="counter">
                            <div class="option-content">
                                <span class="material-icons">badge</span>
                                <div class="option-text">
                                    <h3>Profissional</h3>
                                    <p>Assistente Social, Agente de Saúde, Policial, etc.</p>
                                </div>
                            </div>
                        </label>
                    </div>
                `;
            }

            // Insert the card before the form
            const volunteerForm = document.getElementById('volunteer-form');
            if (volunteerForm) {
                volunteerForm.parentNode.insertBefore(userTypeCard, volunteerForm);
            }

            // Add event listeners for user type selection
            const userTypeInputs = document.querySelectorAll('input[name="userType"]');
            userTypeInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    const userType = e.target.value;
                    //localStorage.setItem('userOrigin', userType);
                    this.updateVolunteerInfo();
                    this.updateUIState();
                });
            });

            // Volunteer form elements
            this.volunteerForm = document.getElementById('volunteer-form');
            this.volunteerPhoto = document.getElementById('volunteer-photo');
            this.volunteerPhotoPreview = document.getElementById('volunteer-photo-preview');
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
            this.assistedForm = document.getElementById('assistedForm');
            this.assistedPhoto = document.getElementById('assisted-photo');
            this.assistedPhotoPreview = document.getElementById('assisted-photo-preview');
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
            this.emptyListMessage = document.querySelector('.empty-list-message');
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

            // Modal elements
            this.photoModal = document.getElementById('photo-modal');
            this.photoModalContent = document.getElementById('photo-modal-content');

            // Verifica se os elementos necessários foram encontrados
            if (!this.volunteerForm) {
                console.error('Formulário de cidadão apoiador não encontrado');
            }

            // Aplicar máscaras
            this.applyMasks();

            // Inicializar autocomplete de municípios
            this.initializeCityAutocomplete();

            // Add required fields array
            this.requiredFields = [
                'volunteer-name',
                'volunteerGender',
                'volunteer-birthdate',
                'volunteer-city',
                'volunteer-location'
            ];

            // Add assisted required fields array
            this.assistedRequiredFields = [
                'assisted-name',
                'assisted-cpf',
                'assisted-phone',
                'assisted-location'
            ];

            // Add social name elements
            this.socialNameGroup = document.getElementById('social-name-group');
            this.socialNameGroupInput = document.getElementById('social-name-group-input');
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
            if (this.socialNameGroupInput) {
                this.socialNameGroupInput.style.display = 'none';
            }

            // Initialize modals
            this.initializeModals();

            // Add photo handling
            if (this.volunteerPhoto && this.volunteerPhotoPreview) {
                this.volunteerPhotoPreview.addEventListener('click', () => {
                    this.volunteerPhoto.click();
                });

                this.volunteerPhoto.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.volunteerPhotoPreview.style.backgroundImage = `url(${e.target.result})`;
                            this.volunteerPhotoPreview.classList.add('has-photo');
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Add photo handling for assisted form
            if (this.assistedPhoto && this.assistedPhotoPreview) {
                this.assistedPhotoPreview.addEventListener('click', () => {
                    this.assistedPhoto.click();
                });

                this.assistedPhoto.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.assistedPhotoPreview.style.backgroundImage = `url(${e.target.result})`;
                            this.assistedPhotoPreview.classList.add('has-photo');
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            this.autoFillToggle = this.screensContainer.querySelector('#autoFillToggle');
        } catch (error) {
            console.error('Erro ao inicializar elementos:', error);
        }
    }

    initializeModals() {
        try {
            // Initialize assisted form modal
            if (this.assistedForm) {
                // Add close button event listener
                const closeBtn = this.assistedForm.querySelector('.close-modal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.hideAssistedForm());
                }

                // Add click outside to close
                this.assistedForm.addEventListener('click', (e) => {
                    if (e.target === this.assistedForm) {
                        this.hideAssistedForm();
                    }
                });

                // Add submit button event listener
                if (this.submitAssistedBtn) {
                    this.submitAssistedBtn.addEventListener('click', () => this.handleAssistedSubmit());
                }
            } else {
                console.error('Modal de assistido não encontrado');
            }

            // Initialize photo modal
            if (this.photoModal) {
                // Add close button event listener
                const closeBtn = this.photoModal.querySelector('.close-modal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.closeModals());
                }

                // Add click outside to close
                this.photoModal.addEventListener('click', (e) => {
                    if (e.target === this.photoModal) {
                        this.closeModals();
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar modais:', error);
        }
    }

    showAssistedForm() {
        try {
            const modal = this.screensContainer.querySelector('#assistedForm');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                this.resetAssistedForm();

                // Adicionar botão de auto-preenchimento se não existir
                if (!modal.querySelector('.auto-fill-assisted')) {
                    const autoFillBtn = document.createElement('button');
                    autoFillBtn.className = 'btn-secondary auto-fill-assisted';
                    autoFillBtn.innerHTML = '<span class="material-icons">auto_fix_high</span> Preencher Automaticamente';
                    autoFillBtn.onclick = () => this.autoFillAssistedForm();
                    
                    // Inserir o botão antes do botão de submit
                    const submitBtn = modal.querySelector('#submit-assisted');
                    if (submitBtn) {
                        submitBtn.parentNode.insertBefore(autoFillBtn, submitBtn);
                    }
                }
            } else {
                console.error('Modal de assistido não encontrado');
            }
        } catch (error) {
            console.error('Erro ao mostrar formulário de assistido:', error);
        }
    }

    autoFillAssistedForm() {
        try {
            // Dados fictícios para teste
            const fakeData = {
                name: 'Maria Oliveira Santos',
                nickname: 'Mari',
                cpf: '987.654.321-00',
                nis: '98765432100',
                phone: '(81) 98765-4321',
                location: '-8.047562, -34.877002',
                situations: ['idoso', 'doente']
            };

            // Preencher campos do formulário
            if (this.assistedName) this.assistedName.value = fakeData.name;
            if (this.assistedNickname) this.assistedNickname.value = fakeData.nickname;
            if (this.assistedCpf) this.assistedCpf.value = fakeData.cpf;
            if (this.assistedNis) this.assistedNis.value = fakeData.nis;
            if (this.assistedPhone) this.assistedPhone.value = fakeData.phone;
            if (this.assistedLocation) this.assistedLocation.value = fakeData.location;

            // Selecionar situações de vulnerabilidade
            fakeData.situations.forEach(situation => {
                const checkbox = this.assistedForm.querySelector(`input[name="situation"][value="${situation}"]`);
                if (checkbox) checkbox.checked = true;
            });

            // Simular upload de foto
            if (this.assistedPhotoPreview) {
                this.assistedPhotoPreview.style.backgroundImage = 'url("https://avatars.githubusercontent.com/u/984221?v=4&size=64")';
                this.assistedPhotoPreview.classList.add('has-photo');
            }

            // Disparar eventos de input para todos os campos preenchidos
            const formInputs = this.assistedForm.querySelectorAll('input, select');
            formInputs.forEach(input => {
                if (input) {
                    const inputEvent = new Event('input', { bubbles: true });
                    input.dispatchEvent(inputEvent);
                }
            });

            // Mostrar mensagem de sucesso
            if (typeof showMessage === 'function') {
                showMessage('Formulário preenchido automaticamente!', 'success');
            } else {
                alert('Formulário preenchido automaticamente!');
            }
        } catch (error) {
            console.error('Erro ao preencher formulário automaticamente:', error);
            if (typeof showMessage === 'function') {
                showMessage('Erro ao preencher formulário automaticamente.', 'error');
            } else {
                alert('Erro ao preencher formulário automaticamente.');
            }
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
            this.assistedPhotoPreview.classList.remove('has-photo');
        }

        // Reset checkboxes
        document.querySelectorAll('.situation-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Remove botão de auto-preenchimento se existir
        const autoFillBtn = this.assistedForm.querySelector('.auto-fill-assisted');
        if (autoFillBtn) {
            autoFillBtn.remove();
        }

        // Reset error states
        const errorMessages = this.assistedForm.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        const invalidInputs = this.assistedForm.querySelectorAll('.invalid');
        invalidInputs.forEach(input => input.classList.remove('invalid'));

        // Reset submit button state
        if (this.submitAssistedBtn) {
            this.submitAssistedBtn.disabled = false;
            this.submitAssistedBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
            this.submitAssistedBtn.style.backgroundColor = 'var(--primary-color)';
        }
    }

    hideAssistedForm() {
        try {
            const modal = this.screensContainer.querySelector('#assistedForm');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
                this.resetAssistedForm();
            } else {
                console.error('Modal de assistido não encontrado');
            }
        } catch (error) {
            console.error('Erro ao esconder formulário de assistido:', error);
        }
    }

    updateAssistedList() {
        const assistedList = document.getElementById('assisted-list');
        if (!assistedList) return;

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const assisted = userData.assistedList || [];

        if (assisted.length === 0) {
            assistedList.innerHTML = `
                <div class="empty-list-message">
                    <p>Nenhuma pessoa cadastrada ainda.</p>
                    <p>Clique no botão acima para adicionar.</p>
                </div>
            `;
            return;
        }

        assistedList.innerHTML = assisted.map((person, index) => `
            <div class="assisted-card" data-index="${index}">
                <div class="assisted-photo">
                    ${person.photo ? 
                        `<img src="${URL.createObjectURL(person.photo)}" alt="Foto de ${person.name}">` :
                        `<span class="material-icons">person</span>`
                    }
                </div>
                <div class="assisted-info">
                    <h3>${person.name}</h3>
                    <p>${person.nickname || ''}</p>
                    <div class="situations">
                        ${person.situations.map(situation => `
                            <span class="situation-tag">
                                <span class="material-icons">${this.getSituationIcon(situation)}</span>
                                ${this.getSituationLabel(situation)}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="assisted-actions">
                    <button class="btn-icon" data-action="navigate" data-index="${index}">
                        <span class="material-icons">restaurant</span>
                    </button>
                    <button class="btn-icon" data-action="remove" data-index="${index}">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to the buttons
        assistedList.querySelectorAll('.btn-icon').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                const index = parseInt(button.dataset.index);
                
                if (action === 'navigate') {
                    this.navigateToKitchens(index);
                } else if (action === 'remove') {
                    this.removeAssisted(index);
                }
            });
        });
    }

    getShortName(name) {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0];
        return `${parts[0]} ${parts[1][0]}.`;
    }

    getSituationIcon(situation) {
        const icons = {
            'homeless': 'home',
            'unemployed': 'work_off',
            'elderly': 'elderly',
            'disabled': 'accessible',
            'single-parent': 'family_restroom',
            'lgbtqia': 'diversity_3',
            'refugee': 'flight_takeoff',
            'indigenous': 'groups'
        };
        return icons[situation] || 'help_outline';
    }

    getSituationLabel(situation) {
        const labels = {
            'homeless': 'Em situação de rua',
            'unemployed': 'Desempregado',
            'elderly': 'Idoso',
            'disabled': 'Pessoa com deficiência',
            'single-parent': 'Mãe/Pai solo',
            'lgbtqia': 'LGBTQIA+',
            'refugee': 'Refugiado',
            'indigenous': 'Indígena'
        };
        return labels[situation] || situation;
    }

    removeAssisted(index) {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (!userData.assistedList || !userData.assistedList[index]) {
                console.error('Assistido não encontrado');
                return;
            }

            // Remove o assistido da lista
            userData.assistedList.splice(index, 1);
            
            // Atualiza o localStorage
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Atualiza a UI
            this.updateAssistedList();

            if (typeof showMessage === 'function') {
                showMessage('Assistido removido com sucesso!', 'success');
            } else {
                alert('Assistido removido com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao remover assistido:', error);
            if (typeof showMessage === 'function') {
                showMessage('Erro ao remover assistido.', 'error');
            } else {
                alert('Erro ao remover assistido.');
            }
        }
    }

    getNickname(name) {
        // Gera um apelido baseado nas iniciais do nome
        const words = name.split(' ');
        if (words.length === 1) return words[0];
        return `${words[0]} ${words[words.length - 1][0]}.`;
    }

    navigateToKitchens(index) {
        console.log('[navigateToKitchens] Called with index:', index);
        localStorage.setItem('userOrigin', 'volunteer');
        if (this.addAssistedBtn) {
            console.log('[navigateToKitchens] addAssistedBtn found, setting display to show');
            this.addAssistedBtn.style.display = 'show';
        } else {
            console.warn('[navigateToKitchens] addAssistedBtn not found');
        }
        // Log the assistedList from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const assistedListData = userData.assistedList || [];
        console.log('[navigateToKitchens] assistedList from localStorage:', assistedListData);
        if (Array.isArray(assistedListData) && assistedListData[index]) {
            const assisted = assistedListData[index];
            console.log('[navigateToKitchens] Found assisted:', assisted);
            // Salvar dados do assistido para a próxima tela
            localStorage.setItem('currentAssisted', JSON.stringify(assisted));
            // Navegar para a tela de cozinhas
            if (this.screenLoader && typeof this.screenLoader.loadScreen === 'function') {
                console.log('[navigateToKitchens] Calling screenLoader.loadScreen("result")');
                this.screenLoader.loadScreen('result');
            } else {
                console.error('[navigateToKitchens] screenLoader or loadScreen not available');
            }
        } else {
            console.error('[navigateToKitchens] assistedList is not an array or no assisted at index', index, assistedListData);
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

    updateVolunteerProfile(name, photoData) {
        const avatar = document.querySelector('.volunteer-avatar');
        const nameElement = document.querySelector('.volunteer-info h1');
        const subtitle = document.querySelector('.volunteer-info .subtitle');

        if (nameElement) {
            nameElement.textContent = name || 'Cidadão Apoiador';
        }

        if (subtitle) {
            subtitle.textContent = 'Bem-vindo!';
        }

        if (avatar) {
            if (photoData) {
                avatar.style.backgroundImage = `url(${photoData})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
                avatar.innerHTML = ''; // Remove o ícone quando há foto
            } else {
                avatar.style.backgroundImage = 'none';
                avatar.innerHTML = '<span class="material-icons">person</span>';
            }
        }
    }

    loadCachedData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            if (userData) {
                // Preencher campos básicos
                document.getElementById('volunteer-name').value = userData.name || '';
                document.getElementById('volunteer-social-name').value = userData.socialName || '';
                document.getElementById('volunteer-birthdate').value = userData.birthdate || '';
                document.getElementById('volunteer-city').value = userData.city || '';
                document.getElementById('volunteer-address').value = userData.address || '';
                document.getElementById('volunteer-cpf').value = userData.cpf || '';
                document.getElementById('volunteer-nis').value = userData.nis || '';
                document.getElementById('volunteer-location').value = userData.location || '';
                document.getElementById('volunteer-photo').value = userData.photo || '';

                // Preencher radio buttons
                if (userData.gender) {
                    document.querySelector(`input[name="gender"][value="${userData.gender}"]`).checked = true;
                }
                if (userData.homeless) {
                    document.querySelector(`input[name="homeless"][value="${userData.homeless}"]`).checked = true;
                }

                // Preencher checkboxes de filling_for
                if (Array.isArray(userData.fillingFor)) {
                    userData.fillingFor.forEach(value => {
                        const checkbox = document.querySelector(`input[name="filling_for"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                // Preencher checkboxes de comunidades
                if (Array.isArray(userData.communities)) {
                    userData.communities.forEach(value => {
                        const checkbox = document.querySelector(`input[name="community"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                }

                this.updateVolunteerProfile(userData.name, userData.photo);
            }

            // Atualiza o texto do volunteer-info baseado no userOrigin
            this.updateVolunteerInfo();
            
            // Debug log
            console.log('Cached data loaded, userOrigin:', localStorage.getItem('userOrigin'));
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    updateUIState() {
        try {
            const addAssistedBtn = document.getElementById('add-assisted');
            const assistedList = document.getElementById('assisted-list');
            const volunteerForm = document.getElementById('volunteer-form');
            const assistedForm = document.getElementById('assistedForm');
            const assistedSection = document.getElementById('assisted-section');
            const userOrigin = localStorage.getItem('userOrigin');
            
            // Verificar se há dados no localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const hasUserData = userData && Object.keys(userData).length > 0;
            
            // Ocultar/mostrar seção de assistidos baseado no login e cadastro
            if (assistedSection) {
                assistedSection.style.display = hasUserData ? 'block' : 'none';
            }
            
            if (addAssistedBtn) {
                addAssistedBtn.style.display = hasUserData ? 'block' : 'none';
            }
            
            if (volunteerForm) {
                volunteerForm.style.display = hasUserData ? 'none' : 'block';
            }

            // Atualizar campos obrigatórios baseado no userOrigin
            if (userOrigin === 'volunteer') {
                const cpfField = document.getElementById('volunteer-cpf');
                const nisField = document.getElementById('volunteer-nis');
                
                if (cpfField) {
                    cpfField.required = true;
                    const cpfLabel = cpfField.previousElementSibling;
                    if (cpfLabel) {
                        cpfLabel.innerHTML = 'CPF *';
                    }
                }
                
                if (nisField) {
                    nisField.required = true;
                    const nisLabel = nisField.previousElementSibling;
                    if (nisLabel) {
                        nisLabel.innerHTML = 'NIS *';
                    }
                }
            }

            // Atualizar a lista de assistidos se existir
            if (hasUserData && assistedList) {
                this.updateAssistedList();
            }

        } catch (error) {
            console.error('Erro ao atualizar o estado da UI:', error);
        }
    }

    updateVolunteerInfo() {
        try {
            const userOrigin = localStorage.getItem('userOrigin');
            const volunteerInfo = document.getElementById('volunteer-info');
            
            if (volunteerInfo) {
                const title = volunteerInfo.querySelector('h1');
                if (title) {
                    if (userOrigin === 'volunteer') {
                        title.textContent = 'Fale Mais sobre quem você está ajudando';
                    } else {
                        title.textContent = 'Fale mais Sobre Você';
                    }
                    console.log('Title updated:', title.textContent); // Debug log
                } else {
                    console.error('Title element not found in volunteer-info');
                }
            } else {
                console.error('volunteer-info element not found');
            }
        } catch (error) {
            console.error('Error in updateVolunteerInfo:', error);
        }
    }

    async handleVolunteerSubmit(event) {
        if (event) {
            event.preventDefault();
        }
        
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submit-volunteer');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Salvando...';

        try {
            const photoInput = document.getElementById('volunteer-photo');
            const photoFile = photoInput.files[0];
            let photoData = null;

            if (photoFile) {
                const reader = new FileReader();
                photoData = await new Promise((resolve, reject) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(photoFile);
                });
            }

            const formData = {
                name: document.getElementById('volunteer-name').value,
                socialName: document.getElementById('volunteer-social-name').value,
                birthdate: document.getElementById('volunteer-birthdate').value,
                gender: document.querySelector('input[name="gender"]:checked')?.value,
                city: document.getElementById('volunteer-city').value,
                address: document.getElementById('volunteer-address').value,
                cpf: document.getElementById('volunteer-cpf').value,
                nis: document.getElementById('volunteer-nis').value,
                homeless: document.querySelector('input[name="homeless"]:checked')?.value,
                fillingFor: Array.from(document.querySelectorAll('input[name="filling_for"]:checked')).map(cb => cb.value),
                communities: Array.from(document.querySelectorAll('input[name="community"]:checked')).map(cb => cb.value),
                location: document.getElementById('volunteer-location').value,
                photo: photoData,
                assistedList: []
            };

            localStorage.setItem('userData', JSON.stringify(formData));
            this.updateVolunteerProfile(formData.name, photoData);
            this.updateUIState('volunteer');
            
            submitBtn.innerHTML = '<span class="material-icons">check_circle</span> Salvo com sucesso!';
            submitBtn.classList.add('success');
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                submitBtn.classList.remove('success');
            }, 2000);
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            submitBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
            submitBtn.classList.add('error');
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                submitBtn.classList.remove('error');
            }, 2000);
        }
    }

    validateForm() {
        const form = document.getElementById('volunteer-form');
        const userOrigin = localStorage.getItem('userOrigin');
        
        // Campos base obrigatórios
        const requiredFields = [
            'volunteer-name',
            'volunteer-city'
        ];

        // Adiciona CPF e NIS como obrigatórios se for volunteer
        if (userOrigin === 'volunteer') {
            requiredFields.push('volunteer-cpf', 'volunteer-nis');
        }

        let isValid = true;
        let firstInvalidField = null;

        // Remove todas as mensagens de erro anteriores
        form.querySelectorAll('.error-message').forEach(msg => msg.remove());
        form.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const value = field.value.trim();
            let fieldError = '';

            if (!value) {
                fieldError = 'Este campo é obrigatório';
            } else if (fieldId === 'volunteer-cpf' && !this.validateCPF(value)) {
                fieldError = 'CPF inválido';
            }

            if (fieldError) {
                isValid = false;
                field.classList.add('invalid');
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message show';
                errorMessage.textContent = fieldError;
                field.parentElement.appendChild(errorMessage);
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (!isValid && firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidField.focus();
            if (typeof showMessage === 'function') {
                showMessage('Por favor, corrija os campos marcados em vermelho.', 'error');
            } else {
                alert('Por favor, corrija os campos marcados em vermelho.');
            }
        }
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

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async getLocation(button) {
        try {
            if (!navigator.geolocation) {
                showMessage('Geolocalização não é suportada pelo seu navegador.', 'error');
                return;
            }

            const input = button.closest('.input-wrapper').querySelector('input');
            if (!input) return;

            // Desabilita o botão e mostra loading
            button.disabled = true;
            button.innerHTML = '<span class="material-icons">sync</span> Obtendo localização...';
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
            
            // Atualiza o input e o botão
            input.value = address;
            input.classList.add('location-obtained');
            button.innerHTML = '<span class="material-icons">check</span> Localização obtida';
            button.disabled = true;
            
            // Remove mensagem de erro se existir
            const errorMessage = input.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
            
            showMessage('Localização obtida com sucesso!', 'success');
            
            // Salva os dados da localização
            const locationData = {
                latitude,
                longitude,
                address,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('locationData', JSON.stringify(locationData));
            
        } catch (error) {
            console.error('Erro ao obter localização:', error);
            
            // Adiciona mensagem de erro abaixo do input
            const input = button.closest('.input-wrapper').querySelector('input');
            if (input) {
                input.classList.add('invalid');
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message show';
                errorMessage.textContent = 'Erro ao obter localização. Por favor, tente novamente.';
                input.parentElement.appendChild(errorMessage);
                
                // Rola até o input com erro
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                input.focus();
            }
            
            showMessage('Erro ao obter localização. Por favor, tente novamente.', 'error');
            
            // Reseta o botão
            button.disabled = false;
            button.innerHTML = '<span class="material-icons">my_location</span> Obter Localização';
        }
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            // Adiciona contagem de caracteres para campos de texto
            if (input.type === 'text' || input.type === 'tel') {
                const wrapper = input.closest('.input-wrapper');
                if (!wrapper) return;

                const charCount = document.createElement('div');
                charCount.className = 'char-count';
                wrapper.appendChild(charCount);
                
                input.addEventListener('input', () => {
                    const count = input.value.length;
                    const maxLength = input.maxLength || 100;
                    charCount.textContent = `${count}/${maxLength}`;
                    
                    if (count > maxLength * 0.9) {
                        charCount.classList.add('warning');
                    } else if (count === maxLength) {
                        charCount.classList.add('error');
                    } else {
                        charCount.classList.remove('warning', 'error');
                    }
                });
            }
            
            // Adiciona validação em tempo real
            input.addEventListener('input', () => {
                const wrapper = input.closest('.input-wrapper');
                if (!wrapper) return;

                const errorMessage = wrapper.querySelector('.error-message') || document.createElement('div');
                if (!errorMessage.classList.contains('error-message')) {
                    errorMessage.className = 'error-message';
                    wrapper.appendChild(errorMessage);
                }
                
                if (input.validity.valid) {
                    wrapper.classList.remove('invalid');
                    wrapper.classList.add('valid');
                    errorMessage.classList.remove('show');
                } else {
                    wrapper.classList.remove('valid');
                    wrapper.classList.add('invalid');
                    errorMessage.textContent = this.getValidationMessage(input);
                    errorMessage.classList.add('show');
                }
            });
            
            // Adiciona feedback visual ao focar
            input.addEventListener('focus', () => {
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.add('focused');
                }
            });
            
            input.addEventListener('blur', () => {
                const wrapper = input.closest('.input-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('focused');
                }
            });
        });
    }

    validateAssistedField(input) {
        const wrapper = input.closest('.input-wrapper');
        if (!wrapper) return;

        const errorMessage = wrapper.querySelector('.error-message') || document.createElement('div');
        if (!errorMessage.classList.contains('error-message')) {
            errorMessage.className = 'error-message';
            wrapper.appendChild(errorMessage);
        }
        
        if (input.validity.valid) {
            wrapper.classList.remove('invalid');
            wrapper.classList.add('valid');
            errorMessage.classList.remove('show');
        } else {
            wrapper.classList.remove('valid');
            wrapper.classList.add('invalid');
            errorMessage.textContent = this.getValidationMessage(input);
            errorMessage.classList.add('show');
        }
    }

    initializeVoiceInput() {
        const voiceButtons = document.querySelectorAll('.voice-input-btn');
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceButtons.forEach(btn => {
                btn.style.display = 'none';
            });
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        voiceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const inputId = button.getAttribute('data-input');
                const input = document.getElementById(inputId);
                
                if (!input) return;

                const recognition = new SpeechRecognition();
                recognition.lang = 'pt-BR';
                recognition.continuous = false;
                recognition.interimResults = false;

                // Desabilita o botão e mostra feedback visual
                button.disabled = true;
                button.classList.add('recording');
                button.innerHTML = '<span class="material-icons">mic</span> Ouvindo...';

                recognition.onstart = () => {
                    input.classList.add('recording');
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    input.value = transcript;
                    input.classList.add('voice-input');
                };

                recognition.onerror = (event) => {
                    console.error('Erro no reconhecimento de voz:', event.error);
                    if (event.error === 'no-speech') {
                        // Ignora o erro de "no-speech" pois é comum quando o usuário cancela
                        return;
                    }
                    input.classList.add('error');
                    const errorMessage = input.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.textContent = 'Erro no reconhecimento de voz. Tente novamente.';
                        errorMessage.classList.add('show');
                    }
                };

                recognition.onend = () => {
                    button.disabled = false;
                    button.classList.remove('recording');
                    button.innerHTML = '<span class="material-icons">mic</span>';
                    input.classList.remove('recording');
                };

                try {
                    recognition.start();
                } catch (error) {
                    console.error('Erro ao iniciar reconhecimento de voz:', error);
                    button.disabled = false;
                    button.classList.remove('recording');
                    button.innerHTML = '<span class="material-icons">mic</span>';
                }
            });
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
        try {
            if (this.photoModal) {
                this.photoModal.style.display = 'none';
                this.photoModal.classList.remove('active');
            }
            if (this.assistedForm) {
                this.assistedForm.style.display = 'none';
                this.assistedForm.classList.remove('active');
            }
        } catch (error) {
            console.error('Erro ao fechar modais:', error);
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
                    const assistedForm = document.getElementById('assistedForm');
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

        const userOrigin = localStorage.getItem('userOrigin');
        
        // Lista de campos obrigatórios base
        const requiredFields = [
            'volunteer-name',
            'volunteer-location'
        ];

        // Adiciona CPF e NIS como obrigatórios se for volunteer
        if (userOrigin === 'volunteer') {
            requiredFields.push('volunteer-cpf', 'volunteer-nis');
        }

        // Verificar se todos os campos obrigatórios estão preenchidos
        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const wrapper = field.closest('.input-wrapper');
                if (wrapper) {
                    if (field.type === 'radio' || field.type === 'checkbox') {
                        // Para grupos de radio/checkbox, verificar se algum está selecionado
                        const groupName = field.name;
                        const isChecked = document.querySelector(`input[name="${groupName}"]:checked`);
                        if (!isChecked) {
                            isValid = false;
                            wrapper.classList.add('invalid');
                        } else {
                            wrapper.classList.remove('invalid');
                        }
                    } else {
                        // Para outros campos, verificar se tem valor
                        if (!field.value || !field.value.trim()) {
                            isValid = false;
                            wrapper.classList.add('invalid');
                        } else {
                            wrapper.classList.remove('invalid');
                        }
                    }
                }
            }
        });

        // Verificar se o nome social é obrigatório (quando checkbox está marcado)
        if (this.socialNameCheckbox && this.socialNameCheckbox.checked) {
            if (!this.volunteerSocialName || !this.volunteerSocialName.value.trim()) {
                isValid = false;
                const wrapper = this.volunteerSocialName?.closest('.input-wrapper');
                if (wrapper) wrapper.classList.add('invalid');
            }
        }

        // Verificar se está em situação de rua foi selecionado
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
        if (!this.volunteerGender) return;
        this.checkFormValidity();
    }

    handleSocialNameCheckbox() {
        if (!this.socialNameCheckbox || !this.volunteerSocialName || !this.socialNameGroupInput) return;

        if (this.socialNameCheckbox.checked) {
            this.socialNameGroupInput.style.display = 'block';
            this.volunteerSocialName.required = true;
        } else {
            this.socialNameGroupInput.style.display = 'none';
            this.volunteerSocialName.required = false;
            this.volunteerSocialName.value = '';
        }

        this.checkFormValidity();
    }

    autoFillForm(type = 'other') {
        try {
            // Dados fictícios para teste
            const fakeData = {
                self: {
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
                },
                other: {
                    name: 'Maria Oliveira',
                    gender: 'female',
                    birthdate: '20/08/1990',
                    city: 'Recife',
                    address: 'Av. Boa Viagem, 500 - Boa Viagem',
                    cpf: '987.654.321-00',
                    nis: '98765432109',
                    homeless: 'nao',
                    fillingFor: ['other'],
                    location: '-8.047562, -34.877002'
                }
            };

            const data = fakeData[type] || fakeData.other;

            // Preencher campos do formulário
            if (this.volunteerName) this.volunteerName.value = data.name;
            if (this.volunteerGender) this.volunteerGender.value = data.gender;
            if (this.volunteerBirthdate) this.volunteerBirthdate.value = data.birthdate;
            if (this.volunteerCity) this.volunteerCity.value = data.city;
            if (this.volunteerAddress) this.volunteerAddress.value = data.address;
            if (this.volunteerCpf) this.volunteerCpf.value = data.cpf;
            if (this.volunteerNis) this.volunteerNis.value = data.nis;
            if (this.volunteerLocation) this.volunteerLocation.value = data.location;

            // Selecionar opções de rádio e checkbox
            const homelessRadio = document.querySelector(`input[name="homeless"][value="${data.homeless}"]`);
            if (homelessRadio) homelessRadio.checked = true;

            data.fillingFor.forEach(value => {
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
                if (input) {
                    // Criar e disparar evento de input
                    const inputEvent = new Event('input', { bubbles: true });
                    input.dispatchEvent(inputEvent);

                    // Validar o campo
                    const wrapper = input.closest('.input-wrapper');
                    if (wrapper) {
                        // Criar ou obter mensagem de erro
                        let errorMessage = wrapper.querySelector('.error-message');
                        if (!errorMessage) {
                            errorMessage = document.createElement('div');
                            errorMessage.className = 'error-message';
                            wrapper.appendChild(errorMessage);
                        }

                        // Atualizar estado visual
                        if (input.validity.valid) {
                            wrapper.classList.remove('invalid');
                            wrapper.classList.add('valid');
                            errorMessage.classList.remove('show');
                        } else {
                            wrapper.classList.remove('valid');
                            wrapper.classList.add('invalid');
                            errorMessage.textContent = this.getValidationMessage(input);
                            errorMessage.classList.add('show');
                        }
                    }
                }
            });

            // Disparar eventos de change para radio buttons e checkboxes
            const radioGroups = document.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
            radioGroups.forEach(input => {
                if (input) {
                    const changeEvent = new Event('change', { bubbles: true });
                    input.dispatchEvent(changeEvent);
                }
            });

            // Forçar atualização da validação
            setTimeout(() => {
                this.checkFormValidity();
            }, 100);

            // Mostrar mensagem de sucesso
            alert('Formulário preenchido automaticamente com dados de teste!');
        } catch (error) {
            console.error('Erro ao preencher formulário automaticamente:', error);
            alert('Erro ao preencher formulário automaticamente. Por favor, tente novamente.');
        }
    }

    getValidationMessage(input) {
        if (!input) return 'Campo inválido';

        if (input.validity.valueMissing) {
            return 'Este campo é obrigatório';
        }
        if (input.validity.typeMismatch) {
            if (input.type === 'email') {
                return 'Por favor, insira um email válido';
            }
            if (input.type === 'tel') {
                return 'Por favor, insira um telefone válido';
            }
        }
        if (input.validity.tooShort) {
            return `Mínimo de ${input.minLength} caracteres`;
        }
        if (input.validity.tooLong) {
            return `Máximo de ${input.maxLength} caracteres`;
        }
        return 'Campo inválido';
    }

    async handleAssistedSubmit() {
        if (!this.validateAssistedForm()) {
            return;
        }

        const submitBtn = document.getElementById('submit-assisted');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Salvando...';

        try {
            const formData = {
                name: document.getElementById('assisted-name').value,
                nickname: document.getElementById('assisted-nickname').value,
                cpf: document.getElementById('assisted-cpf').value,
                nis: document.getElementById('assisted-nis').value,
                phone: document.getElementById('assisted-phone').value,
                location: document.getElementById('assisted-location').value,
                situations: Array.from(document.querySelectorAll('input[name="situation"]:checked')).map(cb => cb.value),
                photo: document.getElementById('assisted-photo').files[0]
            };

            // Carregar lista existente
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const assistedList = userData.assistedList || [];
            
            // Adicionar novo assistido
            assistedList.push(formData);
            userData.assistedList = assistedList;
            
            // Salvar dados atualizados
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Atualizar UI
            this.updateAssistedList();
            this.closeAssistedModal();
            
            submitBtn.innerHTML = '<span class="material-icons">check_circle</span> Salvo com sucesso!';
            submitBtn.classList.add('success');
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                submitBtn.classList.remove('success');
            }, 2000);
        } catch (error) {
            console.error('Erro ao salvar assistido:', error);
            submitBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
            submitBtn.classList.add('error');
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                submitBtn.classList.remove('error');
            }, 2000);
        }
    }

    applyMasks() {
        try {
            // CPF mask
            if (this.volunteerCpf) {
                this.volunteerCpf.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatCPF(e.target.value);
                });
            }

            if (this.assistedCpf) {
                this.assistedCpf.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatCPF(e.target.value);
                });
            }

            // Birth date mask
            if (this.volunteerBirthdate) {
                this.volunteerBirthdate.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatDate(e.target.value);
                });
            }

            // Phone mask
            if (this.assistedPhone) {
                this.assistedPhone.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatPhone(e.target.value);
                });
            }

            // NIS mask
            if (this.volunteerNis) {
                this.volunteerNis.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatNIS(e.target.value);
                });
            }

            if (this.assistedNis) {
                this.assistedNis.addEventListener('input', (e) => {
                    e.target.value = Formatters.formatNIS(e.target.value);
                });
            }
        } catch (error) {
            console.error('Erro ao aplicar máscaras:', error);
        }
    }

    initializeCityAutocomplete() {
        try {
            // Lista de municípios de Pernambuco
            const cities = [
                "Recife", "Olinda", "Jaboatão dos Guararapes", "Caruaru", "Petrolina",
                "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"
            ];

            if (this.volunteerCity && this.citySuggestions) {
                this.volunteerCity.addEventListener('input', () => {
                    const input = this.volunteerCity.value.toLowerCase();
                    const filteredCities = cities.filter(city => 
                        city.toLowerCase().includes(input)
                    );

                    this.showCitySuggestions(filteredCities);
                });

                this.volunteerCity.addEventListener('blur', () => {
                    setTimeout(() => {
                        if (this.citySuggestions) {
                            this.citySuggestions.style.display = 'none';
                        }
                    }, 200);
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar autocomplete de municípios:', error);
        }
    }

    showCitySuggestions(cities) {
        if (!this.citySuggestions) return;

        this.citySuggestions.innerHTML = '';
        this.citySuggestions.style.display = 'block';

        cities.forEach(city => {
            const div = document.createElement('div');
            div.textContent = city;
            div.addEventListener('click', () => {
                if (this.volunteerCity) {
                    this.volunteerCity.value = city;
                    this.citySuggestions.style.display = 'none';
                }
            });
            this.citySuggestions.appendChild(div);
        });
    }

    addLocationButtons() {
        try {
            // Add location button to volunteer form
            if (this.volunteerLocationBtn && this.volunteerForm) {
                const volunteerLocationGroup = document.createElement('div');
                volunteerLocationGroup.className = 'form-group';
                volunteerLocationGroup.appendChild(this.volunteerLocationBtn);
                const formSection = this.volunteerForm.querySelector('.form-section');
                if (formSection) {
                    formSection.appendChild(volunteerLocationGroup);
                }
            }

            // Add location button to assisted form
            if (this.assistedLocationBtn && this.assistedForm) {
                const assistedLocationGroup = document.createElement('div');
                assistedLocationGroup.className = 'form-group';
                assistedLocationGroup.appendChild(this.assistedLocationBtn);
                const formSection = this.assistedForm.querySelector('.form-section');
                if (formSection) {
                    formSection.appendChild(assistedLocationGroup);
                }
            }
        } catch (error) {
            console.error('Error adding location buttons:', error);
        }
    }

    setupEventListeners() {
        try {
            // Event listener para o botão de localização
            const locationBtn = document.getElementById('get-location-btn');
            if (locationBtn) {
                locationBtn.addEventListener('click', async () => {
                    try {
                        if (!navigator.geolocation) {
                            showMessage('Geolocalização não é suportada pelo seu navegador.', 'error');
                            return;
                        }

                        const input = locationBtn.closest('.input-wrapper').querySelector('input');
                        if (!input) return;

                        // Desabilita o botão e mostra loading
                        locationBtn.disabled = true;
                        locationBtn.innerHTML = '<span class="material-icons">sync</span> Obtendo localização...';
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

                        // Atualiza o input de localização
                        input.value = address;
                        input.classList.add('location-obtained');

                        // Atualiza o input de cidade se existir
                        const cityInput = document.getElementById('volunteer-city');
                        if (cityInput && city) {
                            cityInput.value = city;
                            cityInput.classList.add('location-obtained');
                        }

                        // Atualiza o input de endereço se existir
                        const addressInput = document.getElementById('volunteer-address');
                        if (addressInput && fullAddress) {
                            addressInput.value = fullAddress;
                            addressInput.classList.add('location-obtained');
                        }

                        locationBtn.innerHTML = '<span class="material-icons">check</span> Localização obtida';
                        locationBtn.disabled = true;

                        // Remove mensagem de erro se existir
                        const errorMessage = input.parentElement.querySelector('.error-message');
                        if (errorMessage) {
                            errorMessage.remove();
                        }

                        showMessage('Localização obtida com sucesso!', 'success');

                        // Salva os dados da localização
                        const locationData = {
                            latitude,
                            longitude,
                            address,
                            city,
                            street,
                            number,
                            neighborhood,
                            fullAddress,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem('locationData', JSON.stringify(locationData));

                    } catch (error) {
                        console.error('Erro ao obter localização:', error);

                        // Adiciona mensagem de erro abaixo do input
                        const input = locationBtn.closest('.input-wrapper').querySelector('input');
                        if (input) {
                            input.classList.add('invalid');
                            const errorMessage = document.createElement('div');
                            errorMessage.className = 'error-message show';
                            errorMessage.textContent = 'Erro ao obter localização. Por favor, tente novamente.';
                            input.parentElement.appendChild(errorMessage);

                            // Rola até o input com erro
                            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            input.focus();
                        }

                        showMessage('Erro ao obter localização. Por favor, tente novamente.', 'error');

                        // Reseta o botão
                        locationBtn.disabled = false;
                        locationBtn.innerHTML = '<span class="material-icons">my_location</span> Obter Localização';
                    }
                });
            }

            // Add input focus effects
            const inputWrappers = document.querySelectorAll('.input-wrapper');
            inputWrappers.forEach(wrapper => {
                const input = wrapper.querySelector('input, select');
                if (input) {
                    input.addEventListener('focus', () => {
                        wrapper.classList.add('focused');
                    });
                    input.addEventListener('blur', () => {
                        wrapper.classList.remove('focused');
                    });
                }
            });

            // Add auto-fill buttons event listeners
            const autoFillSelfBtn = document.getElementById('auto-fill-self');
            const autoFillOtherBtn = document.getElementById('auto-fill-other');

            if (autoFillSelfBtn) {
                autoFillSelfBtn.addEventListener('click', () => {
                    autoFillSelfBtn.disabled = true;
                    autoFillSelfBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Preenchendo...';
                    this.autoFillForm('self');
                    setTimeout(() => {
                        autoFillSelfBtn.disabled = false;
                        autoFillSelfBtn.innerHTML = '<span class="material-icons">person</span> Preencher para Mim';
                    }, 1000);
                });
            }

            if (autoFillOtherBtn) {
                autoFillOtherBtn.addEventListener('click', () => {
                    autoFillOtherBtn.disabled = true;
                    autoFillOtherBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Preenchendo...';
                    this.autoFillForm('other');
                    setTimeout(() => {
                        autoFillOtherBtn.disabled = false;
                        autoFillOtherBtn.innerHTML = '<span class="material-icons">group</span> Preencher para Outra Pessoa';
                    }, 1000);
                });
            }

            // Add handler for filling_for checkbox
            const fillingForCheckboxes = document.querySelectorAll('input[name="filling_for"]');
            fillingForCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.value === 'self' && e.target.checked) {
                        // Desmarca o outro checkbox se estiver marcado
                        fillingForCheckboxes.forEach(otherCheckbox => {
                            if (otherCheckbox !== e.target) {
                                otherCheckbox.checked = false;
                            }
                        });
                        
                        // Valida os campos obrigatórios
                        const requiredFields = ['volunteer-name', 'volunteer-city', 'volunteer-location'];
                        let isValid = true;
                        let firstInvalidField = null;

                        requiredFields.forEach(fieldId => {
                            const field = document.getElementById(fieldId);
                            if (!field || !field.value.trim()) {
                                isValid = false;
                                if (!firstInvalidField) firstInvalidField = field;
                                
                                // Adiciona classe de erro
                                const wrapper = field.closest('.input-wrapper');
                                if (wrapper) {
                                    wrapper.classList.add('invalid');
                                    let errorMessage = wrapper.querySelector('.error-message');
                                    if (!errorMessage) {
                                        errorMessage = document.createElement('div');
                                        errorMessage.className = 'error-message';
                                        wrapper.appendChild(errorMessage);
                                    }
                                    errorMessage.textContent = 'Este campo é obrigatório';
                                    errorMessage.classList.add('show');
                                }
                            }
                        });

                        if (!isValid) {
                            // Desmarca o checkbox
                            e.target.checked = false;
                            
                            // Mostra mensagem de erro
                            showMessage('Por favor, preencha todos os campos obrigatórios antes de continuar.', 'error');
                            
                            // Rola até o primeiro campo inválido
                            if (firstInvalidField) {
                                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                firstInvalidField.focus();
                            }
                            return;
                        }
                        
                        // Salva os dados do voluntário como assistido
                        const volunteerData = {
                            name: this.volunteerName?.value || '',
                            socialName: this.volunteerSocialName?.value || '',
                            cpf: this.volunteerCpf?.value || '',
                            nis: this.volunteerNis?.value || '',
                            location: this.volunteerLocation?.value || '',
                            photo: this.volunteerPhoto?.files[0] || null,
                            timestamp: new Date().toISOString()
                        };
                        
                        localStorage.setItem('currentAssisted', JSON.stringify(volunteerData));
                        //localStorage.setItem('userOrigin', 'volunteer');
                        
                        // Redireciona para a tela de resultado
                        this.screenLoader.loadScreen('result');
                    }
                });
            });

            // Add submit button event listener
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.addEventListener('click', () => {
                    const form = document.getElementById('volunteer-form');
                    const formData = new FormData(form);
                    let isFormEmpty = true;

                    for (let value of formData.values()) {
                        if (value.trim() !== '') {
                            isFormEmpty = false;
                            break;
                        }
                    }

                    if (isFormEmpty) {
                        this.screenLoader.loadScreen('result');
                    } else {
                        this.handleVolunteerSubmit(event);
                    }
                });
            }

            // Add assisted button event listener
            const addAssistedBtn = document.getElementById('add-assisted');
            if (addAssistedBtn) {
                addAssistedBtn.addEventListener('click', () => {
                    this.showAssistedForm();
                });
            }

            // Add hover effects for buttons
            const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .voice-input-btn');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-1px)';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0)';
                });
            });

            // Add validation feedback
            const inputs = document.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    const wrapper = input.closest('.input-wrapper');
                    if (!wrapper) return;

                    let errorMessage = wrapper.querySelector('.error-message');
                    if (!errorMessage) {
                        errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        wrapper.appendChild(errorMessage);
                    }
                    
                    if (input.validity.valid) {
                        wrapper.classList.remove('invalid');
                        wrapper.classList.add('valid');
                        errorMessage.classList.remove('show');
                    } else {
                        wrapper.classList.remove('valid');
                        wrapper.classList.add('invalid');
                        errorMessage.textContent = this.getValidationMessage(input);
                        errorMessage.classList.add('show');
                    }
                });
            });

            // Add voice input feedback
            const voiceButtons = document.querySelectorAll('.voice-input-btn');
            voiceButtons.forEach(button => {
                button.addEventListener('click', () => {
                    button.classList.add('recording');
                    setTimeout(() => {
                        button.classList.remove('recording');
                    }, 1000);
                });
            });

            // Add checkbox and radio button feedback
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            const radioButtons = document.querySelectorAll('input[type="radio"]');
            
            [...checkboxes, ...radioButtons].forEach(input => {
                input.addEventListener('change', () => {
                    const label = input.closest('label');
                    if (label) {
                        label.style.backgroundColor = input.checked ? 'var(--primary-light)' : 'transparent';
                    }
                });
            });

            // Add form submission feedback
            const volunteerForm = document.getElementById('volunteer-form');
            if (volunteerForm) {
                volunteerForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.handleVolunteerSubmit(event);
                });
            }

            // Add input event listeners for form validation
            if (this.requiredFields) {
                this.requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => this.checkFormValidity());
                    }
                });
            }

            if (this.assistedRequiredFields) {
                this.assistedRequiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => this.checkAssistedFormValidity());
                    }
                });
            }

            // Add logout event listener
            if (this.logoutBtn) {
                this.logoutBtn.addEventListener('click', () => this.handleLogout());
            }

            // Initialize voice input
            this.initializeVoiceInput();

            // Add toggle button event listener
            if (this.autoFillToggle) {
                this.autoFillToggle.addEventListener('click', () => this.toggleAutoFill());
            }
        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    setupAssistedForm() {
        const addAssistedBtn = document.getElementById('add-assisted');
        const assistedForm = document.getElementById('assistedForm');
        const closeModal = document.querySelector('.close-modal');
        const submitAssistedBtn = document.getElementById('submit-assisted');
        const locationInput = document.getElementById('assisted-location');
        const locationBtn = document.getElementById('assisted-location-btn');

        if (addAssistedBtn) {
            addAssistedBtn.addEventListener('click', () => {
                this.showAssistedForm();
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeAssistedModal();
            });
        }

        if (submitAssistedBtn) {
            submitAssistedBtn.addEventListener('click', () => {
                this.handleAssistedSubmit();
            });
        }

        // Configurar botão de localização
        if (locationBtn) {
            locationBtn.addEventListener('click', async () => {
                try {
                    if (!navigator.geolocation) {
                        showMessage('Geolocalização não é suportada pelo seu navegador.', 'error');
                        return;
                    }

                    // Desabilita o botão e mostra loading
                    locationBtn.disabled = true;
                    locationBtn.innerHTML = '<span class="material-icons">sync</span> Obtendo localização...';
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
                    
                    // Atualiza o input e o botão
                    locationInput.value = address;
                    locationInput.classList.add('location-obtained');
                    locationBtn.innerHTML = '<span class="material-icons">check</span> Localização obtida';
                    locationBtn.disabled = true;
                    
                    // Remove mensagem de erro se existir
                    const errorMessage = locationInput.parentElement.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.remove();
                    }
                    
                    showMessage('Localização obtida com sucesso!', 'success');
                    
                } catch (error) {
                    console.error('Erro ao obter localização:', error);
                    
                    // Adiciona mensagem de erro abaixo do input
                    locationInput.classList.add('invalid');
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message show';
                    errorMessage.textContent = 'Erro ao obter localização. Por favor, tente novamente ou digite o endereço manualmente.';
                    locationInput.parentElement.appendChild(errorMessage);
                    
                    showMessage('Erro ao obter localização. Por favor, tente novamente ou digite o endereço manualmente.', 'error');
                    
                    // Reseta o botão
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = '<span class="material-icons">my_location</span> Obter Localização';
                }
            });
        }

        // Configurar input de localização
        if (locationInput) {
            locationInput.addEventListener('input', () => {
                // Remove classes de estado quando o usuário começa a digitar
                locationInput.classList.remove('location-obtained', 'invalid');
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<span class="material-icons">my_location</span> Obter Localização';
                
                // Remove mensagem de erro se existir
                const errorMessage = locationInput.parentElement.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });
        }

        // Configurar upload de foto
        const photoInput = document.getElementById('assisted-photo');
        const photoPreview = document.getElementById('assisted-photo-preview');
        
        if (photoInput && photoPreview) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        photoPreview.style.backgroundImage = `url(${e.target.result})`;
                        photoPreview.classList.add('has-photo');
                        photoPreview.innerHTML = '';
                    };
                    reader.readAsDataURL(file);
                }
            });

            photoPreview.addEventListener('click', () => {
                photoInput.click();
            });
        }
    }

    validateAssistedForm() {
        const form = document.getElementById('assistedForm');
        if (!form) {
            console.error('Formulário de assistido não encontrado');
            return false;
        }

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo é obrigatório');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validação específica para CPF
        const cpfField = form.querySelector('#assisted-cpf');
        if (cpfField && cpfField.value && !CPFValidator.validate(cpfField.value)) {
            this.showFieldError(cpfField, 'CPF inválido');
            isValid = false;
        }

        // Validação específica para telefone
        const phoneField = form.querySelector('#assisted-phone');
        if (phoneField && phoneField.value && !this.validatePhone(phoneField.value)) {
            this.showFieldError(phoneField, 'Telefone inválido');
            isValid = false;
        }

        return isValid;
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;

        // Validação básica de CPF
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let rest = 11 - (sum % 11);
        let digit1 = rest > 9 ? 0 : rest;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        rest = 11 - (sum % 11);
        let digit2 = rest > 9 ? 0 : rest;

        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }

    validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    showFieldError(field, message) {
        const wrapper = field.closest('.input-wrapper');
        if (!wrapper) return;

        let errorMessage = wrapper.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            wrapper.appendChild(errorMessage);
        }

        errorMessage.textContent = message;
        wrapper.classList.add('error');
    }

    clearFieldError(field) {
        const wrapper = field.closest('.input-wrapper');
        if (!wrapper) return;

        const errorMessage = wrapper.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        wrapper.classList.remove('error');
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async getAddressFromCoords(latitude, longitude) {
        // Em produção, usar uma API de geocoding como Google Maps ou OpenStreetMap
        // Aqui estamos apenas simulando a resposta
        return `Rua Exemplo, ${Math.floor(Math.random() * 1000)} - São Paulo, SP`;
    }

    closeAssistedModal() {
        this.hideAssistedForm();
    }

    toggleAutoFill() {
        try {
            const isActive = document.body.classList.toggle('auto-fill-active');
            const icon = this.autoFillToggle.querySelector('.material-icons');
            
            if (isActive) {
                icon.textContent = 'pause';
                this.autoFillToggle.classList.add('active');
            } else {
                icon.textContent = 'play_arrow';
                this.autoFillToggle.classList.remove('active');
            }
        } catch (error) {
            console.error('Erro ao alternar preenchimento automático:', error);
        }
    }
}

// Initialize the screen when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const screen = new VolunteerScreen();
    window.screen = screen; // Make screen instance available globally
    // Only call setupAssistedForm if the element exists
    if (document.getElementById('assisted-form')) {
        screen.setupAssistedForm();
    } else {
        console.warn('assisted-form não encontrado no DOM após DOMContentLoaded');
    }
}); 