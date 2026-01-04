#!/bin/bash

#############################################
#  INSTALL.sh - Script de Instalación Limpia
#  White Label Edu App (Expo/React Native)
#############################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🎓 White Label Edu App - Instalación Limpia${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Check Node.js version
echo -e "${YELLOW}📋 Verificando versión de Node.js...${NC}"
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")

if [[ "$NODE_VERSION" == "not installed" ]]; then
    echo -e "${RED}❌ Node.js no está instalado.${NC}"
    echo -e "   Por favor, instala Node.js 20.x desde: https://nodejs.org/"
    exit 1
fi

# Extract major version number
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)

if [[ "$NODE_MAJOR" -lt 18 ]]; then
    echo -e "${RED}❌ Versión de Node.js incompatible: $NODE_VERSION${NC}"
    echo -e "   Se requiere Node.js 18.x o superior (recomendado: 20.x)"
    exit 1
elif [[ "$NODE_MAJOR" -lt 20 ]]; then
    echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION detectado. Recomendamos 20.x para mejor compatibilidad.${NC}"
else
    echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
fi

# Check npm version
echo -e "${YELLOW}📋 Verificando versión de npm...${NC}"
NPM_VERSION=$(npm -v 2>/dev/null || echo "not installed")
echo -e "${GREEN}✅ npm v$NPM_VERSION${NC}"
echo ""

# Step 1: Clean npm cache
echo -e "${YELLOW}🧹 Paso 1/4: Limpiando caché de npm...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ Caché limpiado${NC}"
echo ""

# Step 2: Remove node_modules
echo -e "${YELLOW}🗑️  Paso 2/4: Eliminando node_modules existente...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules eliminado${NC}"
else
    echo -e "${GREEN}✅ node_modules no existe, continuando...${NC}"
fi
echo ""

# Step 3: Remove package-lock if corrupted (optional, commented out)
# Uncomment the next lines ONLY if you need to regenerate package-lock.json
# echo -e "${YELLOW}🗑️  Eliminando package-lock.json...${NC}"
# rm -f package-lock.json

# Step 4: Clean install using npm ci
echo -e "${YELLOW}📦 Paso 3/4: Instalando dependencias con npm ci...${NC}"
echo -e "   (Esto respeta las versiones exactas de package-lock.json)"
npm ci
echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
echo ""

# Step 5: Clear Expo cache
echo -e "${YELLOW}🧹 Paso 4/4: Limpiando caché de Expo...${NC}"
npx expo start --clear --help > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Caché de Expo preparado${NC}"
echo ""

# Check for .env file
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📝 Configuración de Variables de Entorno${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No se encontró archivo .env${NC}"
    echo ""
    echo -e "   Crea un archivo ${GREEN}.env${NC} en la raíz del proyecto con:"
    echo ""
    echo -e "   ${BLUE}EXPO_PUBLIC_SUPABASE_URL=${NC}tu_url_de_supabase"
    echo -e "   ${BLUE}EXPO_PUBLIC_SUPABASE_ANON_KEY=${NC}tu_anon_key"
    echo ""
    echo -e "   Puedes copiar ${GREEN}.env.example${NC} como plantilla."
else
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 ¡Instalación completada!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Siguiente paso: Ejecuta la aplicación con:"
echo ""
echo -e "    ${BLUE}npx expo start -c${NC}"
echo ""
echo -e "  O para plataformas específicas:"
echo ""
echo -e "    ${BLUE}npx expo start --android${NC}  (Android)"
echo -e "    ${BLUE}npx expo start --ios${NC}      (iOS)"
echo -e "    ${BLUE}npx expo start --web${NC}      (Web)"
echo ""
