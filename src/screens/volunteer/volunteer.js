import { ScreenLoader } from '../../utils/screenLoader.js';
import { showMessage } from '../../utils/messages.js';

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
        } catch (error) {
            console.error('Error initializing volunteer screen:', error);
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
            this.assistedForm = document.getElementById('assistedForm');
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

                // Ensure modal is in the DOM
                if (!document.body.contains(this.assistedForm)) {
                    document.body.appendChild(this.assistedForm);
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

                // Ensure modal is in the DOM
                if (!document.body.contains(this.photoModal)) {
                    document.body.appendChild(this.photoModal);
                }
            }
        } catch (error) {
            console.error('Erro ao inicializar modais:', error);
        }
    }

    showAssistedForm() {
        try {
            if (!this.assistedForm) {
                console.error('Modal de assistido não encontrado');
                return;
            }

            // Ensure modal is in the DOM
            if (!document.body.contains(this.assistedForm)) {
                document.body.appendChild(this.assistedForm);
            }

            // Reset form when opening
            this.resetAssistedForm();
            
            // Show modal
            this.assistedForm.style.display = 'flex';
            this.assistedForm.classList.add('active');

            // Focus first input
            if (this.assistedName) {
                this.assistedName.focus();
            }

            // Adiciona botão de auto-preenchimento
            const modalHeader = this.assistedForm.querySelector('.form-section');
            if (modalHeader) {
                const autoFillBtn = document.createElement('button');
                autoFillBtn.type = 'button';
                autoFillBtn.className = 'btn-secondary auto-fill-assisted';
                autoFillBtn.innerHTML = '<span class="material-icons">auto_fix_high</span> Preencher Automaticamente';
                autoFillBtn.addEventListener('click', () => this.autoFillAssistedForm());
                modalHeader.insertBefore(autoFillBtn, modalHeader.firstChild);
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
                const checkbox = document.querySelector(`input[name="situation"][value="${situation}"]`);
                if (checkbox) checkbox.checked = true;
            });

            // Simular upload de foto
            if (this.assistedPhotoPreview) {
                this.assistedPhotoPreview.style.backgroundImage = 'url("https://avatars.githubusercontent.com/u/984221?v=4&size=64")';
                this.assistedPhotoPreview.classList.add('has-photo');
            }

            // Disparar eventos de input para todos os campos preenchidos
            const formInputs = document.querySelectorAll('#assisted-form input, #assisted-form select');
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
    }

    hideAssistedForm() {
        try {
            if (!this.assistedForm) {
                console.error('Modal de assistido não encontrado');
                return;
            }

            this.assistedForm.style.display = 'none';
            this.assistedForm.classList.remove('active');
            this.resetAssistedForm();
        } catch (error) {
            console.error('Erro ao esconder formulário de assistido:', error);
        }
    }

    updateAssistedList() {
        const assistedList = document.getElementById('assisted-list');
        if (!assistedList) {
            console.error('Lista de assistidos não encontrada');
            return;
        }

        // Get user data from localStorage
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

        assistedList.innerHTML = assistedListData.map((assisted, index) => {
            // Nome reduzido ou apelido
            let displayName = assisted.nickname && assisted.nickname.trim()
                ? assisted.nickname
                : this.getShortName(assisted.name);
            // CPF mascarado
            let cpfMasked = assisted.cpf ? assisted.cpf.substring(0, 3) + '.***.***-**' : '';
            // Situações
            let situationsHtml = (assisted.situations || []).map(situation => `
                <span class="situation-tag" title="${this.getSituationLabel(situation)}">
                    <span class="material-icons situation-icon">${this.getSituationIcon(situation)}</span>
                </span>
            `).join(' ');
            return `
                <div class="assisted-card">
                    <div class="assisted-photo">
                        ${assisted.photo ? 
                            `<img src="${URL.createObjectURL(assisted.photo)}" alt="Foto de ${displayName}">` :
                            `<span class="material-icons">person</span>`
                        }
                    </div>
                    <div class="assisted-info">
                        <h3>${displayName}</h3>
                        <p class="cpf">CPF: ${cpfMasked}</p>
                        <div class="situations">${situationsHtml}</div>
                    </div>
                    <div class="assisted-actions">
                        <button class="btn-primary" onclick="window.navigateToKitchens(${index})" title="Buscar Cozinhas">
                            <span class="material-icons">restaurant</span>
                        </button>
                        <button onclick="window.removeAssisted(${index})" class="btn-secondary" title="Remover">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
     
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

    loadCachedData() {
        try {
            // Load user data from localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // If user data exists, populate the form
            if (userData && Object.keys(userData).length > 0) {
                if (this.volunteerName) this.volunteerName.value = userData.name || '';
                if (this.volunteerSocialName) this.volunteerSocialName.value = userData.socialName || '';
                if (this.volunteerBirthdate) this.volunteerBirthdate.value = userData.birthdate || '';
                if (this.volunteerGender) this.volunteerGender.value = userData.gender || '';
                if (this.volunteerCity) this.volunteerCity.value = userData.city || '';
                if (this.volunteerAddress) this.volunteerAddress.value = userData.address || '';
                if (this.volunteerCpf) this.volunteerCpf.value = userData.cpf || '';
                if (this.volunteerNis) this.volunteerNis.value = userData.nis || '';
                if (this.volunteerLocation) this.volunteerLocation.value = userData.location || '';

                // Set radio buttons
                if (userData.homeless) {
                    const homelessRadio = document.querySelector(`input[name="homeless"][value="${userData.homeless}"]`);
                    if (homelessRadio) homelessRadio.checked = true;
                }

                // Set checkboxes
                if (userData.fillingFor) {
                    userData.fillingFor.forEach(value => {
                        const fillingForCheckbox = document.querySelector(`input[name="filling_for"][value="${value}"]`);
                        if (fillingForCheckbox) fillingForCheckbox.checked = true;
                    });
                }

                // Update profile
                this.updateVolunteerProfile(userData.name, userData.photo);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do cache:', error);
        }
    }

    updateUIState() {
        try {
            const addAssistedBtn = document.getElementById('add-assisted');
            const assistedList = document.getElementById('assisted-list');
            const volunteerForm = document.getElementById('volunteer-form');
            const assistedForm = document.getElementById('assistedForm');
            const assistedSection = document.getElementById('assisted-section');
            
            // Verificar se há dados no localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const isUserLoggedIn = userData && userData.role === 'volunteer';
            
            // Ocultar/mostrar seção de assistidos baseado no login e cadastro
            if (assistedSection) {
                assistedSection.style.display = isUserLoggedIn ? 'block' : 'none';
            }
            
            if (addAssistedBtn) {
                addAssistedBtn.style.display = isUserLoggedIn ? 'block' : 'none';
            }
            
         
            
            if (volunteerForm) {
                volunteerForm.style.display = isUserLoggedIn ? 'none' : 'block';
            }
            
            if (assistedForm) {
                assistedForm.style.display = 'none';
                assistedForm.classList.remove('active');
            }

        } catch (error) {
            console.error('Erro ao atualizar o estado da UI:', error);
        }
    }

    async handleVolunteerSubmit() {
        try {
            // Validate form
            if (!this.validateForm('volunteer')) {
                return;
            }

            // Disable submit button and show loading state
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.disabled = true;
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">sync</span> Salvando...';
            }

            // Collect form data
            const formData = {
                name: this.volunteerName?.value || '',
                socialName: this.volunteerSocialName?.value || '',
                birthdate: this.volunteerBirthdate?.value || '',
                gender: this.volunteerGender?.value || '',
                city: this.volunteerCity?.value || '',
                address: this.volunteerAddress?.value || '',
                cpf: this.volunteerCpf?.value || '',
                nis: this.volunteerNis?.value || '',
                homeless: document.querySelector('input[name="homeless"]:checked')?.value || '',
                fillingFor: Array.from(document.querySelectorAll('input[name="filling_for"]:checked')).map(cb => cb.value),
                location: this.volunteerLocation?.value || '',
                photo: this.volunteerPhoto?.files[0] || null,
                role: 'volunteer',
                timestamp: new Date().getTime(),
                assistedList: [] // Inicializa a lista de assistidos vazia
            };

            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(formData));
            
            // Update volunteer profile
            this.updateVolunteerProfile(formData.name, formData.photo);
            
            // Update UI state
            this.updateUIState();
            
            // Show success message
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">check</span> Dados salvos com sucesso!';
                this.submitVolunteerBtn.style.backgroundColor = 'var(--success-color)';

                // Reset button after 2 seconds
                setTimeout(() => {
                    this.submitVolunteerBtn.disabled = false;
                    this.submitVolunteerBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                    this.submitVolunteerBtn.style.backgroundColor = 'var(--primary-color)';
                }, 2000);
            }

            // Show success message
            if (typeof showMessage === 'function') {
                showMessage('Dados salvos com sucesso!', 'success');
            } else {
                alert('Dados salvos com sucesso!');
            }

        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
                this.submitVolunteerBtn.style.backgroundColor = 'var(--error-color)';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.submitVolunteerBtn.disabled = false;
                    this.submitVolunteerBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                    this.submitVolunteerBtn.style.backgroundColor = 'var(--primary-color)';
                }, 2000);
            }

            if (typeof showMessage === 'function') {
                showMessage('Erro ao salvar dados. Por favor, tente novamente.', 'error');
            } else {
                alert('Erro ao salvar dados. Por favor, tente novamente.');
            }
        }
    }

    validateForm(formType = 'volunteer') {
        const form = formType === 'volunteer' ? this.volunteerForm : this.assistedForm;
        const requiredFields = formType === 'volunteer' ? this.requiredFields : this.assistedRequiredFields;
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
            } else if (fieldId.includes('cpf') && !this.validateCPF(value)) {
                fieldError = 'CPF inválido';
            } else if (fieldId.includes('birthdate') && !this.validateBirthDate(value)) {
                fieldError = 'Data de nascimento inválida';
            } else if (fieldId.includes('email') && !this.validateEmail(value)) {
                fieldError = 'E-mail inválido';
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
            // Usar alert como fallback se showMessage não estiver disponível
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
        voiceButtons.forEach(button => {
            const inputId = button.closest('.input-wrapper').querySelector('input').id;
            button.setAttribute('data-input', inputId);
            
            // Adiciona feedback visual ao clicar
            button.addEventListener('click', () => {
                button.classList.add('recording');
                const input = document.getElementById(inputId);
                if (input) {
                    input.classList.add('loading');
                    const loadingMessage = document.createElement('div');
                    loadingMessage.className = 'loading-message';
                    loadingMessage.textContent = 'Iniciando reconhecimento de voz...';
                    input.parentElement.appendChild(loadingMessage);
                    
                    // Simula o reconhecimento de voz
                    setTimeout(() => {
                        button.classList.remove('recording');
                        input.classList.remove('loading');
                        loadingMessage.remove();
                        
                        // Adiciona feedback de sucesso
                        const successMessage = document.createElement('div');
                        successMessage.className = 'success-message show';
                        successMessage.textContent = 'Voz reconhecida com sucesso!';
                        input.parentElement.appendChild(successMessage);
                        
                        setTimeout(() => {
                            successMessage.remove();
                        }, 2000);
                    }, 2000);
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

        // Lista de campos obrigatórios
        const requiredFields = [
            'volunteer-name',
            'volunteerGender',
            'volunteer-birthdate',
            'volunteer-city',
            'volunteer-cpf',
            'volunteer-location'
        ];

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

    autoFillForm() {
        try {
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
                    .map(checkbox => checkbox.value),
                id: Date.now(),
                createdAt: new Date().toISOString()
            };

            // Validate required fields
            if (!formData.name || !formData.cpf || !formData.phone || !formData.location) {
                if (typeof showMessage === 'function') {
                    showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                } else {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                }
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

            // Fecha o modal após 1 segundo
            setTimeout(() => {
                this.closeAssistedModal();
                this.updateAssistedList();
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar dados do assistido:', error);
            this.submitAssistedBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
            this.submitAssistedBtn.style.backgroundColor = 'var(--error-color)';

            if (typeof showMessage === 'function') {
                showMessage('Erro ao salvar dados do assistido.', 'error');
            } else {
                alert('Erro ao salvar dados do assistido.');
            }
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

            // Add submit button event listener
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleVolunteerSubmit();
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
            if (this.volunteerForm) {
                this.volunteerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleVolunteerSubmit();
                });
            }

            // Add auto-fill button event listener
            const autoFillBtn = document.getElementById('auto-fill');
            if (autoFillBtn) {
                autoFillBtn.addEventListener('click', () => {
                    autoFillBtn.disabled = true;
                    autoFillBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Preenchendo...';
                    this.autoFillForm();
                    setTimeout(() => {
                        autoFillBtn.disabled = false;
                        autoFillBtn.innerHTML = '<span class="material-icons">auto_fix_high</span> Preencher Automaticamente';
                    }, 1000);
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
        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    setupAssistedForm() {
        const form = document.getElementById('assisted-form');
        if (!form) {
            console.warn('Formulário de assistido não encontrado');
            return;
        }

        const autoFillBtn = form.querySelector('.auto-fill-assisted');
        const hasSocialNameCheckbox = form.querySelector('#has-social-name');
        const socialNameInput = form.querySelector('#assisted-social-name');
        const getLocationBtn = form.querySelector('#get-location-btn');
        const locationInput = form.querySelector('#assisted-location');
        const photoInput = form.querySelector('#assisted-photo');
        const photoPreview = form.querySelector('.photo-preview');

        // Toggle nome social
        if (hasSocialNameCheckbox && socialNameInput) {
            hasSocialNameCheckbox.addEventListener('change', () => {
                const inputWrapper = socialNameInput.closest('.input-wrapper');
                if (hasSocialNameCheckbox.checked) {
                    inputWrapper.classList.add('show');
                    socialNameInput.focus();
                } else {
                    inputWrapper.classList.remove('show');
                    socialNameInput.value = '';
                }
            });
        }

        // Preenchimento automático
        if (autoFillBtn) {
            autoFillBtn.addEventListener('click', () => {
                const fakeData = {
                    name: 'Maria Silva',
                    socialName: 'Maria Luiza',
                    nickname: 'Malu',
                    cpf: '123.456.789-00',
                    nis: '123.45678.90-1',
                    phone: '(11) 98765-4321',
                    location: 'Rua das Flores, 123 - São Paulo, SP',
                    situations: ['homeless', 'unemployed']
                };

                // Preenche os campos
                const nameInput = form.querySelector('#assisted-name');
                if (nameInput) nameInput.value = fakeData.name;
                
                if (hasSocialNameCheckbox) {
                    hasSocialNameCheckbox.checked = true;
                    if (socialNameInput) {
                        socialNameInput.closest('.input-wrapper').classList.add('show');
                        socialNameInput.value = fakeData.socialName;
                    }
                }

                const nicknameInput = form.querySelector('#assisted-nickname');
                if (nicknameInput) nicknameInput.value = fakeData.nickname;

                const cpfInput = form.querySelector('#assisted-cpf');
                if (cpfInput) cpfInput.value = fakeData.cpf;

                const nisInput = form.querySelector('#assisted-nis');
                if (nisInput) nisInput.value = fakeData.nis;

                const phoneInput = form.querySelector('#assisted-phone');
                if (phoneInput) phoneInput.value = fakeData.phone;

                if (locationInput) locationInput.value = fakeData.location;

                // Marca as situações
                fakeData.situations.forEach(situation => {
                    const checkbox = form.querySelector(`input[name="situations"][value="${situation}"]`);
                    if (checkbox) checkbox.checked = true;
                });

                // Feedback visual
                autoFillBtn.innerHTML = '<span class="material-icons">check</span> Dados preenchidos!';
                autoFillBtn.classList.add('success');
                setTimeout(() => {
                    autoFillBtn.innerHTML = '<span class="material-icons">auto_fix_high</span> Preencher com dados de exemplo';
                    autoFillBtn.classList.remove('success');
                }, 2000);
            });
        }

        // Obter localização
        if (getLocationBtn && locationInput) {
            getLocationBtn.addEventListener('click', async () => {
                try {
                    getLocationBtn.disabled = true;
                    getLocationBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Obtendo localização...';

                    const position = await this.getCurrentPosition();
                    const { latitude, longitude } = position.coords;

                    // Simula obtenção do endereço (em produção, usar API de geocoding)
                    const address = await this.getAddressFromCoords(latitude, longitude);
                    locationInput.value = address;

                    getLocationBtn.innerHTML = '<span class="material-icons">check</span> Localização obtida!';
                    getLocationBtn.classList.add('success');
                } catch (error) {
                    console.error('Erro ao obter localização:', error);
                    getLocationBtn.innerHTML = '<span class="material-icons">error</span> Erro ao obter localização';
                    getLocationBtn.classList.add('error');
                } finally {
                    setTimeout(() => {
                        getLocationBtn.disabled = false;
                        getLocationBtn.innerHTML = '<span class="material-icons">my_location</span> Usar minha localização';
                        getLocationBtn.classList.remove('success', 'error');
                    }, 2000);
                }
            });
        }

        // Preview da foto
        if (photoInput && photoPreview) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        photoPreview.innerHTML = `
                            <img src="${e.target.result}" alt="Preview da foto">
                            <button type="button" class="remove-photo">
                                <span class="material-icons">close</span>
                            </button>
                        `;
                        photoPreview.classList.add('has-photo');
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Remover foto
            photoPreview.addEventListener('click', (e) => {
                if (e.target.closest('.remove-photo')) {
                    photoInput.value = '';
                    photoPreview.innerHTML = '';
                    photoPreview.classList.remove('has-photo');
                }
            });
        }

        // Validação do formulário
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateAssistedForm()) {
                return;
            }

            const submitBtn = form.querySelector('#submit-assisted');
            if (!submitBtn) return;

            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Salvando...';

                const formData = new FormData(form);
                const assistedData = {
                    name: formData.get('name'),
                    socialName: formData.get('socialName'),
                    nickname: formData.get('nickname'),
                    cpf: formData.get('cpf'),
                    nis: formData.get('nis'),
                    phone: formData.get('phone'),
                    location: formData.get('location'),
                    situations: Array.from(formData.getAll('situations')),
                    photo: formData.get('photo')
                };

                // Simula chamada ao backend
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Salva no localStorage
                const assistedList = JSON.parse(localStorage.getItem('assistedList') || '[]');
                assistedList.push({
                    ...assistedData,
                    id: Date.now(),
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('assistedList', JSON.stringify(assistedList));

                // Feedback de sucesso
                submitBtn.innerHTML = '<span class="material-icons">check</span> Salvo com sucesso!';
                submitBtn.classList.add('success');

                // Fecha o modal após 1 segundo
                setTimeout(() => {
                    this.closeAssistedModal();
                    this.updateAssistedList();
                }, 1000);

            } catch (error) {
                console.error('Erro ao salvar assistido:', error);
                submitBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
                submitBtn.classList.add('error');
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.classList.remove('success', 'error');
                }, 2000);
            }
        });
    }

    validateAssistedForm() {
        const form = document.getElementById('assisted-form');
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
        if (cpfField.value && !this.validateCPF(cpfField.value)) {
            this.showFieldError(cpfField, 'CPF inválido');
            isValid = false;
        }

        // Validação específica para telefone
        const phoneField = form.querySelector('#assisted-phone');
        if (phoneField.value && !this.validatePhone(phoneField.value)) {
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