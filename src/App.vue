<template>
  <div id="app">
    <div class="timer">
      <span>{{ formatTime(minutes) }}</span>:<span>{{ formatTime(seconds) }}</span>
    </div>
    
    <ChessBoard 
      :board="board" 
      :selectedCell="selectedCell"
      :possibleMoves="possibleMoves"
      @cell-click="handleCellClick"
    />
    
    <div class="player-info">
      <div class="player-name">{{ playerName || 'Jogador' }}</div>
      <div class="turn-indicator">
        {{ turnoBrancas ? 'Turno das Brancas' : 'Turno das Pretas' }}
      </div>
      <div class="game-controls">
        <button @click="resetGame" class="reset-btn">Novo Jogo</button>
        <button @click="toggleTimer" class="timer-btn">
          {{ isTimerRunning ? 'Pausar' : 'Continuar' }}
        </button>
      </div>
    </div>

    <!-- Tela de Fim de Jogo -->
    <div v-if="gameOver" class="game-over-overlay">
      <div class="game-over-modal">
        <h2>🎉 Fim de Jogo! 🎉</h2>
        <div class="winner-announcement">
          <h3>{{ winner === 'brancas' ? '🏆 Brancas Vencem! 🏆' : '🏆 Pretas Vencem! 🏆' }}</h3>
          <p>O rei foi capturado!</p>
        </div>
        <div class="game-stats">
          <p><strong>Tempo de jogo:</strong> {{ formatTime(minutes) }}:{{ formatTime(seconds) }}</p>
          <p><strong>Total de jogadas:</strong> {{ gameHistory.length }}</p>
        </div>
        <button @click="resetGame" class="new-game-btn">Jogar Novamente</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import ChessBoard from './components/ChessBoard.vue'
import { useChessGame } from './composables/useChessGame'
import { useTimer } from './composables/useTimer'

// Socket.IO connection
const socket = io()

// Game state
const {
  board,
  selectedCell,
  possibleMoves,
  turnoBrancas,
  gameHistory,
  gameOver,
  winner,
  handleCellClick,
  initializeBoard,
  resetGame: resetChessGame
} = useChessGame(socket)

// Timer
const { minutes, seconds, startTimer, stopTimer, pauseTimer, resumeTimer } = useTimer()
const isTimerRunning = ref(true)

// Player info
const playerName = ref('')

// Initialize game
onMounted(() => {
  initializeBoard()
  startTimer()
  
  // Prompt for player name
  const name = prompt('Digite seu nome:')
  if (name) {
    playerName.value = name
    socket.emit('registrarJogador', name)
  }
  
  // Socket event listeners
  socket.on('registrado', (data) => {
    console.log('Jogador registrado:', data)
  })
  
  socket.on('jogada', (jogada) => {
    console.log('Nova jogada recebida:', jogada)
    // Handle opponent's move here
  })
})

onUnmounted(() => {
  stopTimer()
  socket.disconnect()
})

// Format time helper
const formatTime = (time) => {
  return time.toString().padStart(2, '0')
}

// Reset game function
const resetGame = () => {
  resetChessGame()
  // Reset timer
  stopTimer()
  startTimer()
}

// Toggle timer
const toggleTimer = () => {
  if (isTimerRunning.value) {
    pauseTimer()
    isTimerRunning.value = false
  } else {
    resumeTimer()
    isTimerRunning.value = true
  }
}
</script>
