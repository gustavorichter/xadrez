import { ref } from 'vue'

const API_BASE = '/api/v1'

export function useChessAPI() {
  const loading = ref(false)
  const error = ref(null)

  const createGame = async (playerColor = 'white', difficulty = 'medium') => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/game/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_color: playerColor,
          difficulty: difficulty
        })
      })
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Verificar se há conteúdo na resposta
      const text = await response.text()
      if (!text) {
        throw new Error('Resposta vazia da API')
      }
      
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError)
        console.error('Resposta recebida:', text)
        throw new Error('Resposta inválida da API (não é JSON válido)')
      }
      
      if (data.success) {
        return data.data // Retorna os dados da partida
      } else {
        throw new Error(data.message || 'Erro desconhecido da API')
      }
    } catch (err) {
      console.error('Erro na API:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const makeMove = async (gameId, from, to) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/game/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          from: from,
          to: to
        })
      })
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        // Tentar obter detalhes do erro da API
        let errorDetails = ''
        try {
          const errorText = await response.text()
          if (errorText) {
            const errorData = JSON.parse(errorText)
            errorDetails = errorData.message || errorText
          }
        } catch (e) {
          errorDetails = response.statusText
        }
        
        console.error('Erro HTTP:', {
          status: response.status,
          statusText: response.statusText,
          details: errorDetails,
          url: response.url
        })
        
        throw new Error(`HTTP ${response.status}: ${errorDetails || response.statusText}`)
      }
      
      // Verificar se há conteúdo na resposta
      const text = await response.text()
      if (!text) {
        throw new Error('Resposta vazia da API')
      }
      
      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError)
        console.error('Resposta recebida:', text)
        throw new Error('Resposta inválida da API (não é JSON válido)')
      }
      
      if (data.success) {
        return data.data // Retorna a resposta do movimento
      } else {
        throw new Error(data.message || 'Erro desconhecido da API')
      }
    } catch (err) {
      console.error('Erro na API:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getGame = async (gameId) => {
    try {
      const response = await fetch(`${API_BASE}/game/${gameId}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getBoard = async (gameId) => {
    try {
      const response = await fetch(`${API_BASE}/game/${gameId}/board`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    loading,
    error,
    createGame,
    makeMove,
    getGame,
    getBoard,
    checkHealth
  }
}
