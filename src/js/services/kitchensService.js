// Dados mockados temporários
const mockKitchens = [
    {
        id: 1,
        name: "Cozinha Comunitária Centro",
        address: "Rua Principal, 123 - Centro",
        distance: "0.5 km",
        status: "aberta",
        capacity: 50,
        currentOccupancy: 30
    },
    {
        id: 2,
        name: "Cozinha Solidária Norte",
        address: "Av. Norte, 456 - Bairro Norte",
        distance: "1.2 km",
        status: "aberta",
        capacity: 40,
        currentOccupancy: 25
    },
    {
        id: 3,
        name: "Cozinha do Bem Sul",
        address: "Rua Sul, 789 - Bairro Sul",
        distance: "2.0 km",
        status: "fechada",
        capacity: 60,
        currentOccupancy: 0
    }
];

export async function getKitchens() {
    try {
        // Simulando um delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retornando dados mockados
        return mockKitchens;
    } catch (error) {
        console.error('Erro no serviço de cozinhas:', error);
        throw error;
    }
} 