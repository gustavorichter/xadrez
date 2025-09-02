const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuração do app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para parsing JSON
app.use(express.json());

// Middleware estático para servir o cliente
app.use(express.static(path.join(__dirname, 'dist')));

// Configuração do proxy para a API Go
const API_BASE_URL = 'http://localhost:8081';

// Proxy para todas as rotas da API
app.use('/api', createProxyMiddleware({
  target: API_BASE_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Erro no proxy da API:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com a API de xadrez. Verifique se o servidor Go está rodando na porta 8080.',
      error: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${API_BASE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Resposta: ${proxyRes.statusCode} para ${req.url}`);
  }
}));

// Rota para verificar status do servidor
app.get('/status', (req, res) => {
	res.json({
		status: 'online',
		uptime: process.uptime(),
		api_proxy: 'http://localhost:8080',
		message: 'Servidor Vue.js funcionando como proxy para API Go'
	});
});

// Rota de fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Inicializa o servidor
const PORT = 3000;
server.listen(PORT, () => {
	console.log(`🚀 Servidor Vue.js rodando em http://localhost:${PORT}`);
	console.log(`🔗 Proxy configurado para API Go em ${API_BASE_URL}`);
	console.log('📋 Para usar o jogo:');
	console.log('   1. Certifique-se de que a API Go está rodando na porta 8080');
	console.log('   2. Acesse http://localhost:3000 no navegador');
	console.log('   3. Configure sua partida e comece a jogar!');
});
