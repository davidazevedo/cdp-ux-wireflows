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
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
        
        // Make methods available globally
        window.navigateToKitchens = (index) => this.navigateToKitchens(index);
        window.removeAssisted = (index) => this.removeAssisted(index);
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
                'volunteerName',
                'volunteerCpf',
                'volunteerBirthdate',
                'volunteerPhone',
                'volunteerEmail',
                'volunteerAddress',
                'volunteerCity',
                'volunteerState'
            ];

            // Add assisted required fields array
            this.assistedRequiredFields = [
                'assistedName',
                'assistedCpf',
                'assistedPhone',
                'assistedAddress',
                'assistedCity',
                'assistedState'
            ];

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
        } catch (error) {
            console.error('Erro ao mostrar formulário de assistido:', error);
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
            const assistedForm = document.getElementById('assistedForm');
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
                if (field.type === 'radio' || field.type === 'checkbox') {
                    // Para grupos de radio/checkbox, verificar se algum está selecionado
                    const groupName = field.name;
                    const isChecked = document.querySelector(`input[name="${groupName}"]:checked`);
                    if (!isChecked) {
                        isValid = false;
                    }
                } else {
                    // Para outros campos, verificar se tem valor
                    if (!field.value || !field.value.trim()) {
                        isValid = false;
                    }
                }
            }
        });

        // Verificar se o nome social é obrigatório (quando checkbox está marcado)
        if (this.socialNameCheckbox && this.socialNameCheckbox.checked) {
            if (!this.volunteerSocialName || !this.volunteerSocialName.value.trim()) {
                isValid = false;
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
            // Volunteer form event listeners
            if (this.volunteerPhoto) {
                this.volunteerPhoto.addEventListener('change', (event) => this.handlePhotoUpload(event, 'volunteer'));
            }
            if (this.volunteerPhotoPreview) {
                this.volunteerPhotoPreview.addEventListener('click', () => this.volunteerPhoto?.click());
            }

            // Assisted form event listeners
            if (this.addAssistedBtn) {
                this.addAssistedBtn.addEventListener('click', () => {
                    this.showAssistedForm();
                });
            }

            // Add photo upload event listeners for assisted form
            if (this.assistedPhoto && this.assistedPhotoPreview) {
                this.assistedPhoto.addEventListener('change', (event) => this.handlePhotoUpload(event, 'assisted'));
                this.assistedPhotoPreview.addEventListener('click', () => this.assistedPhoto.click());
            }

            // Add location button event listener for assisted form
            if (this.assistedLocationBtn) {
                this.assistedLocationBtn.addEventListener('click', () => this.getLocation(this.assistedLocationBtn));
            }

            // Add location button event listener for volunteer form
            if (this.volunteerLocationBtn) {
                this.volunteerLocationBtn.addEventListener('click', () => this.getLocation(this.volunteerLocationBtn));
            }

            // Add form submission event listener
            if (this.volunteerForm) {
                this.volunteerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleVolunteerSubmit();
                });
            }

            // Add click event listener for submit button
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.addEventListener('click', () => this.handleVolunteerSubmit());
            }

            // Add auto-fill button event listener
            const autoFillBtn = document.getElementById('auto-fill');
            if (autoFillBtn) {
                autoFillBtn.addEventListener('click', () => this.autoFillForm());
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

    loadCachedData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData && userData.role === 'volunteer') {
                const now = new Date().getTime();
                const oneDay = 24 * 60 * 60 * 1000;

                if (now - userData.timestamp < oneDay) {
                    // Preencher formulário com dados em cache
                    if (this.volunteerCpf) this.volunteerCpf.value = userData.cpf || '';
                    if (this.volunteerName) this.volunteerName.value = userData.name || '';
                    if (this.volunteerSocialName) this.volunteerSocialName.value = userData.socialName || '';
                    if (this.volunteerBirthdate) this.volunteerBirthdate.value = userData.birthdate || '';
                    if (this.volunteerGender) this.volunteerGender.value = userData.gender || '';
                    if (this.volunteerCity) this.volunteerCity.value = userData.city || '';
                    if (this.volunteerAddress) this.volunteerAddress.value = userData.address || '';
                    if (this.volunteerNis) this.volunteerNis.value = userData.nis || '';
                    
                    if (userData.photo) {
                        if (this.volunteerPhotoPreview) {
                            this.volunteerPhotoPreview.style.backgroundImage = `url(${userData.photo})`;
                            this.volunteerPhotoPreview.classList.add('has-photo');
                        }
                        
                        if (this.volunteerAvatar) {
                            this.volunteerAvatar.style.backgroundImage = `url(${userData.photo})`;
                            this.volunteerAvatar.classList.add('has-photo');
                        }
                    }

                    if (userData.location && this.volunteerLocation) {
                        this.volunteerLocation.value = userData.location;
                        if (this.volunteerLocationBtn) {
                            this.volunteerLocationBtn.innerHTML = '<span class="material-icons">check_circle</span> Localização Obtida';
                            this.volunteerLocationBtn.disabled = true;
                        }
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
        } catch (error) {
            console.error('Erro ao carregar dados em cache:', error);
            // Em caso de erro, limpa o cache e reseta o estado
            localStorage.removeItem('userData');
            this.assistedList = [];
            this.updateUIState();
        }
    }

    async handleVolunteerSubmit() {
        try {
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
                homeless: document.querySelector('input[name="homeless"]:checked')?.value,
                fillingFor: Array.from(document.querySelectorAll('input[name="filling_for"]:checked')).map(cb => cb.value),
                location: this.volunteerLocation.value,
                photo: this.volunteerPhoto.files[0],
                role: 'volunteer',
                timestamp: new Date().getTime()
            };

            // Disable submit button and show loading state
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.disabled = true;
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">sync</span> Salvando...';
            }

            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(formData));
            
            // Update volunteer profile
            this.updateVolunteerProfile(formData.name, formData.photo);
            
            // Update UI state
            this.updateUIState();
            
            // Show success message
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">check</span> Dados recebidos com sucesso!';
                this.submitVolunteerBtn.style.backgroundColor = 'var(--success-color)';

                // Reset button after 2 seconds
                setTimeout(() => {
                    this.submitVolunteerBtn.disabled = false;
                    this.submitVolunteerBtn.innerHTML = '<span class="material-icons">save</span> Salvar';
                    this.submitVolunteerBtn.style.backgroundColor = 'var(--primary-color)';
                }, 2000);
            }

        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            alert('Houve um problema ao enviar seus dados. Tente novamente mais tarde.');
            
            if (this.submitVolunteerBtn) {
                this.submitVolunteerBtn.innerHTML = '<span class="material-icons">error</span> Erro ao salvar';
                this.submitVolunteerBtn.style.backgroundColor = 'var(--error-color)';
            }
        }
    }

    validateForm() {
        let isValid = true;
        const errors = [];

        // Validar nome
        if (!this.volunteerName?.value.trim()) {
            errors.push('Por favor, preencha o campo obrigatório: Nome Completo');
            isValid = false;
        }

        // Validar município
        if (!this.volunteerCity?.value.trim()) {
            errors.push('Por favor, preencha o campo obrigatório: Município');
            isValid = false;
        }

        // Validar CPF
        if (this.volunteerCpf?.value && !this.validateCPF(this.volunteerCpf.value)) {
            errors.push('O CPF informado não é válido. Verifique e tente novamente.');
            isValid = false;
        }

        // Validar data de nascimento
        if (this.volunteerBirthdate?.value && !this.validateBirthDate(this.volunteerBirthdate.value)) {
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
        if (!this.volunteerLocation?.value) {
            errors.push('Por favor, obtenha a localização.');
            isValid = false;
        }

        return { isValid, errors };
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
}

// Initialize the screen when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const screen = new VolunteerScreen();
    window.screen = screen; // Make screen instance available globally
}); 