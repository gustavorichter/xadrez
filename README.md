# Xadrez - Jogo de Xadrez com Vue.js 3

Um jogo de xadrez completo desenvolvido com Vue.js 3 usando a Composition API, com backend Node.js/Express e Socket.IO para jogos multiplayer.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Vue.js 3 com Composition API
- **Build Tool**: Vite
- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Armazenamento**: Memória (sem dependências de banco de dados)
- **Estilização**: CSS puro com Font Awesome para ícones

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd xadrez
```

2. Instale as dependências:
```bash
npm install
```

## 🎮 Como Executar

### Desenvolvimento

1. **Inicie o servidor backend** (em um terminal):
```bash
npm start
```
O servidor estará rodando em `http://localhost:3000`

2. **Inicie o frontend em modo de desenvolvimento** (em outro terminal):
```bash
npm run dev
```
O frontend estará rodando em `http://localhost:5173`

### Produção

1. **Construa o projeto**:
```bash
npm run build
```

2. **Visualize a build**:
```bash
npm run preview
```

## 🏗️ Estrutura do Projeto

```
xadrez/
├── src/
│   ├── components/
│   │   └── ChessBoard.vue          # Componente do tabuleiro
│   ├── composables/
│   │   ├── useChessGame.js         # Lógica do jogo de xadrez
│   │   └── useTimer.js             # Gerenciamento do cronômetro
│   ├── App.vue                     # Componente principal
│   ├── main.js                     # Ponto de entrada da aplicação
│   └── style.css                   # Estilos globais
├── server.js                       # Servidor Express + Socket.IO
├── vite.config.js                  # Configuração do Vite
└── package.json                    # Dependências e scripts
```

## 🎯 Funcionalidades

- ✅ Tabuleiro de xadrez completo com 64 casas
- ✅ Todas as peças do xadrez (peão, torre, cavalo, bispo, rainha, rei)
- ✅ Movimentação válida para cada tipo de peça
- ✅ Sistema de turnos (brancas/pretas)
- ✅ Cronômetro do jogo com controles de pausar/continuar
- ✅ Interface responsiva e moderna
- ✅ Integração com Socket.IO para jogos multiplayer
- ✅ Armazenamento em memória (sem dependências externas)
- ✅ Botão de reset para novo jogo
- ✅ Histórico de jogadas

## 🎨 Regras do Jogo

O jogo segue as regras padrão do xadrez:

- **Peão**: Move-se uma casa para frente (ou duas na primeira jogada), captura em diagonal
- **Torre**: Move-se em linha reta horizontal e vertical
- **Cavalo**: Move-se em forma de "L" (2 casas em uma direção + 1 casa perpendicular)
- **Bispo**: Move-se em diagonal
- **Rainha**: Combina os movimentos da torre e do bispo
- **Rei**: Move-se uma casa em qualquer direção

## 🔧 Configuração

### Backend
- Porta padrão: 3000
- Armazenamento: Memória (sem persistência)
- Socket.IO para comunicação em tempo real

### Frontend
- Porta padrão: 5173 (desenvolvimento)
- Proxy configurado para Socket.IO
- Hot reload durante desenvolvimento

## 🆕 Novidades na Versão Vue.js 3

- **Composition API**: Código mais organizado e reutilizável
- **Composables**: Lógica separada em funções reutilizáveis
- **Reatividade**: Sistema de reatividade moderno do Vue 3
- **Performance**: Melhor performance e tree-shaking
- **TypeScript**: Suporte nativo para TypeScript (opcional)

## 📱 Responsividade

O jogo é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

**Divirta-se jogando xadrez! ♟️** 

