# CDP UX Wireflows

Interface de usuário para o programa CDP, desenvolvida com foco em experiência do usuário e acessibilidade.

## Características

- Validação de CPF e NIS
- Entrada por voz
- Feedback visual em tempo real
- Design responsivo
- Acessibilidade (WCAG 2.1)
- Animações suaves
- Tema consistente

## Tecnologias

- HTML5
- CSS3 (com variáveis CSS)
- JavaScript (ES6+)
- Webpack
- ESLint
- Prettier
- Jest

## Pré-requisitos

- Node.js 14.x ou superior
- npm 6.x ou superior

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/qintess/cdp-ux-wireflows.git
cd cdp-ux-wireflows
```

2. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código
- `npm run build`: Gera a build de produção

## Estrutura do Projeto

```
src/
├── screens/          # Telas da aplicação
│   └── cpf/         # Tela de verificação CPF/NIS
├── styles/          # Estilos globais e variáveis
├── utils/           # Utilitários e helpers
└── index.js         # Ponto de entrada
```

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC.

## Contato

Qintess - [contato@qintess.com](mailto:contato@qintess.com)
