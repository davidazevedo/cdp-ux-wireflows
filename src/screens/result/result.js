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
            // Carrega o arquivo JSON com as cozinhas
            const response = await fetch('/src/data/tableConvert.com_2orlci.json');
            const data = await response.json();
            // Horários fake
            const fakeHours = [
                "08:00 - 17:00", "09:00 - 18:00", "07:30 - 16:30", "10:00 - 19:00", "08:30 - 17:30",
                "09:30 - 18:30", "07:00 - 16:00", "10:30 - 19:30", "08:00 - 16:00", "09:00 - 17:00"
            ];
            // Pega apenas as 10 primeiras cozinhas
            const kitchens = data.slice(0, 10).map((item, idx) => ({
                id: idx + 1,
                name: item.Nome,
                address: `${item.Endereço || ''} ${item.Bairro ? '- ' + item.Bairro : ''}, ${item.Município || ''} - ${item.Estado || ''}`.replace(/\s+/g, ' ').trim(),
                status: (item['Situação'] && item['Situação'].toLowerCase().includes('habilitada')) ? 'aberta' : 'fechada',
                operatingHours: fakeHours[idx % fakeHours.length],
                situacao: item['Situação'] || '',
                municipio: item['Município'] || '',
            }));

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
                        <p class="kitchen-description">${kitchen.situacao ? 'Situação: ' + kitchen.situacao : ''}</p>
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
                            <span class="material-icons">location_on</span>
                            <span class="address">${kitchen.address}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">schedule</span>
                            <span class="hours">${kitchen.operatingHours}</span>
                        </div>
                    </div>
                </div>
                <div class="kitchen-actions">
                    <button class="btn btn-secondary btn-share" data-id="${kitchen.id}" title="Compartilhar">
                        <span class="material-icons">share</span>
                        Compartilhar
                    </button>
                    <button class="btn btn-secondary btn-navigate" data-id="${kitchen.id}" title="Ir pelo mapa">
                        <span class="material-icons">navigation</span>
                        Ir pelo mapa
                    </button>
                    ${kitchen.status === 'aberta' ? `
                        <button class="btn btn-secondary btn-checkin" data-id="${kitchen.id}" style="display: none;">
                            <span class="material-icons">check_circle</span>
                            Confirmar Presença
                        <span class="checkin-status"></span>
                        </button>
                    ` : ''}
                </div>
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

        // Compartilhar
        this.kitchensList.querySelectorAll('.btn-share').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const kitchen = this.kitchens.find(k => k.id == button.dataset.id);
                const shareText = `Cozinha Comunitária: ${kitchen.name}\nEndereço: ${kitchen.address}`;
                if (navigator.share) {
                    navigator.share({ title: kitchen.name, text: shareText });
                } else {
                    navigator.clipboard.writeText(shareText);
                    showMessage('Endereço copiado para a área de transferência!', 'success');
                }
            });
        });

        // Navegar
        this.kitchensList.querySelectorAll('.btn-navigate').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const kitchen = this.kitchens.find(k => k.id == button.dataset.id);
                const query = encodeURIComponent(kitchen.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
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