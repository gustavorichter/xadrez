// Teste específico para verificar a conectividade com a API
const http = require('http');

async function testConnection() {
  console.log('🔍 Testando conectividade com a API Go...\n');

  // Teste 1: Health Check
  console.log('[1/2] Testando Health Check...');
  try {
    const healthResponse = await makeRequest('GET', '/api/v1/health');
    console.log('✅ Health Check: OK');
    console.log('   Resposta completa:', JSON.stringify(healthResponse, null, 2));
    
    if (healthResponse.success && healthResponse.data) {
      console.log(`   Status: ${healthResponse.data.status}`);
      console.log(`   Versão: ${healthResponse.data.version}`);
      console.log(`   Mensagem: ${healthResponse.data.message}`);
    }
  } catch (error) {
    console.log('❌ Health Check: ERRO');
    console.log(`   Erro: ${error.message}`);
    console.log('   Verifique se a API Go está rodando na porta 8081');
    return;
  }

  console.log('\n[2/2] Testando criação de partida...');
  try {
    const gameResponse = await makeRequest('POST', '/api/v1/game/new', {
      player_color: 'white',
      difficulty: 'medium'
    });
    
    console.log('✅ Criação de partida: OK');
    console.log('   Resposta completa:', JSON.stringify(gameResponse, null, 2));
    
    if (gameResponse.success && gameResponse.data) {
      console.log(`   ID da partida: ${gameResponse.data.id}`);
      console.log(`   FEN: ${gameResponse.data.fen}`);
      console.log(`   Status: ${gameResponse.data.status}`);
      console.log(`   Jogador atual: ${gameResponse.data.current_player}`);
    }
  } catch (error) {
    console.log('❌ Criação de partida: ERRO');
    console.log(`   Erro: ${error.message}`);
  }

  console.log('\n🎯 Teste concluído!');
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

// Executar teste
testConnection().catch(console.error);
