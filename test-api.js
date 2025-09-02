// Script para testar a conectividade com a API Go
const http = require('http');

const API_BASE = 'http://localhost:8081/api/v1';

async function testAPI() {
  console.log('🧪 Testando conectividade com a API Go...\n');

  // Teste 1: Health Check
  console.log('[1/3] Testando Health Check...');
  try {
    const healthResponse = await makeRequest('GET', '/health');
    if (healthResponse.success) {
      console.log('✅ Health Check: OK');
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Versão: ${healthResponse.data.version}\n`);
    } else {
      console.log('❌ Health Check: FALHOU');
      console.log(`   Erro: ${healthResponse.message}\n`);
      return;
    }
  } catch (error) {
    console.log('❌ Health Check: ERRO DE CONEXÃO');
    console.log(`   Erro: ${error.message}`);
    console.log('   Verifique se a API Go está rodando na porta 8081\n');
    return;
  }

  // Teste 2: Criar Nova Partida
  console.log('[2/3] Testando criação de nova partida...');
  try {
    const gameResponse = await makeRequest('POST', '/game/new', {
      player_color: 'white',
      difficulty: 'medium'
    });
    
    if (gameResponse.success) {
      console.log('✅ Criação de partida: OK');
      console.log(`   ID da partida: ${gameResponse.data.id}`);
      console.log(`   FEN: ${gameResponse.data.fen}`);
      console.log(`   Status: ${gameResponse.data.status}\n`);
      
      // Teste 3: Fazer Movimento
      console.log('[3/3] Testando movimento...');
      try {
        const moveResponse = await makeRequest('POST', '/game/move', {
          game_id: gameResponse.data.id,
          from: 'e2',
          to: 'e4'
        });
        
        if (moveResponse.success) {
          console.log('✅ Movimento: OK');
          console.log(`   Movimento válido: ${moveResponse.data.valid}`);
          console.log(`   Novo FEN: ${moveResponse.data.new_fen}`);
          if (moveResponse.data.computer_move) {
            console.log(`   Movimento do computador: ${moveResponse.data.computer_move.from} → ${moveResponse.data.computer_move.to}`);
          }
        } else {
          console.log('❌ Movimento: FALHOU');
          console.log(`   Erro: ${moveResponse.message}`);
        }
      } catch (error) {
        console.log('❌ Movimento: ERRO');
        console.log(`   Erro: ${error.message}`);
      }
    } else {
      console.log('❌ Criação de partida: FALHOU');
      console.log(`   Erro: ${gameResponse.message}\n`);
    }
  } catch (error) {
    console.log('❌ Criação de partida: ERRO');
    console.log(`   Erro: ${error.message}\n`);
  }

  console.log('\n🎯 Teste concluído!');
  console.log('Se todos os testes passaram, a API está funcionando corretamente.');
  console.log('Agora você pode executar "npm start" para iniciar o jogo.');
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
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error('Resposta inválida da API'));
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

// Executar teste
testAPI().catch(console.error);
