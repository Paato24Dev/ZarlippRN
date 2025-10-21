@echo off
echo 🚗 ZarlippRN - Instalación del Sistema de Transporte
echo Desarrollado por: PaatoDev
echo ==================================================

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 14 o superior.
    pause
    exit /b 1
)

echo ✅ Node.js detectado

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado.
    pause
    exit /b 1
)

echo ✅ npm detectado

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo de configuración .env...
    copy env.example .env
    echo ✅ Archivo .env creado. Por favor configura las variables necesarias.
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📋 Próximos pasos:
echo 1. Configura tu API Key de Google Maps en index.html
echo 2. Ejecuta el script de base de datos: database_schema.sql
echo 3. Configura las variables en .env si es necesario
echo 4. Ejecuta: npm run dev (modo desarrollo) o npm start (producción)
echo.
echo 🔗 URLs importantes:
echo - Aplicación: http://localhost:3000
echo - Base de datos: dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com
echo - Admin: paatodev@dev.com
echo.
echo 📞 Soporte: PaatoDev - paatodev@dev.com
echo 🚗 ¡ZarlippRN listo para usar!
pause
