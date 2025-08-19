import { ref, reactive } from 'vue'

export function useChessGame(socket) {
  // Game state
  const board = ref([])
  const selectedCell = ref(null)
  const possibleMoves = ref([])
  const turnoBrancas = ref(true)
  const gameHistory = ref([])
  const gameOver = ref(false)
  const winner = ref(null)

  // Initialize the chess board
  const initializeBoard = () => {
    const newBoard = []
    
    // Create all cells - corrigindo a ordem das linhas
    for (let row = 1; row <= 8; row++) {
      for (let col = 0; col < 8; col++) {
        const colLetter = String.fromCharCode(97 + col)
        const cellId = colLetter + row
        
        const cell = {
          id: cellId,
          piece: null
        }
        
        // Place pieces based on chess rules - CORRIGIDO
        if (row === 2) {
          cell.piece = { type: 'peao', color: 'branca' }
        } else if (row === 1) {
          const pieceTypes = ['torre', 'cavalo', 'bispo', 'rainha', 'rei', 'bispo', 'cavalo', 'torre']
          cell.piece = { type: pieceTypes[col], color: 'branca' }
        } else if (row === 7) {
          cell.piece = { type: 'peao', color: 'preta' }
        } else if (row === 8) {
          const pieceTypes = ['torre', 'cavalo', 'bispo', 'rainha', 'rei', 'bispo', 'cavalo', 'torre']
          cell.piece = { type: pieceTypes[col], color: 'preta' }
        }
        
        newBoard.push(cell)
      }
    }
    
    board.value = newBoard
    gameOver.value = false
    winner.value = null
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
  const handleCellClick = (cellId) => {
    // Se o jogo acabou, não permitir mais jogadas
    if (gameOver.value) return
    
    const cell = board.value.find(c => c.id === cellId)
    
    if (!cell) return
    
    // If no piece is selected and clicked cell has a piece of current player's color
    if (!selectedCell.value && cell.piece) {
      const isCurrentPlayerPiece = (turnoBrancas.value && cell.piece.color === 'branca') ||
                                  (!turnoBrancas.value && cell.piece.color === 'preta')
      
      if (isCurrentPlayerPiece) {
        selectedCell.value = cellId
        showPossibleMoves(cellId)
      }
    }
    // If a piece is selected and clicked cell is a possible move
    else if (selectedCell.value && possibleMoves.value.includes(cellId)) {
      movePiece(selectedCell.value, cellId)
    }
    // Deselect current piece
    else if (selectedCell.value === cellId) {
      clearSelection()
    }
    // Select new piece
    else if (cell.piece) {
      const isCurrentPlayerPiece = (turnoBrancas.value && cell.piece.color === 'branca') ||
                                  (!turnoBrancas.value && cell.piece.color === 'preta')
      
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

  // Move piece from origin to destination
  const movePiece = (origin, destination) => {
    const originCell = board.value.find(c => c.id === origin)
    const destCell = board.value.find(c => c.id === destination)
    
    if (!originCell || !destCell) return
    
    // Record the move
    const move = {
      origem: origin,
      destino: destination,
      peca: originCell.piece,
      captura: destCell.piece,
      turno: turnoBrancas.value ? 'brancas' : 'pretas',
      timestamp: new Date()
    }
    
    // Check if king is captured before moving
    const kingCaptured = checkKingCapture(destCell.piece)
    
    // Move piece
    destCell.piece = originCell.piece
    originCell.piece = null
    
    // Add to game history
    gameHistory.value.push(move)
    
    // Emit move to server
    if (socket) {
      socket.emit('jogada', {
        origem: origin,
        destino: destination,
        turno: turnoBrancas.value ? 'brancas' : 'pretas'
      })
    }
    
    // If king was captured, don't switch turn
    if (!kingCaptured) {
      // Switch turn
      turnoBrancas.value = !turnoBrancas.value
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
  const resetGame = () => {
    initializeBoard()
    turnoBrancas.value = true
    gameHistory.value = []
    clearSelection()
  }

  return {
    board,
    selectedCell,
    possibleMoves,
    turnoBrancas,
    gameHistory,
    gameOver,
    winner,
    handleCellClick,
    initializeBoard,
    clearSelection,
    resetGame
  }
}
