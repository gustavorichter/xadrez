const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Configuração do app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware estático para servir o cliente
app.use(express.static(path.join(__dirname, 'dist')));

// Armazenamento em memória (substitui o SQLite)
const players = new Map();
const moves = [];

// Gerenciar conexões com Socket.IO
io.on('connection', (socket) => {
	console.log('Novo jogador conectado:', socket.id);

	// Recebe nome do jogador e salva na memória
	socket.on('registrarJogador', (nome) => {
		const playerId = socket.id;
		const player = {
			id: playerId,
			nome: nome,
			connectedAt: new Date()
		};
		
		players.set(playerId, player);
		socket.emit('registrado', { id: playerId, nome });
		console.log('Jogador registrado:', nome);
	});

	// Recebe jogada e propaga para outros jogadores
	socket.on('jogada', (jogada) => {
		const { origem, destino, turno } = jogada;
		const move = {
			id: moves.length + 1,
			playerId: socket.id,
			origem: origem,
			destino: destino,
			turno: turno,
			timestamp: new Date()
		};
		
		moves.push(move);
		io.emit('jogada', move);
		console.log('Jogada registrada:', move);
	});

	socket.on('disconnect', () => {
		console.log('Jogador desconectado:', socket.id);
		players.delete(socket.id);
	});
});

// Rota para verificar status do servidor
app.get('/status', (req, res) => {
	res.json({
		status: 'online',
		players: players.size,
		totalMoves: moves.length,
		uptime: process.uptime()
	});
});

// Inicializa o servidor
const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
	console.log('Modo: Armazenamento em memória (sem SQLite)');
});
