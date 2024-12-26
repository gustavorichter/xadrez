const linhas = 8;
const colunas = 8;
const tabela = document.getElementById('tabuleiro');

// Mapeamento das peças nas suas posições iniciais
const pecas = {
	1: ['torre', 'cavalo', 'bispo', 'rainha', 'rei', 'bispo', 'cavalo', 'torre'], // Pretas
	2: Array(8).fill('peao'), // Pretas
	7: Array(8).fill('peao'), // Brancas
	8: ['torre', 'cavalo', 'bispo', 'rainha', 'rei', 'bispo', 'cavalo', 'torre'], // Brancas
};

//icones do Font awesome free
const icones = {
	torre: 'fas fa-chess-rook',
	cavalo: 'fas fa-chess-knight',
	bispo: 'fas fa-chess-bishop',
	rei: 'fas fa-chess-king',
	rainha: 'fas fa-chess-queen',
	peao: 'fas fa-chess-pawn',
};

// Criação do tabuleiro
for (let linha = 0; linha < linhas; linha++) {
	const novaLinha = tabela.insertRow();
	for (let coluna = 0; coluna < colunas; coluna++) {
		const novaCelula = novaLinha.insertCell();
		const idCelula = 'abcdefgh'.charAt(coluna) + (linhas - linha);
		novaCelula.id = idCelula;

		const classe = (coluna + linha) % 2 === 0 ? 'par' : 'impar';
		novaCelula.className = `celula ${classe}`;

		const linhaTabuleiro = linha + 1;
		if (pecas[linhaTabuleiro]) {
			const tipoPeca = pecas[linhaTabuleiro][coluna];
			if (tipoPeca) {
				const icone = document.createElement('i');
				icone.className = `${icones[tipoPeca]} ${linhaTabuleiro <= 2 ? 'preta' : 'branca'}`;
				novaCelula.appendChild(icone);
			}
		}
	}
}

// Variável para armazenar a peça atualmente selecionada
let pecaSelecionada = null;

// Variável para controlar o turno (true = brancas, false = pretas)
let turnoBrancas = true;

// Função para mostrar movimentos possíveis
function mostrarMovimentosPossiveis(idCelulaAtual) {
	console.log("idCelulaAtual", idCelulaAtual);
	//começo limpando os movimentos para não ter nenhuma celula destacada.
	limparMovimentosPossiveis();

	const celulaAtual = document.getElementById(idCelulaAtual);
	if (!celulaAtual) return;

	const peca = celulaAtual.querySelector('i');
	if (!peca) return;

	const isBranca = peca.classList.contains('branca');
	if (turnoBrancas !== isBranca) return;

	const tipoPeca = Object.keys(icones).find((tipo) => peca.classList.contains(icones[tipo].split(' ')[1]));
	const coluna = idCelulaAtual.charAt(0);
	const linha = parseInt(idCelulaAtual.charAt(1));

	switch (tipoPeca) {
		case 'peao':
			destacarMovimentosPeao(coluna, linha, isBranca);
			break;
		case 'torre':
			destacarMovimentosLinhaReta(coluna, linha, isBranca);
			break;
		case 'cavalo':
			destacarMovimentosCavalo(coluna, linha, isBranca);
			break;
		case 'bispo':
			destacarMovimentosDiagonal(coluna, linha, isBranca);
			break;
		case 'rainha':
			destacarMovimentosLinhaReta(coluna, linha, isBranca);
			destacarMovimentosDiagonal(coluna, linha, isBranca);
			break;
		case 'rei':
			destacarMovimentosRei(coluna, linha, isBranca);
			break;
	}

	pecaSelecionada = celulaAtual;
}

// Regras de Movimento de Cada Peça no xadrez.
// Peão (peao):
// Move-se uma célula para frente (ou duas se for o primeiro movimento).
// Pode capturar peças adversárias em diagonal.

// Torre (torre):
// Move-se em linha reta, horizontal ou vertical, sem limite de distância.

// Cavalo (cavalo):
// Move-se em "L": duas células em uma direção e uma em outra (ou vice-versa).

// Bispo (bispo):
// Move-se em diagonal, sem limite de distância.

// Rainha (rainha):
// Combina os movimentos da torre e do bispo: pode mover-se em linha reta ou diagonal.

// Rei (rei):
// Move-se uma célula em qualquer direção.

function destacarMovimentosPeao(coluna, linha, isBranca) {
	const direcao = isBranca ? 1 : -1;
	const novaLinha = linha + direcao;

	// Movimento para frente
	const celulaFrente = document.getElementById(`${coluna}${novaLinha}`);
	if (celulaFrente && celulaFrente.children.length === 0) {
		celulaFrente.classList.add('destacada');
	}

	// Capturas diagonais
	['-1', '+1'].forEach((offset) => {
		const novaColuna = String.fromCharCode(coluna.charCodeAt(0) + parseInt(offset));
		const celulaDiagonal = document.getElementById(`${novaColuna}${novaLinha}`);
		if (
			celulaDiagonal &&
			celulaDiagonal.children.length > 0 &&
			celulaDiagonal.querySelector('i').classList.contains(isBranca ? 'preta' : 'branca')
		) {
			celulaDiagonal.classList.add('destacada');
		}
	});
}

function destacarMovimentosLinhaReta(coluna, linha, isBranca) {
	const direcoes = [
		[0, 1], [0, -1], // Vertical
		[1, 0], [-1, 0]  // Horizontal
	];

	direcoes.forEach(([offsetColuna, offsetLinha]) => {
		let novaColuna = coluna.charCodeAt(0);
		let novaLinha = linha;

		while (true) {
			novaColuna += offsetColuna;
			novaLinha += offsetLinha;

			const idCelula = `${String.fromCharCode(novaColuna)}${novaLinha}`;
			const celula = document.getElementById(idCelula);

			if (!celula || celula.children.length > 0 && celula.querySelector('i').classList.contains(isBranca ? 'branca' : 'preta')) break;

			celula.classList.add('destacada');
			if (celula.children.length > 0) break;
		}
	});
}

function destacarMovimentosDiagonal(coluna, linha, isBranca) {
	const direcoes = [
		[1, 1], [1, -1], // Diagonais superiores
		[-1, 1], [-1, -1] // Diagonais inferiores
	];

	direcoes.forEach(([offsetColuna, offsetLinha]) => {
		let novaColuna = coluna.charCodeAt(0);
		let novaLinha = linha;

		while (true) {
			novaColuna += offsetColuna;
			novaLinha += offsetLinha;

			const idCelula = `${String.fromCharCode(novaColuna)}${novaLinha}`;
			const celula = document.getElementById(idCelula);

			if (!celula || celula.children.length > 0 && celula.querySelector('i').classList.contains(isBranca ? 'branca' : 'preta')) break;

			celula.classList.add('destacada');
			if (celula.children.length > 0) break;
		}
	});
}

function destacarMovimentosCavalo(coluna, linha, isBranca) {
	const movimentos = [
		[2, 1], [2, -1], [-2, 1], [-2, -1],
		[1, 2], [1, -2], [-1, 2], [-1, -2]
	];

	movimentos.forEach(([offsetColuna, offsetLinha]) => {
		const novaColuna = String.fromCharCode(coluna.charCodeAt(0) + offsetColuna);
		const novaLinha = linha + offsetLinha;
		const idCelula = `${novaColuna}${novaLinha}`;
		const celula = document.getElementById(idCelula);

		if (celula && (!celula.children.length || celula.querySelector('i').classList.contains(isBranca ? 'preta' : 'branca'))) {
			celula.classList.add('destacada');
		}
	});
}

function destacarMovimentosRei(coluna, linha, isBranca) {
	const direcoes = [
		[0, 1], [0, -1], [1, 0], [-1, 0], // Linha reta
		[1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
	];

	direcoes.forEach(([offsetColuna, offsetLinha]) => {
		const novaColuna = String.fromCharCode(coluna.charCodeAt(0) + offsetColuna);
		const novaLinha = linha + offsetLinha;
		const idCelula = `${novaColuna}${novaLinha}`;
		const celula = document.getElementById(idCelula);

		if (celula && (!celula.children.length || celula.querySelector('i').classList.contains(isBranca ? 'preta' : 'branca'))) {
			celula.classList.add('destacada');
		}
	});
}

// Função para limpar destaques
function limparMovimentosPossiveis() {
	document.querySelectorAll('.destacada').forEach((celula) => celula.classList.remove('destacada'));
}

function moverPeca(celulaDestino) {
	if (!pecaSelecionada || !celulaDestino.classList.contains('destacada')) return;

	// Verifica se há uma peça na célula de destino
	if (celulaDestino.children.length > 0) {
		const pecaCapturada = celulaDestino.querySelector('i');

		// Verifica se a peça capturada é um rei
		if (pecaCapturada.classList.contains('fa-chess-king')) {
			const vencedor = turnoBrancas ? "Brancas" : "Pretas";
			alert(`O jogo acabou! O vencedor é: ${vencedor}`);
			reiniciarJogo();
			return;
		}

		// Remove a peça capturada
		celulaDestino.removeChild(pecaCapturada);
	}

	// Move a peça para a célula de destino
	const peca = pecaSelecionada.querySelector('i');
	celulaDestino.appendChild(peca);

	// Alterna o turno
	turnoBrancas = !turnoBrancas;

	// Limpa os destaques e reseta a seleção
	limparMovimentosPossiveis();
	pecaSelecionada = null;
}

// Função para reiniciar o jogo
function reiniciarJogo() {
	location.reload(); // Recarrega a página para reiniciar o jogo
}


// Evento de clique para movimentar peças
tabela.addEventListener('click', (evento) => {
	const celulaClicada = evento.target.closest('.celula');
	if (!celulaClicada) return;

	// Caso uma peça já esteja selecionada
	if (pecaSelecionada) {
		// Verifica se o clique foi na mesma célula da peça selecionada (cancela seleção)
		if (pecaSelecionada === celulaClicada) {
			limparMovimentosPossiveis();
			pecaSelecionada = null;
			return;
		}

		// Verifica se clicou em uma célula destacada para mover
		if (celulaClicada.classList.contains('destacada')) {
			moverPeca(celulaClicada);
			return;
		}

		// Se clicar em outra célula válida com peça do mesmo turno, troca a seleção
		const novaPeca = celulaClicada.querySelector('i');
		if (novaPeca && novaPeca.classList.contains(turnoBrancas ? 'branca' : 'preta')) {
			limparMovimentosPossiveis();
			mostrarMovimentosPossiveis(celulaClicada.id);
			return;
		}
	}

	// Caso nenhuma peça esteja selecionada, seleciona a nova peça válida
	mostrarMovimentosPossiveis(celulaClicada.id);
});

// Temporizador
const minutosLabel = document.getElementById("minutos");
const segundosLabel = document.getElementById("segundos");
let totalSegundos = 0;

setInterval(atualizarTempo, 1000);

// Função para atualizar o tempo
function atualizarTempo() {
    totalSegundos++;
    segundosLabel.innerHTML = formatarTempo(totalSegundos % 60);
    minutosLabel.innerHTML = formatarTempo(Math.floor(totalSegundos / 60));
}

function formatarTempo(valor) {
    return valor.toString().padStart(2, "0");
}
