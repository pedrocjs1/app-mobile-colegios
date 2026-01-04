# 🎓 Guía de Inicio Rápido para Colaboradores

Bienvenido al proyecto **White Label Edu App**. Esta guía te ayudará a configurar tu entorno de desarrollo y ejecutar la aplicación sin errores.

---

## 📋 Requisitos Previos

| Requisito | Versión Recomendada | Notas |
|-----------|---------------------|-------|
| **Node.js** | v20.x (LTS) | [Descargar](https://nodejs.org/) |
| **npm** | 10.x+ | Viene con Node.js |
| **Expo CLI** | Último | Se instala automáticamente |
| **Git** | Último | [Descargar](https://git-scm.com/) |

> **⚠️ Importante:** Usa exactamente Node.js 20.x para evitar conflictos de dependencias. Puedes verificar tu versión con `node -v`.

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd edu-app
```

### 2. Ejecutar el Script de Instalación

#### En Mac/Linux:
```bash
chmod +x INSTALL.sh
./INSTALL.sh
```

#### En Windows (PowerShell):
```powershell
# Si es la primera vez, habilita la ejecución de scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ejecutar el script:
.\INSTALL.ps1
```

> **Nota:** El script realiza:
> - Limpieza del caché de npm
> - Eliminación de `node_modules` existente
> - Instalación limpia con `npm ci` (respeta versiones exactas)

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
# Obtén estos valores desde: https://app.supabase.com/project/_/settings/api

EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**¿Dónde obtener los valores?**

1. Accede a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona el proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - `Project URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 4. Iniciar la Aplicación

```bash
npx expo start -c
```

El flag `-c` limpia el caché de bundler para evitar problemas.

---

## 🛠️ Solución de Problemas Comunes

### Error ERESOLVE (Conflicto de Dependencias)

```
npm ERR! ERESOLVE could not resolve
npm ERR! peer react@"^18.0.0" from some-package
```

**Solución:**
```bash
# 1. Borrar todo y reinstalar limpiamente
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. O usar el script de instalación que hace esto automáticamente
./INSTALL.sh  # Mac/Linux
.\INSTALL.ps1 # Windows
```

### Error de Versión de Node.js

```
error: The engine "node" is incompatible
```

**Solución:**
Instala Node.js 20.x desde [nodejs.org](https://nodejs.org/) o usa [nvm](https://github.com/nvm-sh/nvm):

```bash
# Usando nvm (Mac/Linux)
nvm install 20
nvm use 20

# Usando nvm-windows (Windows)
nvm install 20.19.0
nvm use 20.19.0
```

### Error: "Cannot find module"

**Solución:**
```bash
# Reinstalar node_modules completamente
rm -rf node_modules
npm ci

# Si persiste, limpiar caché de Metro
npx expo start -c
```

### Error de Supabase "Missing environment variables"

Verifica que:
1. Exista el archivo `.env` en la raíz del proyecto
2. Las variables tengan el prefijo `EXPO_PUBLIC_`
3. Reinicies el servidor de desarrollo después de crear/modificar `.env`

---

## 📂 Estructura del Proyecto

```
edu-app/
├── app/                    # Rutas (Expo Router)
│   ├── (dashboard)/        # Pantallas del dashboard
│   │   ├── rector/         # Panel del rector
│   │   ├── teacher/        # Panel del profesor
│   │   └── tutor/          # Panel del tutor
│   └── index.tsx           # Pantalla de login
├── components/             # Componentes reutilizables
├── services/               # Servicios (Supabase, Auth)
│   ├── supabaseClient.ts   # Cliente de Supabase
│   ├── authService.ts      # Autenticación
│   └── databaseService.ts  # Operaciones de BD
├── store/                  # Estado global (Zustand)
├── hooks/                  # Hooks personalizados
├── constants/              # Constantes y temas
└── types/                  # Tipos TypeScript
```

---

## 📱 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npx expo start -c` | Iniciar con caché limpio |
| `npx expo start --android` | Iniciar en Android |
| `npx expo start --ios` | Iniciar en iOS |
| `npx expo start --web` | Iniciar en navegador |
| `npx expo install --check` | Verificar compatibilidad de deps |
| `npm run lint` | Ejecutar linter (si está configurado) |

---

## 🔧 Stack Tecnológico

- **Framework:** React Native + Expo SDK 54
- **Navegación:** Expo Router
- **Estilos:** NativeWind (TailwindCSS para RN)
- **Estado:** Zustand
- **Fetch/Cache:** TanStack Query
- **Backend:** Supabase
- **Iconos:** Lucide React Native

---

## ❓ ¿Necesitas Ayuda?

Si encuentras algún problema no documentado aquí, contacta al equipo de desarrollo con:

1. Versión de Node.js (`node -v`)
2. Versión de npm (`npm -v`)
3. Sistema operativo
4. Mensaje de error completo
