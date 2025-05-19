import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';
import { getKitchens } from '../../js/services/kitchensService.js';

export class ResultScreen {
    static instance = null;

    constructor() {
        if (ResultScreen.instance) {
            return ResultScreen.instance;
        }
        ResultScreen.instance = this;

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
            this.currentAssisted = JSON.parse(currentAssisted);
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
            this.currentAssisted = JSON.parse(currentAssisted);
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
            
            // Processa as cozinhas do novo formato JSON
            const kitchens = data.cozinhas_comunitarias.map((item, idx) => ({
                id: idx + 1,
                name: item.nome,
                address: `${item.endereco.rua}, ${item.endereco.bairro}, ${item.endereco.cidade} - ${item.endereco.estado}`,
                phone: item.telefone,
                responsible: item.profissional_responsavel,
                status: 'aberta',
                cep: item.endereco.cep,
                additionalInfo: data.informacoes_adicionais.cozinhas_comunitarias,
                type: 'kitchen'
            }));

            // Carrega os CRAS
            const cras = await this.loadCras();

            if ((!kitchens || kitchens.length === 0) && (!cras || cras.length === 0)) {
                this.kitchensList.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons">restaurant</span>
                        <p>Nenhuma cozinha ou CRAS encontrado na sua região.</p>
                    </div>
                `;
                return;
            }

            this.kitchens = kitchens;
            this.cras = cras;

            // Verifica se é situação de rua
            const isStreetSituation = this.currentAssisted.situations && 
                                   this.currentAssisted.situations.includes('rua');

            // Se for situação de rua, mostra apenas CRAS
            const itemsToShow = isStreetSituation ? cras : [...kitchens, ...cras];
            
            // Adiciona observação se for situação de rua
            if (isStreetSituation) {
                this.kitchensList.innerHTML = `
                    <div class="situation-notice">
                        <span class="material-icons">info</span>
                        <p>Como você está em situação de rua, estamos mostrando apenas os CRAS próximos a você.</p>
                    </div>
                `;
            }

            this.renderKitchens(itemsToShow);
        } catch (error) {
            showMessage('Erro ao carregar cozinhas e CRAS. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadCras() {
        try {
            const response = await fetch('/src/data/tableConvert.com_2orlci.json');
            const data = await response.json();
            
            return data.cras.map((item, idx) => ({
                id: `cras-${idx + 1}`,
                name: item.nome,
                address: `${item.endereco.rua}, ${item.endereco.bairro}, ${item.endereco.cidade} - ${item.endereco.estado}`,
                phone: item.telefone,
                responsible: item.profissional_responsavel,
                status: 'aberto',
                cep: item.endereco.cep,
                additionalInfo: data.informacoes_adicionais.cras,
                type: 'cras'
            }));
        } catch (error) {
            console.error('Erro ao carregar CRAS:', error);
            return [];
        }
    }

    renderKitchens(items) {
        if (!this.kitchensList) return;

        this.kitchensList.innerHTML = items.map(item => `
            <div class="kitchen-card ${item.type}" data-id="${item.id}">
                <div class="kitchen-header">
                    <div class="header-left">
                        <h3 class="kitchen-name">${item.name}</h3>
                        <p class="kitchen-description">Responsável: ${item.responsible}</p>
                    </div>
                    <div class="header-right">
                        <div class="kitchen-status ${item.status}" style="display: none;">
                            <span class="material-icons">${item.type === 'kitchen' ? 'restaurant' : 'business'}</span>
                            <span>${item.status === 'aberta' ? 'Aberta' : 'Aberto'}</span>
                        </div>
                    </div>
                </div>
                <div class="kitchen-info">
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">location_on</span>
                            <span class="address">${item.address}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">phone</span>
                            <span class="phone">${item.phone}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">mail</span>
                            <span class="email">${item.type === 'kitchen' ? 'crasbongi@gmail.com' : 'contato@cras.gov.br'}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">local_post_office</span>
                            <span class="cep">CEP: ${item.cep}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="material-icons">info</span>
                            <span class="additional-info">${item.additionalInfo}</span>
                        </div>
                    </div>
                </div>
                <div class="kitchen-actions">
                    <button class="btn btn-secondary btn-navigate" data-id="${item.id}" title="Ir pelo mapa">
                        <span class="material-icons">navigation</span>
                        Ir pelo mapa
                    </button>
                </div>
            </div>
        `).join('');

        // Adiciona eventos de clique nas cards
        const cards = this.kitchensList.querySelectorAll('.kitchen-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-navigate')) {
                    this.handleKitchenClick(card.dataset.id);
                }
            });
        });

        // Navegar
        this.kitchensList.querySelectorAll('.btn-navigate').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = [...this.kitchens, ...this.cras].find(k => k.id === button.dataset.id);
                const query = encodeURIComponent(item.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
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
    if (!ResultScreen.instance) {
        new ResultScreen();
    }
}); 