import { ScreenLoader } from '../utils/screenLoader.js';
import { showMessage } from '../utils/messages.js';

export class App {
  constructor() {
    this.modules = new Map();
    this.initialized = false;
    this.screenLoader = new ScreenLoader();
    console.log('App constructor called');
  }

  async init() {
    if (this.initialized) {
      console.warn('App já inicializada');
      return;
    }

    try {
      console.log('Iniciando aplicação...');
      
      // Initialize the screen loader first
      const initialized = await this.screenLoader.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize screen loader');
      }

      // Load the initial screen
      const success = await this.screenLoader.loadScreen('welcome');
      if (!success) {
        throw new Error('Failed to load initial screen');
      }

      // Wait for the screen to be fully loaded and initialized
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load additional modules after screen is ready
      await this.loadAdditionalModules();
      this.initialized = true;
      console.log('App inicializada com sucesso');
    } catch (error) {
      console.error('Error initializing application:', error);
      showMessage('Erro ao inicializar a aplicação', 'error');
    }
  }

  async loadAdditionalModules() {
    const modulePaths = [
      '/src/js/modules/cpfModule.js'
    ];

    for (const path of modulePaths) {
      try {
        console.log(`Loading module: ${path}`);
        const module = await import(path);
        if (module.cpfModule) {
          // Load CPF screen HTML first
          console.log('Loading CPF screen HTML...');
          const success = await this.screenLoader.loadScreen('cpf');
          if (!success) {
            throw new Error('Failed to load CPF screen HTML');
          }

          // Wait for DOM to be ready before initializing module
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const result = module.cpfModule.init();
          if (result.success) {
            this.modules.set('cpf', {
              instance: result.instance,
              module: module.cpfModule
            });
            console.log('Module initialized successfully');
          } else {
            console.error(`Erro ao inicializar módulo ${path}:`, result.error);
          }
        }
      } catch (error) {
        console.error(`Erro ao carregar módulo ${path}:`, error);
      }
    }
  }

  async destroy() {
    for (const [name, { instance, module }] of this.modules) {
      try {
        const result = module.destroy(instance);
        if (!result.success) {
          console.error(`Erro ao destruir módulo ${name}:`, result.error);
        }
      } catch (error) {
        console.error(`Erro ao destruir módulo ${name}:`, error);
      }
    }
    this.modules.clear();
    this.initialized = false;
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const app = new App();
    app.init().catch(error => {
      console.error('Falha ao inicializar aplicação:', error);
    });
  });
} else {
  console.log('DOM already loaded');
  const app = new App();
  app.init().catch(error => {
    console.error('Falha ao inicializar aplicação:', error);
  });
} 