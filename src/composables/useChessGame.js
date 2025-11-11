import { ref, reactive } from 'vue'
import { useChessAPI } from './useChessAPI.js'

export function useChessGame() {
  // API integration
  const { createGame, makeMove, getGame, getBoard, loading, error } = useChessAPI()
  
  // Game state
  const board = ref([])
  const selectedCell = ref(null)
  const possibleMoves = ref([])
  const turnoBrancas = ref(true)
  const gameHistory = ref([])
  const gameOver = ref(false)
  const winner = ref(null)
  const currentGame = ref(null)
  const playerColor = ref('white')
  const computerColor = ref('black')

  // Initialize a new game using the API
  const initializeBoard = async (playerColorChoice = 'white', difficulty = 'medium') => {
    try {
      playerColor.value = playerColorChoice
      computerColor.value = playerColorChoice === 'white' ? 'black' : 'white'
      
      const gameData = await createGame(playerColorChoice, difficulty)
      currentGame.value = gameData
      
      // Parse FEN string to create board
      parseFenToBoard(gameData.fen)
      
      gameOver.value = false
      winner.value = null
      gameHistory.value = []
      turnoBrancas.value = gameData.current_player === 'white'
      
      return gameData
    } catch (err) {
      console.error('Erro ao criar nova partida:', err)
      throw err
    }
  }

  // Parse FEN string to board representation
  const parseFenToBoard = (fen) => {
    const newBoard = []
    const [piecePlacement] = fen.split(' ')
    
    // Create all cells first
    for (let row = 1; row <= 8; row++) {
      for (let col = 0; col < 8; col++) {
        const colLetter = String.fromCharCode(97 + col)
        const cellId = colLetter + row
        
        newBoard.push({
          id: cellId,
          piece: null
        })
      }
    }
    
    // Parse FEN and place pieces
    const rows = piecePlacement.split('/')
    rows.forEach((row, rowIndex) => {
      let colIndex = 0
      for (let char of row) {
        if (isNaN(char)) {
          // It's a piece
          const piece = getPieceFromChar(char)
          const cellId = String.fromCharCode(97 + colIndex) + (8 - rowIndex)
          const cell = newBoard.find(c => c.id === cellId)
          if (cell) {
            cell.piece = piece
          }
          colIndex++
        } else {
          // It's a number (empty squares)
          colIndex += parseInt(char)
        }
      }
    })
    
    board.value = newBoard
  }

  // Convert FEN piece character to piece object
  const getPieceFromChar = (char) => {
    const pieceMap = {
      'K': { type: 'rei', color: 'branca' },
      'Q': { type: 'rainha', color: 'branca' },
      'R': { type: 'torre', color: 'branca' },
      'B': { type: 'bispo', color: 'branca' },
      'N': { type: 'cavalo', color: 'branca' },
      'P': { type: 'peao', color: 'branca' },
      'k': { type: 'rei', color: 'preta' },
      'q': { type: 'rainha', color: 'preta' },
      'r': { type: 'torre', color: 'preta' },
      'b': { type: 'bispo', color: 'preta' },
      'n': { type: 'cavalo', color: 'preta' },
      'p': { type: 'peao', color: 'preta' }
    }
    return pieceMap[char] || null
  }

  // Check if king is captured
  const checkKingCapture = (capturedPiece) => {
    if (capturedPiece && capturedPiece.type === 'rei') {
      gameOver.value = true
      // O vencedor é quem capturou o rei (oposto da cor da peça capturada)
      winner.value = capturedPiece.color === 'branca' ? 'pretas' : 'brancas'
      return true
    }
    return false
  }

  // Handle cell click
  const handleCellClick = async (cellId) => {
    // Se o jogo acabou, não permitir mais jogadas
    if (gameOver.value || (currentGame.value && currentGame.value.status !== 'active')) {
      console.log('Jogo acabou ou não está ativo, não permitir jogadas')
      return
    }
    
    // Se não há partida ativa, não permitir jogadas
    if (!currentGame.value) {
      console.log('Nenhuma partida ativa')
      return
    }
    
    const cell = board.value.find(c => c.id === cellId)
    
    if (!cell) return
    
    // Verificar se é o turno do jogador
    const isPlayerTurn = currentGame.value.current_player === playerColor.value
    console.log('Verificação de turno:', {
      current_player: currentGame.value.current_player,
      player_color: playerColor.value,
      is_player_turn: isPlayerTurn
    })
    
    if (!isPlayerTurn) {
      console.log('Não é o turno do jogador')
      return
    }
    
    // If no piece is selected and clicked cell has a piece of current player's color
    if (!selectedCell.value && cell.piece) {
      const isCurrentPlayerPiece = (playerColor.value === 'white' && cell.piece.color === 'branca') ||
                                  (playerColor.value === 'black' && cell.piece.color === 'preta')
      
      if (isCurrentPlayerPiece) {
        selectedCell.value = cellId
        showPossibleMoves(cellId)
      }
    }
    // If a piece is selected, try to move to clicked cell (let API validate)
    else if (selectedCell.value) {
      await movePiece(selectedCell.value, cellId)
    }
    // Deselect current piece
    else if (selectedCell.value === cellId) {
      clearSelection()
    }
    // Select new piece
    else if (cell.piece) {
      const isCurrentPlayerPiece = (playerColor.value === 'white' && cell.piece.color === 'branca') ||
                                  (playerColor.value === 'black' && cell.piece.color === 'preta')
      
      if (isCurrentPlayerPiece) {
        selectedCell.value = cellId
        showPossibleMoves(cellId)
      }
    }
  }

  // Show possible moves for selected piece
  const showPossibleMoves = (cellId) => {
    const cell = board.value.find(c => c.id === cellId)
    if (!cell || !cell.piece) return

    // Usa a validação local novamente
    const moves = calculatePossibleMoves(cellId, cell.piece)
    possibleMoves.value = moves
  }

  // Calculate possible moves for a piece
  const calculatePossibleMoves = (cellId, piece) => {
    const moves = []
    const col = cellId.charCodeAt(0) - 97
    const row = parseInt(cellId.charAt(1))
    
    switch (piece.type) {
      case 'peao':
        addPawnMoves(moves, col, row, piece.color)
        break
      case 'torre':
        addRookMoves(moves, col, row, piece.color)
        break
      case 'cavalo':
        addKnightMoves(moves, col, row, piece.color)
        break
      case 'bispo':
        addBishopMoves(moves, col, row, piece.color)
        break
      case 'rainha':
        addRookMoves(moves, col, row, piece.color)
        addBishopMoves(moves, col, row, piece.color)
        break
      case 'rei':
        addKingMoves(moves, col, row, piece.color)
        break
    }
    
    return moves
  }

  // Add pawn moves
  const addPawnMoves = (moves, col, row, color) => {
    const direction = color === 'branca' ? 1 : -1
    const startRow = color === 'branca' ? 2 : 7
    
    // Forward move
    const newRow = row + direction
    if (newRow >= 1 && newRow <= 8) {
      const cellId = String.fromCharCode(97 + col) + newRow
      const targetCell = board.value.find(c => c.id === cellId)
      
      if (targetCell && !targetCell.piece) {
        moves.push(cellId)
        
        // Double move from start position
        if (row === startRow) {
          const doubleRow = newRow + direction
          if (doubleRow >= 1 && doubleRow <= 8) {
            const doubleCellId = String.fromCharCode(97 + col) + doubleRow
            const doubleCell = board.value.find(c => c.id === doubleCellId)
            if (doubleCell && !doubleCell.piece) {
              moves.push(doubleCellId)
            }
          }
        }
      }
    }
    
    // Diagonal captures
    const diagonalCols = [col - 1, col + 1]
    diagonalCols.forEach(newCol => {
      if (newCol >= 0 && newCol < 8) {
        const newRow = row + direction
        if (newRow >= 1 && newRow <= 8) {
          const cellId = String.fromCharCode(97 + newCol) + newRow
          const targetCell = board.value.find(c => c.id === cellId)
          
          if (targetCell && targetCell.piece && targetCell.piece.color !== color) {
            moves.push(cellId)
          }
        }
      }
    })
  }

  // Add rook moves
  const addRookMoves = (moves, col, row, color) => {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    
    directions.forEach(([dCol, dRow]) => {
      let newCol = col + dCol
      let newRow = row + dRow
      
      while (newCol >= 0 && newCol < 8 && newRow >= 1 && newRow <= 8) {
        const cellId = String.fromCharCode(97 + newCol) + newRow
        const targetCell = board.value.find(c => c.id === cellId)
        
        if (!targetCell) break
        
        if (!targetCell.piece) {
          moves.push(cellId)
        } else {
          if (targetCell.piece.color !== color) {
            moves.push(cellId)
          }
          break
        }
        
        newCol += dCol
        newRow += dRow
      }
    })
  }

  // Add knight moves
  const addKnightMoves = (moves, col, row, color) => {
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ]
    
    knightMoves.forEach(([dCol, dRow]) => {
      const newCol = col + dCol
      const newRow = row + dRow
      
      if (newCol >= 0 && newCol < 8 && newRow >= 1 && newRow <= 8) {
        const cellId = String.fromCharCode(97 + newCol) + newRow
        const targetCell = board.value.find(c => c.id === cellId)
        
        if (!targetCell) return
        
        if (!targetCell.piece || targetCell.piece.color !== color) {
          moves.push(cellId)
        }
      }
    })
  }

  // Add bishop moves
  const addBishopMoves = (moves, col, row, color) => {
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    
    directions.forEach(([dCol, dRow]) => {
      let newCol = col + dCol
      let newRow = row + dRow
      
      while (newCol >= 0 && newCol < 8 && newRow >= 1 && newRow <= 8) {
        const cellId = String.fromCharCode(97 + newCol) + newRow
        const targetCell = board.value.find(c => c.id === cellId)
        
        if (!targetCell) break
        
        if (!targetCell.piece) {
          moves.push(cellId)
        } else {
          if (targetCell.piece.color !== color) {
            moves.push(cellId)
          }
          break
        }
        
        newCol += dCol
        newRow += dRow
      }
    })
  }

  // Add king moves
  const addKingMoves = (moves, col, row, color) => {
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]
    
    kingMoves.forEach(([dCol, dRow]) => {
      const newCol = col + dCol
      const newRow = row + dRow
      
      if (newCol >= 0 && newCol < 8 && newRow >= 1 && newRow <= 8) {
        const cellId = String.fromCharCode(97 + newCol) + newRow
        const targetCell = board.value.find(c => c.id === cellId)
        
        if (!targetCell) return
        
        if (!targetCell.piece || targetCell.piece.color !== color) {
          moves.push(cellId)
        }
      }
    })
  }

  // Move piece from origin to destination using API
  const movePiece = async (origin, destination) => {
    if (!currentGame.value) return
    
    console.log('Tentando fazer movimento:', {
      gameId: currentGame.value.id,
      from: origin,
      to: destination,
      currentPlayer: currentGame.value.current_player,
      gameStatus: currentGame.value.status
    })
    
    try {
      const moveResult = await makeMove(currentGame.value.id, origin, destination)
      
      if (moveResult.valid) {
        // Update board with new FEN
        parseFenToBoard(moveResult.new_fen)
        
        // Update game state
        currentGame.value.status = moveResult.game_status
        
        // Detectar se o movimento do jogador capturou o rei
        let capturedPiece = board.value.find(c => c.id === destination)?.piece
        let forcarFim = false
        let vencedorForcado = null
        if (capturedPiece && capturedPiece.type === 'rei') {
          forcarFim = true
          vencedorForcado = capturedPiece.color === 'branca' ? 'pretas' : 'brancas'
        }

        // Record the player's move
        const playerMove = {
          origem: origin,
          destino: destination,
          peca: board.value.find(c => c.id === origin)?.piece,
          captura: capturedPiece,
          turno: playerColor.value,
          timestamp: new Date()
        }
        
        gameHistory.value.push(playerMove)
        
        // Check if computer made a move
        if (moveResult.computer_move) {
          console.log('Computador fez movimento:', moveResult.computer_move)
          
          // Record the computer's move
          const computerMove = {
            origem: moveResult.computer_move.from,
            destino: moveResult.computer_move.to,
            peca: moveResult.computer_move.piece,
            turno: computerColor.value,
            timestamp: new Date()
          }
          gameHistory.value.push(computerMove)
          
          // Update current player to be the player again (after computer's move)
          currentGame.value.current_player = playerColor.value
        } else {
          // If no computer move, it's still the computer's turn
          currentGame.value.current_player = computerColor.value
        }
        
        // Check game status
        if (moveResult.game_status === 'finished') {
          gameOver.value = true
          // Determina o vencedor com base no campo winner da resposta
          if (moveResult.winner === 'white') {
            winner.value = 'brancas'
          } else if (moveResult.winner === 'black') {
            winner.value = 'pretas'
          } else {
            winner.value = 'empate'
          }
        } else if (moveResult.game_status !== 'active') {
          gameOver.value = true
          // Fallback para compatibilidade antiga
          if (moveResult.game_status === 'white_wins') {
            winner.value = 'brancas'
          } else if (moveResult.game_status === 'black_wins') {
            winner.value = 'pretas'
          } else {
            winner.value = 'empate'
          }
        } else if (forcarFim) {
          // Força o fim do jogo se o rei foi capturado
          gameOver.value = true
          winner.value = vencedorForcado
          currentGame.value.status = 'finished'
          alert('O rei foi capturado! Fim de jogo.')
        }
        
        // Update turn indicator
        turnoBrancas.value = currentGame.value.current_player === 'white'
        
        console.log('Estado atualizado:', {
          current_player: currentGame.value.current_player,
          player_color: playerColor.value,
          computer_color: computerColor.value,
          is_player_turn: currentGame.value.current_player === playerColor.value
        })
      } else {
        console.error('Movimento inválido:', moveResult.message)
        // Show user-friendly error message
        alert(`Movimento inválido: ${moveResult.message}`)
      }
    } catch (err) {
      console.error('Erro ao fazer movimento:', err)
      
      // Show user-friendly error message
      if (err.message.includes('Movimento inválido')) {
        alert('Movimento inválido! Tente outro movimento.')
      } else if (err.message.includes('400')) {
        alert('Movimento não permitido. Verifique se é seu turno e se o movimento é válido.')
      } else {
        alert(`Erro: ${err.message}`)
      }
    }
    
    // Clear selection
    clearSelection()
  }

  // Clear current selection
  const clearSelection = () => {
    selectedCell.value = null
    possibleMoves.value = []
  }

  // Reset game
  const resetGame = async (playerColorChoice = 'white', difficulty = 'medium') => {
    await initializeBoard(playerColorChoice, difficulty)
    clearSelection()
  }

  return {
    // Game state
    board,
    selectedCell,
    possibleMoves,
    turnoBrancas,
    gameHistory,
    gameOver,
    winner,
    currentGame,
    playerColor,
    computerColor,
    loading,
    error,
    
    // Game actions
    handleCellClick,
    initializeBoard,
    clearSelection,
    resetGame,
    
    // API functions
    createGame,
    makeMove,
    getGame,
    getBoard
  }
}
