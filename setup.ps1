# XADREZ - Setup de Integração
# Script PowerShell para configuração automática

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    XADREZ - Setup de Integracao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/4] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js de https://nodejs.org/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Instalar dependências
Write-Host "[2/4] Instalando dependências do frontend..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ Dependências instaladas" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao instalar dependências" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Construir projeto
Write-Host "[3/4] Construindo projeto..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✓ Projeto construído" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao construir projeto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

# Verificar Go
Write-Host "[4/4] Verificando Go..." -ForegroundColor Yellow
try {
    $goVersion = go version
    Write-Host "✓ Go encontrado: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "AVISO: Go não encontrado!" -ForegroundColor Yellow
    Write-Host "Para usar a API completa, instale o Go de https://golang.org/" -ForegroundColor Yellow
    Write-Host "O jogo funcionará com movimentos básicos sem a API Go" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para iniciar o jogo:" -ForegroundColor White
Write-Host "1. Certifique-se de que a API Go está rodando na porta 8080" -ForegroundColor White
Write-Host "2. Execute: npm start" -ForegroundColor White
Write-Host "3. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Para mais informações, consulte README-INTEGRACAO.md" -ForegroundColor White
Write-Host ""

# Perguntar se quer iniciar o servidor
$startServer = Read-Host "Deseja iniciar o servidor agora? (s/n)"
if ($startServer -eq "s" -or $startServer -eq "S" -or $startServer -eq "sim") {
    Write-Host "Iniciando servidor..." -ForegroundColor Green
    npm start
}

Read-Host "Pressione Enter para sair"
