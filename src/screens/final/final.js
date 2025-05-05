import { showMessage } from '../../utils/messages.js';
import { ScreenLoader } from '../../utils/screenLoader.js';

export class FinalScreen {
    constructor() {
        this.screenLoader = new ScreenLoader();
        this.initializeElements();
        this.initializeEventListeners();
        this.loadCheckinData();
    }

    initializeElements() {
        this.elements = {
            kitchenName: document.getElementById('kitchenName'),
            kitchenAddress: document.getElementById('kitchenAddress'),
            checkinDate: document.getElementById('checkinDate'),
            checkinTime: document.getElementById('checkinTime'),
            kitchenCapacity: document.getElementById('kitchenCapacity'),
            checkinId: document.getElementById('checkinId'),
            portalBtn: document.getElementById('portalBtn'),
            homeBtn: document.getElementById('homeBtn')
        };

        if (!this.validateElements()) {
            showMessage('Erro ao inicializar a tela. Por favor, recarregue a página.', 'error');
            return;
        }
    }

    validateElements() {
        return Object.values(this.elements).every(element => element !== null);
    }

    initializeEventListeners() {
        this.elements.portalBtn.addEventListener('click', () => this.handlePortalClick());
        this.elements.homeBtn.addEventListener('click', () => this.handleHomeClick());
    }

    loadCheckinData() {
        const checkinData = JSON.parse(localStorage.getItem('checkinData'));
        const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
        
        if (checkinData && currentAssisted) {
            this.elements.kitchenName.textContent = checkinData.kitchenName;
            this.elements.kitchenAddress.textContent = checkinData.kitchenAddress;
            this.elements.checkinDate.textContent = this.formatDate(new Date());
            this.elements.checkinTime.textContent = this.formatTime(new Date());
            this.elements.kitchenCapacity.textContent = checkinData.kitchenCapacity;
            this.elements.checkinId.textContent = this.generateCheckinId();
        } else {
            showMessage('Dados do check-in não encontrados.', 'error');
           // this.screenLoader.loadScreen('welcome');
        }
    }

    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    generateCheckinId() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    handlePortalClick() {
        window.open('https://portal.cdp.com.br', '_blank');
    }

    async handleHomeClick() {
        try {
            await this.screenLoader.loadScreen('welcome');
        } catch (error) {
            showMessage('Erro ao voltar para a tela inicial.', 'error');
        }
    }
}