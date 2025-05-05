# PE Sem Fome

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/qintess/pe-sem-fome/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/qintess/pe-sem-fome/actions)
[![Docker Pulls](https://img.shields.io/docker/pulls/qintess/pe-sem-fome)](https://hub.docker.com/r/qintess/pe-sem-fome)

PE Sem Fome é uma aplicação web moderna para facilitar o acesso dos cidadãos aos serviços públicos, com foco em uma experiência de usuário intuitiva e acessível.

## 🚀 Funcionalidades

- 🎤 Reconhecimento de voz para entrada de dados
- 📱 Interface responsiva e moderna
- 🔍 Busca e filtros avançados
- 🔒 Validação de dados em tempo real
- 📊 Dashboard de informações
- 🌐 Suporte a múltiplos idiomas

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- Docker e Docker Compose
- Kubernetes (para deploy em produção)
- Git

## 🛠️ Instalação

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/qintess/pe-sem-fome.git
cd pe-sem-fome
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Docker

1. Construa a imagem:
```bash
docker build -t pe-sem-fome .
```

2. Execute o container:
```bash
docker run -p 3000:3000 pe-sem-fome
```

### Kubernetes

1. Configure o cluster:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

## 🏗️ Estrutura do Projeto

```
pe-sem-fome/
├── src/                    # Código fonte
│   ├── js/                # JavaScript
│   ├── css/               # Estilos
│   └── screens/           # Telas da aplicação
├── docs/                  # Documentação
├── k8s/                   # Configurações Kubernetes
├── .github/               # GitHub Actions
└── docker/                # Configurações Docker
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar linting
npm run lint

# Executar testes com cobertura
npm run test:coverage
```

## 📚 Documentação

A documentação completa está disponível em [docs/](docs/).

## 🤝 Contribuindo

Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo de submissão de pull requests.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Qintess** - *Trabalho inicial* - [Qintess](https://www.qintess.com)

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade open source
- Contribuidores

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para o histórico de mudanças.

## 📞 Suporte

Para suporte, envie um email para suporte@qintess.com ou abra uma issue no GitHub.

## 🔄 CI/CD

O projeto utiliza GitHub Actions para CI/CD. O pipeline inclui:
- Testes automatizados
- Linting
- Build Docker
- Deploy para Kubernetes

## 🛡️ Segurança

Reporte vulnerabilidades de segurança para security@qintess.com.

## 🌐 Links Úteis

- [Documentação](docs/)
- [Wiki](https://github.com/qintess/pe-sem-fome/wiki)
- [Issues](https://github.com/qintess/pe-sem-fome/issues)
- [Releases](https://github.com/qintess/pe-sem-fome/releases)

# PE Sem Fome

Sistema de agendamento de cozinhas comunitárias - PE Sem Fome

## Requisitos

- Docker
- Docker Compose

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd cdp-ux-wireflows
```

2. Construa e inicie os containers:
```bash
docker-compose up --build
```

3. Acesse a aplicação:
- Abra o navegador e acesse: `http://localhost:8080`

## Comandos Úteis

- Iniciar a aplicação:
```bash
docker-compose up
```

- Parar a aplicação:
```bash
docker-compose down
```

- Reconstruir a aplicação:
```bash
docker-compose up --build
```

- Ver logs:
```bash
docker-compose logs -f
```

## Estrutura do Projeto

```
.
├── src/                    # Código fonte
├── public/                 # Arquivos estáticos
├── Dockerfile             # Configuração do Docker
├── docker-compose.yml     # Configuração do Docker Compose
├── nginx.conf             # Configuração do Nginx
└── README.md              # Este arquivo
```

## Configuração do Nginx

O Nginx está configurado com:
- Compressão gzip
- Headers de segurança
- Cache de assets estáticos
- Roteamento SPA
- Logs de acesso e erro

## Ambiente de Desenvolvimento

Para desenvolvimento local sem Docker:
```bash
npm install
npm run dev
```

## Contribuição

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nova-feature
```

2. Faça commit das suas alterações:
```bash
git commit -m 'Adiciona nova feature'
```

3. Envie para o repositório:
```bash
git push origin feature/nova-feature
```

## Licença

Este projeto está sob a licença [insira a licença].
