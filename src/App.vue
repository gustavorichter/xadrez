<template>
  <div id="app">
    <!-- Tela de Configuração Inicial -->
    <div v-if="!currentGame" class="game-setup">
      <div class="setup-modal">
        <h2>🎮 Configurar Partida</h2>
        <div class="setup-options">
          <div class="name-selection">
            <h3>Seu nome:</h3>
            <input 
              v-model="playerName" 
              type="text" 
              placeholder="Digite seu nome"
              class="name-input"
              maxlength="20"
            />
          </div>
          
          <div class="color-selection">
            <h3>Escolha sua cor:</h3>
            <div class="color-buttons">
              <button 
                @click="selectedColor = 'white'" 
                :class="{ active: selectedColor === 'white' }"
                class="color-btn white"
              >
                ⚪ Brancas
              </button>
              <button 
                @click="selectedColor = 'black'" 
                :class="{ active: selectedColor === 'black' }"
                class="color-btn black"
              >
                ⚫ Pretas
              </button>
            </div>
          </div>
          
          <div class="difficulty-selection">
            <h3>Dificuldade:</h3>
            <select v-model="selectedDifficulty" class="difficulty-select">
              <option value="easy">Fácil</option>
              <option value="medium">Médio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          
          <button 
            @click="startNewGame" 
            :disabled="loading"
            class="start-game-btn"
          >
            {{ loading ? 'Criando Partida...' : 'Iniciar Partida' }}
          </button>
          
          <div v-if="error" class="error-message">
            Erro: {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Jogo Principal -->
    <div v-else class="game-container">
      <div class="game-header">
        <div class="timer">
          <span>{{ formatTime(minutes) }}</span>:<span>{{ formatTime(seconds) }}</span>
        </div>
        
        <div class="game-info">
          <div class="player-info">
            <span class="player-label">Você ({{ playerColor === 'white' ? 'Brancas' : 'Pretas' }}):</span>
            <span class="player-name">{{ playerName || 'Jogador' }}</span>
          </div>
          <div class="turn-indicator">
            {{ currentGame?.current_player === playerColor ? 'Seu turno' : 'Turno do computador' }}
          </div>
        </div>
      </div>
      
      <ChessBoard 
        :board="board" 
        :selectedCell="selectedCell"
        :possibleMoves="possibleMoves"
        @cell-click="handleCellClick"
      />
      
      <div class="game-controls">
        <button @click="resetGame" class="reset-btn">Nova Partida</button>
        <button @click="toggleTimer" class="timer-btn">
          {{ isTimerRunning ? 'Pausar' : 'Continuar' }}
        </button>
      </div>

      <!-- Tela de Fim de Jogo -->
      <div v-if="gameOver" class="game-over-overlay">
        <div class="game-over-modal">
          <h2>🎉 Fim de Jogo! 🎉</h2>
          <div class="winner-announcement">
            <h3 v-if="winner === 'brancas'">🏆 Brancas Vencem! 🏆</h3>
            <h3 v-else-if="winner === 'pretas'">🏆 Pretas Vencem! 🏆</h3>
            <h3 v-else>🤝 Empate! 🤝</h3>
          </div>
          <div class="game-stats">
            <p><strong>Tempo de jogo:</strong> {{ formatTime(minutes) }}:{{ formatTime(seconds) }}</p>
            <p><strong>Total de jogadas:</strong> {{ gameHistory.length }}</p>
          </div>
          <button @click="resetGame" class="new-game-btn">Jogar Novamente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ChessBoard from './components/ChessBoard.vue'
import { useChessGame } from './composables/useChessGame'
import { useTimer } from './composables/useTimer'

// Game state
const {
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
  handleCellClick,
  initializeBoard,
  resetGame: resetChessGame
} = useChessGame()

// Timer
const { minutes, seconds, startTimer, stopTimer, pauseTimer, resumeTimer } = useTimer()
const isTimerRunning = ref(true)

// Player info
const playerName = ref('')

// Game setup
const selectedColor = ref('white')
const selectedDifficulty = ref('medium')

// Initialize game
onMounted(() => {
  startTimer()
  
  // Set default player name if not already set
  if (!playerName.value) {
    playerName.value = 'Jogador'
  }
})

onUnmounted(() => {
  stopTimer()
})

// Format time helper
const formatTime = (time) => {
  return time.toString().padStart(2, '0')
}

// Start new game
const startNewGame = async () => {
  // Validate player name
  if (!playerName.value || playerName.value.trim() === '') {
    alert('Por favor, digite seu nome!')
    return
  }

  // Validate difficulty
  const allowedDifficulties = ['easy', 'medium', 'hard']
  if (!allowedDifficulties.includes(selectedDifficulty.value)) {
    alert('Dificuldade inválida! Escolha entre Fácil, Médio ou Difícil.')
    return
  }

  try {
    await initializeBoard(selectedColor.value, selectedDifficulty.value)
    startTimer()
  } catch (err) {
    console.error('Erro ao iniciar nova partida:', err)
  }
}

// Reset game function
const resetGame = async () => {
  try {
    await resetChessGame(selectedColor.value, selectedDifficulty.value)
    // Reset timer
    stopTimer()
    startTimer()
  } catch (err) {
    console.error('Erro ao resetar partida:', err)
  }
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

<style scoped>
/* Game Setup Styles */
.game-setup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.setup-modal {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.setup-modal h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
}

.setup-options h3 {
  margin: 1rem 0 0.5rem 0;
  color: #555;
  font-size: 1.1rem;
}

.name-input {
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
  margin: 0.5rem 0 1rem 0;
  transition: border-color 0.3s ease;
}

.name-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.color-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
}

.color-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.color-btn:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.color-btn.active {
  border-color: #007bff;
  background: #e3f2fd;
  color: #007bff;
}

.difficulty-select {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  margin: 0.5rem 0 1rem 0;
  width: 100%;
  max-width: 200px;
}

.start-game-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.start-game-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.start-game-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

/* Game Container Styles */
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.game-info {
  text-align: right;
}

.player-info {
  margin-bottom: 0.5rem;
}

.player-label {
  font-weight: bold;
  color: #333;
}

.player-name {
  color: #007bff;
  font-weight: bold;
}

.turn-indicator {
  font-size: 1.1rem;
  font-weight: bold;
  color: #28a745;
}

.game-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.reset-btn, .timer-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  background: #dc3545;
  color: white;
}

.reset-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.timer-btn {
  background: #17a2b8;
  color: white;
}

.timer-btn:hover {
  background: #138496;
  transform: translateY(-2px);
}

/* Existing styles for timer, game over overlay, etc. */
.timer {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-over-modal {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 500px;
  width: 90%;
}

.game-over-modal h2 {
  margin-bottom: 1rem;
  color: #333;
}

.winner-announcement h3 {
  margin: 1rem 0;
  color: #28a745;
  font-size: 1.5rem;
}

.game-stats {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.game-stats p {
  margin: 0.5rem 0;
  color: #555;
}

.new-game-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.new-game-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}
</style>
