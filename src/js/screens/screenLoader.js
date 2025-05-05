export async function loadScreen(screenName) {
    try {
        const response = await fetch(`src/screens/${screenName}/${screenName}.html`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar tela: ${screenName}`);
        }

        const html = await response.text();
        if (!html) {
            throw new Error(`Conteúdo vazio para a tela: ${screenName}`);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Verifica se o documento foi parseado corretamente
        if (doc.documentElement.querySelector('parsererror')) {
            throw new Error(`Erro ao parsear HTML da tela: ${screenName}`);
        }

        // Retorna o primeiro elemento filho do body
        const screen = doc.body.firstElementChild;
        if (!screen) {
            throw new Error(`Nenhum elemento encontrado na tela: ${screenName}`);
        }

        return screen;
    } catch (error) {
        console.error('Erro ao carregar tela:', error);
        throw error;
    }
} 