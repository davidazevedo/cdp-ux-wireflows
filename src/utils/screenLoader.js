import { showMessage } from '../utils/messages.js';

export class ScreenLoader {
    constructor() {
        this.screensContainer = document.getElementById('screenContainer');
        this.helpButton = document.getElementById('helpButton');
        this.feedbackButton = document.getElementById('feedbackButton');
        this.currentScreen = null;
        
        if (!this.screensContainer) {
            console.error('Container de telas não encontrado!');
            throw new Error('Container de telas não encontrado');
        }
        
        console.log('Container de telas encontrado:', this.screensContainer);
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

    showLoading() {
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container';
        loadingContainer.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Carregando...</p>
        `;
        this.screensContainer.appendChild(loadingContainer);
    }

    hideLoading() {
        const loadingContainer = this.screensContainer.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    }

    showError(message) {
        this.screensContainer.innerHTML = `
            <div class="error-message">
                <h2>Erro ao carregar a tela</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()">Recarregar</button>
            </div>
        `;
    }

    async loadScreen(screenName) {
        try {
            this.showLoading();

            // Load HTML content
            const htmlResponse = await fetch(`/src/screens/${screenName}/${screenName}.html`);
            if (!htmlResponse.ok) {
                throw new Error(`Failed to load ${screenName} screen HTML`);
            }
            const htmlContent = await htmlResponse.text();
            
            // Load CSS content
            const cssResponse = await fetch(`/src/screens/${screenName}/${screenName}.css`);
            if (!cssResponse.ok) {
                throw new Error(`Failed to load ${screenName} screen CSS`);
            }
            const cssContent = await cssResponse.text();
            
            // Clear previous content
            this.screensContainer.innerHTML = '';

            // Create a temporary container to parse the HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = htmlContent;
            
            // Try to find the main container
            const mainContainer = tempContainer.querySelector(`.${screenName}-container`);
            if (!mainContainer) {
                throw new Error(`No content found in ${screenName} screen HTML`);
            }
            
            // Create a style element for the CSS
            const styleElement = document.createElement('style');
            styleElement.textContent = cssContent;
            
            // Append the style and content to the screens container
            this.screensContainer.appendChild(styleElement);
            this.screensContainer.appendChild(mainContainer);

            // Wait for the DOM to be updated
            await new Promise(resolve => setTimeout(resolve, 0));

            // Import and initialize the screen module
            const module = await import(`/src/screens/${screenName}/${screenName}.js`);
            if (module && module[`${screenName.charAt(0).toUpperCase() + screenName.slice(1)}Screen`]) {
                new module[`${screenName.charAt(0).toUpperCase() + screenName.slice(1)}Screen`]();
            } else {
                throw new Error(`Screen module ${screenName} not found`);
            }
            
            this.hideLoading();
            return true;
        } catch (error) {
            console.error(`Error loading screen ${screenName}:`, error);
            this.hideLoading();
            this.showError(`Erro ao carregar a tela ${screenName}. Por favor, tente novamente.`);
            return false;
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