// Teste para verificar o estado de uma partida específica
const http = require('http');

async function testGameState(gameId) {
  console.log(`🔍 Testando estado da partida: ${gameId}\n`);

  try {
    // Obter informações da partida
    const gameResponse = await makeRequest('GET', `/api/v1/game/${gameId}`);
    
    console.log('✅ Informações da partida:');
    console.log('   Resposta completa:', JSON.stringify(gameResponse, null, 2));
    
    if (gameResponse.success && gameResponse.data) {
      const game = gameResponse.data;
      console.log(`   ID: ${game.id}`);
      console.log(`   Status: ${game.status}`);
      console.log(`   Jogador atual: ${game.current_player}`);
      console.log(`   FEN: ${game.fen}`);
      console.log(`   Movimentos: ${game.moves ? game.moves.length : 0}`);
      
      // Testar um movimento
      console.log('\n🧪 Testando movimento...');
      try {
        const moveResponse = await makeRequest('POST', '/api/v1/game/move', {
          game_id: gameId,
          from: 'e2',
          to: 'e4'
        });
        
        console.log('✅ Movimento testado:');
        console.log('   Resposta completa:', JSON.stringify(moveResponse, null, 2));
        
        if (moveResponse.success && moveResponse.data) {
          console.log(`   Válido: ${moveResponse.data.valid}`);
          console.log(`   Status do jogo: ${moveResponse.data.game_status}`);
          if (moveResponse.data.computer_move) {
            console.log(`   Movimento do computador: ${moveResponse.data.computer_move.from} → ${moveResponse.data.computer_move.to}`);
          }
        }
      } catch (moveError) {
        console.log('❌ Erro no movimento:');
        console.log(`   Erro: ${moveError.message}`);
      }
    }
  } catch (error) {
    console.log('❌ Erro ao obter informações da partida:');
    console.log(`   Erro: ${error.message}`);
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          if (!responseData) {
            reject(new Error('Resposta vazia da API'));
            return;
          }
          
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          console.error('Erro ao fazer parse do JSON:', error);
          console.error('Resposta recebida:', responseData);
          reject(new Error('Resposta inválida da API (não é JSON válido)'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Obter ID da partida dos argumentos da linha de comando
const gameId = process.argv[2];

if (!gameId) {
  console.log('❌ Por favor, forneça o ID da partida:');
  console.log('   node test-game-state.js <game-id>');
  console.log('\n💡 Você pode obter o ID da partida do console do navegador ou criar uma nova partida.');
  process.exit(1);
}

// Executar teste
testGameState(gameId).catch(console.error);
