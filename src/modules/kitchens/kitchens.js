import { getKitchens } from '../../js/services/kitchensService.js';
import { showMessage } from '../../utils/messages.js';

export class KitchensModule {
    constructor() {
        this.elements = {
            kitchensList: null,
            finishBtn: null,
            shareBtn: null,
            govLoginFinalBtn: null
        };
        this.kitchens = [];
    }

    init() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadKitchens();
    }

    initializeElements() {
        this.elements = {
            kitchensList: document.getElementById('kitchensList'),
            finishBtn: document.getElementById('finishBtn'),
            shareBtn: document.getElementById('shareBtn'),
            govLoginFinalBtn: document.getElementById('govLoginFinalBtn')
        };
    }

    initializeEventListeners() {
        if (this.elements.finishBtn) {
            this.elements.finishBtn.addEventListener('click', this.handleFinish.bind(this));
        }

        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', this.handleShare.bind(this));
        }

        if (this.elements.govLoginFinalBtn) {
            this.elements.govLoginFinalBtn.addEventListener('click', this.handleGovLogin.bind(this));
        }
    }

    async loadKitchens() {
        try {
            this.kitchens = await getKitchens();
            this.renderKitchens(this.kitchens);
        } catch (error) {
            console.error('Erro ao carregar cozinhas:', error);
            showMessage('Erro ao carregar cozinhas', 'error');
        }
    }

    renderKitchens(kitchens) {
        if (!this.elements.kitchensList) return;

        if (!kitchens || kitchens.length === 0) {
            this.elements.kitchensList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">sentiment_dissatisfied</span>
                    <p>Nenhuma cozinha encontrada na sua região.</p>
                </div>
            `;
            return;
        }

        this.elements.kitchensList.innerHTML = kitchens.map(kitchen => `
            <div class="kitchen-card" data-id="${kitchen.id}">
                <div class="kitchen-header">
                    <h3>${kitchen.name}</h3>
                    <span class="status ${kitchen.status}">${kitchen.status === 'aberta' ? 'Aberta' : 'Fechada'}</span>
                </div>
                <div class="kitchen-info">
                    <p><span class="material-icons">location_on</span> ${kitchen.address}</p>
                    <p><span class="material-icons">directions_walk</span> ${kitchen.distance}</p>
                    <p><span class="material-icons">people</span> ${kitchen.currentOccupancy}/${kitchen.capacity} pessoas</p>
                </div>
                <div class="kitchen-actions">
                    <button class="md-button primary" onclick="window.location.href='/kitchen/${kitchen.id}'">
                        <span class="material-icons">info</span>
                        Ver detalhes
                    </button>
                    ${kitchen.status === 'aberta' ? `
                        <button class="md-button secondary" onclick="window.location.href='/checkin/${kitchen.id}'">
                            <span class="material-icons">check_circle</span>
                            Fazer check-in
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    handleFinish() {
        screenManager.showScreen('confirmation');
    }

    handleShare() {
        if (navigator.share) {
            navigator.share({
                title: 'PE Sem Fome',
                text: 'Encontrei uma cozinha solidária próxima!',
                url: window.location.href
            }).catch(error => {
                console.error('Erro ao compartilhar:', error);
            });
        } else {
            showMessage('Compartilhamento não suportado neste navegador', 'info');
        }
    }

    handleGovLogin() {
        window.location.href = 'https://sso.acesso.gov.br/authorize';
    }
} 