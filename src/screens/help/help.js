import { ScreenLoader } from '../../utils/screenLoader.js';

export class HelpScreen {
    constructor() {
        console.log('Iniciando HelpScreen...');
        this.screenLoader = new ScreenLoader();
        
        // Limpar cache do localStorage e sessionStorage
        this.clearCache();
        
        this.initializeElements();
    }

    clearCache() {
        console.log('Limpando cache...');
        // Limpar localStorage
        localStorage.clear();
        console.log('localStorage limpo');
        
        // Limpar sessionStorage
        sessionStorage.clear();
        console.log('sessionStorage limpo');
    }

    initializeElements() {
        console.log('Inicializando elementos...');
        this.manualCard = document.getElementById('manualCard');
        this.backBtn = document.getElementById('backBtn');
        
        console.log('Elementos encontrados:', {
            manualCard: this.manualCard,
            backBtn: this.backBtn
        });
        
        if (this.manualCard && this.backBtn) {
            this.initializeEventListeners();
        } else {
            console.error('Elementos não encontrados! Verifique se os IDs estão corretos no HTML.');
        }
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners...');
        
        // Evento para o card de preenchimento manual
        this.manualCard.addEventListener('click', () => {
            console.log('Card de preenchimento manual clicado!');
            this.handleNavigation('volunteer');
        });

        // Evento para o botão voltar
        this.backBtn.addEventListener('click', () => {
            console.log('Botão voltar clicado!');
            this.handleNavigation('welcome');
        });
    }

    async handleNavigation(screen) {
        console.log(`Iniciando redirecionamento para ${screen}...`);
        try {
            const success = await this.screenLoader.loadScreen(screen);
            if (success) {
                console.log(`Redirecionamento para ${screen} concluído com sucesso`);
            } else {
                console.error(`Falha ao carregar a tela ${screen}`);
            }
        } catch (error) {
            console.error(`Erro ao redirecionar para ${screen}:`, error);
        }
    }
}

// Inicializa a tela quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando HelpScreen...');
    window.helpScreen = new HelpScreen();

    // Adicionar animações de entrada
    const cards = document.querySelectorAll('.identification-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}); 