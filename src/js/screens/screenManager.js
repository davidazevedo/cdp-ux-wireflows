import { loadScreen } from './screenLoader.js';
import { showMessage } from '../../utils/messages.js';

export class ScreenManager {
    constructor() {
        this.screensContainer = document.getElementById('screens-container');
        this.currentScreen = null;
        this.screens = {
            welcome: null,
            registration: null,
            locationRequest: null,
            manualLocation: null,
            loading: null,
            kitchens: null,
            confirmation: null
        };
    }

    init() {
        this.initializeElements();
    }

    initializeElements() {
        this.screensContainer = document.getElementById('screens-container');
    }

    async showScreen(screenName) {
        try {
            // Remove a screen atual
            if (this.currentScreen) {
                this.currentScreen.remove();
            }

            // Carrega a nova screen
            const screen = await loadScreen(screenName);
            if (!screen) {
                throw new Error(`Tela ${screenName} não encontrada`);
            }

            // Adiciona a screen ao container
            this.screensContainer.appendChild(screen);
            this.currentScreen = screen;
            this.screens[screenName] = screen;

            // Adiciona a classe active para animação
            screen.classList.add('active');

            // Rola para o topo da página
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Erro ao carregar tela:', error);
            showMessage('Erro ao carregar a tela. Por favor, tente novamente.', 'error');
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    getScreen(screenName) {
        return this.screens[screenName];
    }
} 