<template>
  <div class="chess-board">
    <div 
      v-for="row in 8" 
      :key="row" 
      class="chess-row"
    >
      <div
        v-for="col in 8"
        :key="col"
        :class="getCellClasses(row, col)"
        @click="handleCellClick(getCellId(row, col))"
      >
        <i 
          v-if="getPiece(row, col)"
          :class="getPieceClasses(row, col)"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  board: {
    type: Array,
    required: true
  },
  selectedCell: {
    type: String,
    default: null
  },
  possibleMoves: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cell-click'])

// Get cell ID (e.g., 'a1', 'b2', etc.) - CORRIGIDO
const getCellId = (row, col) => {
  const colLetter = String.fromCharCode(97 + col - 1) // 'a' = 97
  const rowNumber = row // Linha 1 = 1, Linha 2 = 2, etc.
  return colLetter + rowNumber
}

// Get piece at specific position
const getPiece = (row, col) => {
  const cellId = getCellId(row, col)
  return props.board.find(cell => cell.id === cellId)?.piece || null
}

// Get piece classes for styling
const getPieceClasses = (row, col) => {
  const piece = getPiece(row, col)
  if (!piece) return ''
  
  const iconMap = {
    torre: 'fas fa-chess-rook',
    cavalo: 'fas fa-chess-knight',
    bispo: 'fas fa-chess-bishop',
    rei: 'fas fa-chess-king',
    rainha: 'fas fa-chess-queen',
    peao: 'fas fa-chess-pawn'
  }
  
  const iconClass = iconMap[piece.type] || ''
  const colorClass = piece.color === 'branca' ? 'branca' : 'preta'
  
  return `${iconClass} chess-piece ${colorClass}`
}

// Get cell classes for styling
const getCellClasses = (row, col) => {
  const cellId = getCellId(row, col)
  const isEven = (row + col) % 2 === 0
  
  const classes = ['chess-cell']
  classes.push(isEven ? 'par' : 'impar')
  
  if (props.selectedCell === cellId) {
    classes.push('selected')
  }
  
  if (props.possibleMoves.includes(cellId)) {
    classes.push('possible-move')
  }
  
  return classes.join(' ')
}

// Handle cell click
const handleCellClick = (cellId) => {
  emit('cell-click', cellId)
}
</script>
