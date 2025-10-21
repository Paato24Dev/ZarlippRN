#!/bin/bash

# Script de instalación para ZarlippRN
# Desarrollado por PaatoDev

echo "🚗 ZarlippRN - Instalación del Sistema de Transporte"
echo "Desarrollado por: PaatoDev"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 14 o superior."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Se requiere Node.js versión 14 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✅ npm $(npm -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo de configuración .env..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor configura las variables necesarias."
else
    echo "✅ Archivo .env ya existe"
fi

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client detectado"
    echo "💡 Para configurar la base de datos, ejecuta:"
    echo "   psql -h dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com -U paatodev catrieltx"
    echo "   \\i database_schema.sql"
else
    echo "⚠️  PostgreSQL client no detectado. Instala psql para configurar la base de datos."
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu API Key de Google Maps en index.html"
echo "2. Ejecuta el script de base de datos: database_schema.sql"
echo "3. Configura las variables en .env si es necesario"
echo "4. Ejecuta: npm run dev (modo desarrollo) o npm start (producción)"
echo ""
echo "🔗 URLs importantes:"
echo "- Aplicación: http://localhost:3000"
echo "- Base de datos: dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com"
echo "- Admin: paatodev@dev.com"
echo ""
echo "📞 Soporte: PaatoDev - paatodev@dev.com"
echo "🚗 ¡ZarlippRN listo para usar!"
