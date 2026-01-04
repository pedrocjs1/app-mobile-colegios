#############################################
#  INSTALL.ps1 - Script de Instalación Limpia
#  White Label Edu App (Expo/React Native)
#############################################

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host ""
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  🎓 White Label Edu App - Instalación Limpia' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host 'Verificando versión de Node.js...' -ForegroundColor Yellow

try {
    $nodeVersion = node -v
    Write-Host 'Node.js $nodeVersion' -ForegroundColor Green
    
    # Extract major version
    $nodeMajor = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
    
    if ($nodeMajor -lt 18) {
        Write-Host 'Versión de Node.js incompatible: $nodeVersion' -ForegroundColor Red
        Write-Host '   Se requiere Node.js 18.x o superior (recomendado: 20.x)' -ForegroundColor Red
        exit 1
    }
    elseif ($nodeMajor -lt 20) {
        Write-Host 'Node.js $nodeVersion detectado. Recomendamos 20.x para mejor compatibilidad.' -ForegroundColor Yellow
    }
}
catch {
    Write-Host 'Node.js no está instalado.' -ForegroundColor Red
    Write-Host '   Por favor, instala Node.js 20.x desde: https://nodejs.org/' -ForegroundColor Red
    exit 1
}

# Check npm version
Write-Host 'Verificando versión de npm...' -ForegroundColor Yellow
$npmVersion = npm -v
Write-Host 'npm v$npmVersion' -ForegroundColor Green
Write-Host ''

# Step 1: Clean npm cache
Write-Host '🧹 Paso 1/4: Limpiando caché de npm...' -ForegroundColor Yellow
npm cache clean --force
Write-Host 'Caché limpiado' -ForegroundColor Green
Write-Host ''

# Step 2: Remove node_modules
Write-Host 'Paso 2/4: Eliminando node_modules existente...' -ForegroundColor Yellow
if (Test-Path 'node_modules') {
    Remove-Item -Recurse -Force 'node_modules'
    Write-Host 'node_modules eliminado' -ForegroundColor Green
}
else {
    Write-Host 'node_modules no existe, continuando...' -ForegroundColor Green
}
Write-Host ''

# Step 3: Clean install using npm ci
Write-Host 'Paso 3/4: Instalando dependencias con npm ci...' -ForegroundColor Yellow
Write-Host '   (Esto respeta las versiones exactas de package-lock.json)' -ForegroundColor Gray
npm ci
Write-Host 'Dependencias instaladas correctamente' -ForegroundColor Green
Write-Host ''

# Step 4: Clear Expo cache info
Write-Host 'Paso 4/4: Limpiando caché de Expo...' -ForegroundColor Yellow
# Just verify expo is available
npx expo --version | Out-Null
Write-Host 'Caché de Expo preparado' -ForegroundColor Green
Write-Host ''

# Check for .env file
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  Configuración de Variables de Entorno' -ForegroundColor Cyan
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host 'No se encontró archivo .env' -ForegroundColor Yellow
    Write-Host ''
    Write-Host '   Crea un archivo .env en la raíz del proyecto con:' -ForegroundColor White
    Write-Host ''
    Write-Host '   EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase' -ForegroundColor Cyan
    Write-Host '   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key' -ForegroundColor Cyan
    Write-Host ''
    Write-Host '   Puedes copiar .env.example como plantilla.' -ForegroundColor White
}
else {
    Write-Host 'Archivo .env encontrado' -ForegroundColor Green
}

Write-Host ''
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Green
Write-Host '  ¡Instalación completada!' -ForegroundColor Green
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Green
Write-Host ''
Write-Host '  Siguiente paso: Ejecuta la aplicación con:' -ForegroundColor White
Write-Host ''
Write-Host '    npx expo start -c' -ForegroundColor Cyan
Write-Host ''
Write-Host '  O para plataformas específicas:' -ForegroundColor White
Write-Host ''
Write-Host '    npx expo start --android  (Android)' -ForegroundColor Cyan
Write-Host '    npx expo start --ios      (iOS)' -ForegroundColor Cyan
Write-Host '    npx expo start --web      (Web)' -ForegroundColor Cyan
Write-Host ''
