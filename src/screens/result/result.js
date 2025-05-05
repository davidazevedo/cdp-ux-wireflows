import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';
import { getKitchens } from '../../js/services/kitchensService.js';

export class ResultScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.screensContainer = document.getElementById('screenContainer');
        this.elements = {};
        this.currentAssisted = {};
        this.origin = null;
        
        this.initializeElements();
        this.loadState().catch(error => {
            showMessage('Erro ao inicializar a tela', 'error');
        });
    }

    initializeElements() {
        this.kitchensList = document.getElementById('kitchensList');
        this.backBtn = document.getElementById('backBtn');
        this.filterBtn = document.getElementById('filterBtn');
        this.searchInput = document.getElementById('searchInput');
        this.filterTags = document.querySelectorAll('.filter-tag');

        if (!this.kitchensList || !this.backBtn || !this.filterBtn || !this.searchInput) {
            showMessage('Elementos da tela não encontrados', 'error');
            return;
        }
    }

    async loadState() {
        // Carrega o estado do usuário
        const userOrigin = localStorage.getItem('userOrigin');
        const currentAssisted = localStorage.getItem('currentAssisted');
        console.log("currentAssisted", currentAssisted);

        this.origin = userOrigin;

        if (this.origin === 'volunteer') {
            if (!currentAssisted) {
                showMessage('Erro ao carregar dados do assistido', 'error');
                try {
                    await this.screenLoader.loadScreen('volunteer');
                } catch (error) {
                    showMessage('Erro ao carregar tela de voluntário', 'error');
                }
                return;
            }
        
        } else if (this.origin === 'cpf') {
            if (!currentAssisted) {
                showMessage('Erro ao carregar dados do usuário', 'error');
                try {
                    await this.screenLoader.loadScreen('cpf');
                } catch (error) {
                    showMessage('Erro ao carregar tela de CPF', 'error');
                }
                return;
            }
        }

        // Atualiza a interface com os dados do usuário
        this.updateUserInfo();
        this.loadKitchens();
    }

    async loadKitchens() {
        try {
            this.showLoading();
            
            // Simula o carregamento das cozinhas (substitua por sua API real)
            const kitchens = [
                {
                    id: 1,
                    name: "Cozinha Comunitária Centro",
                    address: "Rua Principal, 123 - Centro",
                    distance: "0.5 km",
                    status: "aberta",
                    currentOccupancy: 15,
                    capacity: 30,
                    operatingHours: "08:00 - 22:00",
                    rating: 4.5
                },
                {
                    id: 2,
                    name: "Cozinha Comunitária Vila Nova",
                    address: "Av. Secundária, 456 - Vila Nova",
                    distance: "1.2 km",
                    status: "aberta",
                    currentOccupancy: 20,
                    capacity: 40,
                    operatingHours: "07:00 - 21:00",
                    rating: 4.2
                },
                {
                    id: 3,
                    name: "Cozinha Comunitária Jardim",
                    address: "Rua das Flores, 789 - Jardim",
                    distance: "2.0 km",
                    status: "fechada",
                    currentOccupancy: 0,
                    capacity: 25,
                    operatingHours: "09:00 - 20:00",
                    rating: 4.0
                }
            ];

            if (!kitchens || kitchens.length === 0) {
                this.kitchensList.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons">restaurant</span>
                        <p>Nenhuma cozinha encontrada na sua região.</p>
                    </div>
                `;
                return;
            }
            
            this.kitchens = kitchens;
            this.renderKitchens(kitchens);
        } catch (error) {
            showMessage('Erro ao carregar cozinhas. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderKitchens(kitchens) {
        if (!this.kitchensList) return;

        this.kitchensList.innerHTML = kitchens.map(kitchen => `
            <div class="kitchen-card" data-id="${kitchen.id}">
                <div class="kitchen-header">
                    <div class="header-left">
                        <h3 class="kitchen-name">${kitchen.name}</h3>
                        <p class="kitchen-description">${kitchen.description || 'Cozinha especializada em pratos regionais'}</p>
                    </div>
                    <div class="header-right">
                        <div class="kitchen-status ${kitchen.status}">
                            <span class="material-icons">${kitchen.status === 'aberta' ? 'restaurant' : 'restaurant_menu'}</span>
                            <span>${kitchen.status === 'aberta' ? 'Aberta' : 'Fechada'}</span>
                        </div>
                    </div>
                </div>
                <div class="kitchen-info">
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">place</span>
                            <span class="distance">${kitchen.distance}</span>
                        </div>
                        <div class="info-item">
                            <span class="material-icons">schedule</span>
                            <span class="hours">${kitchen.operatingHours}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">location_on</span>
                            <span class="address">${kitchen.address}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">people</span>
                            <span class="capacity">${kitchen.currentOccupancy}/${kitchen.capacity} pessoas</span>
                        </div>
                        <div class="info-item">
                            <span class="material-icons">star</span>
                            <span class="rating">${kitchen.rating}</span>
                        </div>
                    </div>
                </div>
                ${kitchen.status === 'aberta' ? `
                    <div class="kitchen-actions">
                        <button class="btn-checkin" data-id="${kitchen.id}">
                            <span class="material-icons">check_circle</span>
                            Fazer Reserva
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Adiciona eventos de clique nas cards
        const cards = this.kitchensList.querySelectorAll('.kitchen-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Evita que o clique no botão de check-in dispare o evento do card
                if (!e.target.closest('.btn-checkin')) {
                    this.handleKitchenClick(card.dataset.id);
                }
            });
        });

        // Adiciona eventos de clique nos botões de check-in
        const checkinButtons = this.kitchensList.querySelectorAll('.btn-checkin');
        checkinButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que o evento se propague para o card
                this.handleKitchenClick(button.dataset.id);
            });
        });
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredKitchens = this.kitchens.filter(kitchen => 
            kitchen.name.toLowerCase().includes(searchTerm) ||
            kitchen.address.toLowerCase().includes(searchTerm)
        );
        this.renderKitchens(filteredKitchens);
    }

    handleFilterTag(clickedTag) {
        // Remove a classe active de todas as tags
        this.filterTags.forEach(tag => tag.classList.remove('active'));
        
        // Adiciona a classe active na tag clicada
        clickedTag.classList.add('active');
        
        // Aplica o filtro correspondente
        const filterType = clickedTag.textContent.trim();
        let filteredKitchens = [...this.kitchens];
        
        switch(filterType) {
            case 'Mais próximas':
                filteredKitchens.sort((a, b) => {
                    const distanceA = parseFloat(a.distance);
                    const distanceB = parseFloat(b.distance);
                    return distanceA - distanceB;
                });
                break;
            case 'Melhor avaliadas':
                filteredKitchens.sort((a, b) => b.rating - a.rating);
                break;
            case 'Abertas agora':
                filteredKitchens = filteredKitchens.filter(kitchen => kitchen.status === 'aberta');
                break;
        }
        
        this.renderKitchens(filteredKitchens);
    }

    async handleKitchenClick(kitchenId) {
        try {
            // Valida os dados antes de prosseguir
            if (this.origin === 'volunteer' && !localStorage.getItem('currentAssisted')) {
                showMessage('Dados do assistido não encontrados', 'error');
                return;
            } else if (this.origin === 'cpf' && !localStorage.getItem('currentAssisted')) {
                showMessage('Dados do usuário não encontrados', 'error');
                return;
            }

            // Encontra a cozinha selecionada
            const selectedKitchen = this.kitchens.find(kitchen => kitchen.id === parseInt(kitchenId));
            if (!selectedKitchen) {
                showMessage('Cozinha selecionada não encontrada', 'error');
                return;
            }

            // Salva a cozinha selecionada no localStorage
            localStorage.setItem('selectedKitchen', JSON.stringify(selectedKitchen));

            // Salva o ID da cozinha nos dados do usuário
            const currentAssisted = this.origin === 'volunteer' 
                ? JSON.parse(localStorage.getItem('currentAssisted'))
                : JSON.parse(localStorage.getItem('currentAssisted'));
            
            currentAssisted.selectedKitchenId = kitchenId;
            localStorage.setItem(this.origin === 'volunteer' ? 'currentAssisted' : 'currentAssisted', JSON.stringify(currentAssisted));
            
            // Navega para a tela de confirmação
            const success = await this.screenLoader.loadScreen('confirmation');
            if (!success) {
                showMessage('Erro ao carregar próxima tela', 'error');
            }
        } catch (error) {
            console.error('Erro ao navegar para próxima tela:', error);
            showMessage('Erro ao navegar para próxima tela', 'error');
        }
    }

    handleFilter() {
        // Implementar lógica de filtro avançado
    }

    async handleBack() {
        try {
            await this.screenLoader.loadScreen('location');
        } catch (error) {
            showMessage('Erro ao voltar. Tente novamente.', 'error');
        }
    }

    showLoading() {
        if (!this.kitchensList) return;
        
        this.kitchensList.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando cozinhas...</p>
            </div>
        `;
    }

    hideLoading() {
        // O loading será removido automaticamente quando as cozinhas forem renderizadas
    }

    updateUserInfo() {
        const userInfoSection = document.querySelector('.user-info-section');
        if (!userInfoSection) return;

        // Limpa o conteúdo anterior
        userInfoSection.innerHTML = '';

        // Cria o container de informações do usuário
        const userInfoContainer = document.createElement('div');
        userInfoContainer.className = 'user-info-container';

        // Adiciona o avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'user-avatar';
        avatarDiv.innerHTML = '<span class="material-icons">person</span>';
        userInfoContainer.appendChild(avatarDiv);

        // Adiciona os detalhes do usuário
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'user-details';

        if (this.origin === 'volunteer') {
            // Modo Voluntário - mostra informações do assistido
            detailsDiv.innerHTML = `
                <h3>${this.currentAssisted.name || 'Nome não informado'}</h3>
                <p>CPF: ${this.currentAssisted.cpf || 'Não informado'}</p>
                ${this.currentAssisted.situations ? `<p>Situações: ${this.currentAssisted.situations.join(', ')}</p>` : ''}
                ${this.currentAssisted.location ? `
                    <p>Localização: 
                        ${this.currentAssisted.location.latitude ? `Lat: ${this.currentAssisted.location.latitude}` : ''}
                        ${this.currentAssisted.location.longitude ? `, Long: ${this.currentAssisted.location.longitude}` : ''}
                    </p>
                ` : ''}
            `;
        } else {
            // Modo CPF - mostra informações do usuário
            detailsDiv.innerHTML = `
                <h3>${this.currentAssisted.fullName || 'Nome não informado'}</h3>
                <p>Telefone: ${this.currentAssisted.phone || 'Não informado'}</p>
                ${this.currentAssisted.location ? `
                    <p>Localização: 
                        ${this.currentAssisted.location.latitude ? `Lat: ${this.currentAssisted.location.latitude}` : ''}
                        ${this.currentAssisted.location.longitude ? `, Long: ${this.currentAssisted.location.longitude}` : ''}
                    </p>
                ` : ''}
            `;
        }

        userInfoContainer.appendChild(detailsDiv);
        userInfoSection.appendChild(userInfoContainer);

        // Atualiza o título da seção
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = this.origin === 'volunteer' 
                ? 'Pessoa em Atendimento' 
                : 'Seus Dados';
        }

        // Atualiza a mensagem de boas-vindas
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = this.origin === 'volunteer'
                ? 'Selecione uma cozinha para o atendimento'
                : 'Selecione uma cozinha para seu atendimento';
        }
    }
}

// Inicializa a tela quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ResultScreen();
}); 