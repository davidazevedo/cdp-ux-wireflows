import { CpfScreen } from '../../screens/cpf/cpf.js';

export const cpfModule = {
  init: () => {
    try {
      const cpfScreen = new CpfScreen();
      return {
        success: true,
        instance: cpfScreen
      };
    } catch (error) {
      console.error('Erro ao inicializar módulo CPF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  destroy: (instance) => {
    if (instance && instance.destroy) {
      try {
        instance.destroy();
        return { success: true };
      } catch (error) {
        console.error('Erro ao destruir módulo CPF:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: true };
  }
}; 