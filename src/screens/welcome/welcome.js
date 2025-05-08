import { ScreenLoader } from '../../utils/screenLoader.js';

export class WelcomeScreen {
    constructor() {
        console.log('Iniciando WelcomeScreen...');
        this.screenLoader = new ScreenLoader();
        this.initializeElements();
    }

    initializeElements() {
        console.log('Inicializando elementos...');
        this.lunchCard = document.getElementById('lunchCard');
        this.helpCard = document.getElementById('helpCard');
        this.serveCard = document.getElementById('serveCard');
        this.helpLink = document.getElementById('helpLink');
        
        console.log('Elementos encontrados:', {
            lunchCard: this.lunchCard,
            helpCard: this.helpCard,
            serveCard: this.serveCard,
            helpLink: this.helpLink
        });
        
        if (this.lunchCard && this.helpCard && this.serveCard && this.helpLink) {
            this.initializeEventListeners();
        } else {
            console.error('Elementos não encontrados! Verifique se os IDs estão corretos no HTML.');
        }
    }

    initializeEventListeners() {
        console.log('Inicializando event listeners...');
        
        // Evento para o card de Almoçar Agora
        this.lunchCard.addEventListener('click', () => {
            console.log('Card de Almoçar Agora clicado!');
            this.handleNavigation('cpf');
        });

        // Evento para o card de Ajudar Alguém
        this.helpCard.addEventListener('click', () => {
            console.log('Card de Ajudar Alguém clicado!');
            this.handleNavigation('help');
        });

        // Evento para o card de Atendimento Social
        this.serveCard.addEventListener('click', () => {
            console.log('Card de Atendimento Social clicado!');
            this.handleNavigation('social');
        });

        // Evento para o link de ajuda no footer
        this.helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Link de ajuda clicado!');
            this.handleNavigation('help');
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
    console.log('DOM carregado, inicializando WelcomeScreen...');
    window.welcomeScreen = new WelcomeScreen();

    // Adicionar animações de entrada
    const cards = document.querySelectorAll('.nav-card, .feature-card');
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