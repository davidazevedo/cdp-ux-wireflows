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
        const selectedKitchen = JSON.parse(localStorage.getItem('selectedKitchen'));
        const currentAssisted = JSON.parse(localStorage.getItem('currentAssisted'));
        
        if (selectedKitchen) {
            this.elements.kitchenName.textContent = selectedKitchen.name || '';
            this.elements.kitchenAddress.textContent = selectedKitchen.address || '';
            this.elements.checkinDate.textContent = this.formatDate(new Date());
            this.elements.checkinTime.textContent = selectedKitchen.operatingHours || this.formatTime(new Date());
            this.elements.kitchenCapacity.textContent = selectedKitchen.capacity || '';
            this.elements.checkinId.textContent = this.generateCheckinId();
        }
        if (currentAssisted) {
            // Nome sensível
            let displayName = '';
            if (currentAssisted.name) {
                const parts = currentAssisted.name.trim().split(' ');
                displayName = parts[0];
                if (parts.length > 1) {
                    displayName += ' ' + parts[1][0] + '.';
                }
            } else {
                displayName = 'Não informado';
            }
            // CPF sensível
            let cpfMasked = '';
            if (currentAssisted.cpf) {
                cpfMasked = currentAssisted.cpf.substring(0, 3) + '.***.***-**';
            } else {
                cpfMasked = 'Não informado';
            }
            const assistedNameEl = document.getElementById('assistedName');
            const assistedCpfEl = document.getElementById('assistedCpf');
            if (assistedNameEl) assistedNameEl.textContent = displayName;
            if (assistedCpfEl) assistedCpfEl.textContent = cpfMasked;
        }
        // Compartilhar
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn && selectedKitchen) {
            shareBtn.onclick = () => {
                const shareText = `Cozinha Comunitária: ${selectedKitchen.name}\nEndereço: ${selectedKitchen.address}`;
                if (navigator.share) {
                    navigator.share({ title: selectedKitchen.name, text: shareText });
                } else {
                    navigator.clipboard.writeText(shareText);
                    showMessage('Endereço copiado para a área de transferência!', 'success');
                }
            };
        }
        // Navegar
        const navigateBtn = document.getElementById('navigateBtn');
        if (navigateBtn && selectedKitchen) {
            navigateBtn.onclick = () => {
                const query = encodeURIComponent(selectedKitchen.address);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            };
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