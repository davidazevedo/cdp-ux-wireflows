class ScreenManager {
    constructor() {
        this.screenContainer = document.getElementById('screenContainer');
        this.helpButton = document.getElementById('helpButton');
        this.feedbackButton = document.getElementById('feedbackButton');
        this.currentScreen = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.helpButton) {
            this.helpButton.addEventListener('click', () => this.showHelp());
        }

        if (this.feedbackButton) {
            this.feedbackButton.addEventListener('click', () => this.showFeedback());
        }
    }

    async loadScreen(screenName) {
        try {
            // Limpa o container atual
            this.screenContainer.innerHTML = '';

            // Carrega o HTML da tela
            const response = await fetch(`/src/screens/${screenName}/${screenName}.html`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar a tela ${screenName}`);
            }

            const html = await response.text();
            this.screenContainer.innerHTML = html;

            // Carrega o CSS da tela
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `/src/screens/${screenName}/${screenName}.css`;
            document.head.appendChild(link);

            // Carrega o JavaScript da tela
            const script = document.createElement('script');
            script.type = 'module';
            script.src = `/src/screens/${screenName}/${screenName}.js`;
            document.body.appendChild(script);

            this.currentScreen = screenName;
        } catch (error) {
            console.error('Erro ao carregar tela:', error);
            this.screenContainer.innerHTML = `
                <div class="error-message">
                    <h2>Erro ao carregar a tela</h2>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Recarregar</button>
                </div>
            `;
        }
    }

    showHelp() {
        // TODO: Implementar tela de ajuda
        console.log('Mostrando tela de ajuda');
    }

    showFeedback() {
        // TODO: Implementar tela de feedback
        console.log('Mostrando tela de feedback');
    }
}

// Inicializa o gerenciador de telas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.screenManager = new ScreenManager();
    // Carrega a tela inicial
    window.screenManager.loadScreen('welcome');
}); 