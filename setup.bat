@echo off
echo ========================================
echo    XADREZ - Setup de Integracao
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/4] Instalando dependencias do frontend...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/4] Construindo projeto...
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir projeto
    pause
    exit /b 1
)
echo ✓ Projeto construido

echo.
echo [4/4] Verificando Go...
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo AVISO: Go nao encontrado!
    echo Para usar a API completa, instale o Go de https://golang.org/
    echo O jogo funcionara com movimentos basicos sem a API Go
) else (
    echo ✓ Go encontrado
)

echo.
echo ========================================
echo    SETUP CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Para iniciar o jogo:
echo 1. Certifique-se de que a API Go esta rodando na porta 8080
echo 2. Execute: npm start
echo 3. Acesse: http://localhost:3000
echo.
echo Para mais informacoes, consulte README-INTEGRACAO.md
echo.
pause
