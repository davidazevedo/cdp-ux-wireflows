// Importação dos módulos
import { ScreenLoader } from './utils/screenLoader.js';
import { showMessage } from './utils/messages.js';

// Estado global da aplicação
const appState = {
    currentUser: null,
    privacyAccepted: localStorage.getItem('privacyAccepted') === 'true'
};

// Instâncias dos módulos essenciais
let privacyModule;

class App {
    constructor() {
        console.log('Iniciando aplicação...');
        this.screenLoader = new ScreenLoader();
    }

    async init() {
        try {
            // 1. Inicializa os módulos essenciais
            const modules = await this.createAndInitializeModules();
            privacyModule = modules.privacyModule;

            // 2. Verifica a política de privacidade
            if (!appState.privacyAccepted) {
                await privacyModule.showPrivacyNotice();
            }

            // 3. Carrega a tela inicial
            await this.screenLoader.loadScreen('welcome');

            // 4. Carrega módulos adicionais
            await this.loadAdditionalModules();
        } catch (error) {
            console.error('Erro ao inicializar a aplicação:', error);
            showMessage('Erro ao carregar a aplicação. Por favor, tente novamente.', 'error');
        }
    }

    async createAndInitializeModules() {
        try {
            // Importa o módulo de privacidade dinamicamente
            const { PrivacyModule } = await import('./modules/privacy/privacy.js');
            
            // Criar instâncias na ordem correta
            privacyModule = new PrivacyModule();
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Inicializar módulos na ordem correta
            await privacyModule.init();
            
            return { privacyModule };
        } catch (error) {
            console.error('Erro ao criar e inicializar módulos:', error);
            throw error;
        }
    }

    async loadAdditionalModules() {
        try {
            const { LocationModule } = await import('./modules/location/location.js');
            const { KitchensModule } = await import('./modules/kitchens/kitchens.js');
            const { FeedbackModule } = await import('./modules/feedback/feedback.js');
            const { NotificationsModule } = await import('./modules/notifications/notifications.js');
            const { HelpModule } = await import('./modules/help/help.js');
            const { RegistrationModule } = await import('./modules/registration/registration.js');
            const { CPFModule } = await import('./js/modules/cpfModule.js');

            const locationModule = new LocationModule();
            const kitchensModule = new KitchensModule();
            const feedbackModule = new FeedbackModule();
            const notificationsModule = new NotificationsModule();
            const helpModule = new HelpModule();
            const registrationModule = new RegistrationModule();

            await Promise.all([
                locationModule.init(),
                feedbackModule.init(),
                notificationsModule.init(),
                helpModule.init(),
                registrationModule.init(),
                kitchensModule.init()
            ]);
        } catch (error) {
            console.error('Erro ao carregar módulos adicionais:', error);
            throw error;
        }
    }
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
        window.app.init();
    });
} else {
    window.app = new App();
    window.app.init();
}

// Exportar módulos para uso em outros arquivos
export {
    privacyModule,
    appState
}; 