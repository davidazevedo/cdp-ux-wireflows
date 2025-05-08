# Documentação de Integração - PE Sem Fome

## Visão Geral
O PE Sem Fome é uma aplicação web desenvolvida para conectar pessoas em situação de vulnerabilidade com cozinhas solidárias em Pernambuco. O sistema utiliza uma arquitetura modular e responsiva, com foco em acessibilidade e experiência do usuário.

## Estrutura do Projeto
```
src/
├── screens/
│   ├── cpf/
│   │   ├── cpf.html
│   │   ├── cpf.css
│   │   └── cpf.js
│   ├── volunteer/
│   │   ├── volunteer.html
│   │   ├── volunteer.css
│   │   └── volunteer.js
│   └── result/
│       ├── result.html
│       ├── result.css
│       └── result.js
├── utils/
│   ├── screenLoader.js
│   └── messageHandler.js
└── assets/
    └── images/
```

## Padrões de UI

### Cores
```css
:root {
    --primary-color: #2196F3;
    --primary-dark: #1976D2;
    --primary-light: #E3F2FD;
    --text-primary: #333;
    --text-secondary: #666;
    --background: #F5F5F5;
    --surface: #FFFFFF;
    --error-color: #f44336;
    --success-color: #4CAF50;
}
```

### Espaçamento
```css
:root {
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
}
```

### Componentes

#### Botões
- **Botão Primário** (`.btn-primary`)
  - Cor de fundo: `var(--primary-color)`
  - Cor do texto: branco
  - Hover: `var(--primary-dark)`
  - Estado disabled: cinza com opacidade 0.7

- **Botão Secundário** (`.btn-secondary`)
  - Cor de fundo: `var(--primary-light)`
  - Cor do texto: `var(--primary-color)`
  - Hover: `var(--primary-color)` com texto branco

#### Inputs
- **Input Padrão** (`.input-wrapper`)
  - Borda: 1px solid `var(--primary-light)`
  - Hover/Focus: borda `var(--primary-color)` com sombra
  - Padding: `var(--spacing-sm)`
  - Border-radius: `var(--border-radius)`

#### Mensagens
- **Mensagem de Erro** (`.error-message`)
  - Cor: `var(--error-color)`
  - Animação: fade-in

- **Mensagem de Sucesso** (`.success-message`)
  - Cor: `var(--success-color)`
  - Animação: fade-in

## Funcionalidades Principais

### Tela de CPF
- Validação de CPF em tempo real
- Entrada por voz
- Feedback visual imediato
- Mensagens de erro/sucesso estilizadas
- Botões de ação responsivos

### Tela de Voluntário
- Formulário de cadastro completo
- Upload de foto com preview
- Geolocalização
- Validação de campos obrigatórios
- Modal de cadastro de assistidos
- Lista de assistidos com ações

### Modal de Assistido
- Formulário de cadastro
- Upload de foto
- Seleção de situações de vulnerabilidade
- Geolocalização
- Validação de campos

## Responsividade
- Breakpoints:
  - Tablet: 768px
  - Mobile: 480px
- Layout adaptativo
- Botões empilhados em telas pequenas
- Fontes redimensionadas
- Espaçamento ajustado

## Acessibilidade
- Labels ARIA
- Mensagens de erro claras
- Foco visual
- Contraste adequado
- Navegação por teclado

## Armazenamento
- LocalStorage para dados do usuário
- Cache de localização
- Persistência de formulários

## Eventos e Interações
- Validação em tempo real
- Feedback visual imediato
- Animações suaves
- Transições de estado
- Mensagens de erro/sucesso

## Boas Práticas
1. Sempre use as variáveis CSS definidas
2. Mantenha a consistência visual
3. Implemente feedback visual
4. Valide dados antes do envio
5. Trate erros adequadamente
6. Mantenha a acessibilidade
7. Teste em diferentes dispositivos

## Exemplos de Uso

### Botão Primário
```html
<button class="btn btn-primary">
    <span class="material-icons">check</span>
    Confirmar
</button>
```

### Input com Validação
```html
<div class="input-wrapper">
    <input type="text" id="cpf" required>
    <div class="error-message"></div>
</div>
```

### Modal
```html
<div class="modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <!-- Conteúdo do modal -->
    </div>
</div>
```

## Considerações de Performance
- Lazy loading de imagens
- Cache de dados
- Validação otimizada
- Animações suaves
- Carregamento assíncrono

## Manutenção
- Documentar alterações
- Manter padrões consistentes
- Testar em diferentes navegadores
- Verificar acessibilidade
- Otimizar performance 