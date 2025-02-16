const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuração do app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware estático para servir o cliente
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados SQLite
const db = new sqlite3.Database('./chess.db', (err) => {
	if (err) {
		console.error('Erro ao conectar ao banco de dados:', err.message);
	} else {
		console.log('Conectado ao banco de dados SQLite');
	}
});

// Inicializa o banco de dados
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS jogadores (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nome TEXT
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS jogadas (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		jogador_id INTEGER,
		origem TEXT,
		destino TEXT,
		turno TEXT,
		FOREIGN KEY (jogador_id) REFERENCES jogadores (id)
	)`);
});

// Gerenciar conexões com Socket.IO
io.on('connection', (socket) => {
	console.log('Novo jogador conectado:', socket.id);

	// Recebe nome do jogador e salva no banco
	socket.on('registrarJogador', (nome) => {
		db.run(`INSERT INTO jogadores (nome) VALUES (?)`, [nome], function (err) {
			if (err) {
				console.error('Erro ao registrar jogador:', err.message);
			} else {
				socket.emit('registrado', { id: this.lastID, nome });
				console.log('Jogador registrado:', nome);
			}
		});
	});

	// Recebe jogada e propaga para outros jogadores
	socket.on('jogada', (jogada) => {
		const { jogador_id, origem, destino, turno } = jogada;
		db.run(`INSERT INTO jogadas (jogador_id, origem, destino, turno) VALUES (?, ?, ?, ?)`, 
			[jogador_id, origem, destino, turno], (err) => {
				if (err) {
					console.error('Erro ao salvar jogada:', err.message);
				} else {
					io.emit('jogada', jogada);
				}
			});
	});

	socket.on('disconnect', () => {
		console.log('Jogador desconectado:', socket.id);
	});
});

// Inicializa o servidor
const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});
