# ZarlippRN - Sistema de Transporte

Sistema de transporte tipo Uber/Taxi desarrollado por **PaatoDev**.

## 🚀 Características

- **Sistema de autenticación** completo (registro/login)
- **Mapa en tiempo real** con Google Maps
- **Chat en vivo** entre pasajeros y conductores
- **Sistema de pagos** integrado con Mercado Pago
- **Panel de administración** maestro
- **Información detallada** de conductores y vehículos
- **Sistema de calificaciones** y reviews
- **Notificaciones** en tiempo real

## 🛠️ Tecnologías Utilizadas

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Google Maps API
- Font Awesome Icons
- Diseño responsive

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- bcrypt para encriptación
- Mercado Pago SDK

## 📋 Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- PostgreSQL
- Cuenta de Google Maps API
- Cuenta de Mercado Pago

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd ZarlippRN
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos
```bash
# Conectar a PostgreSQL
psql -h dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com -U paatodev catrieltx

# Ejecutar el script de creación de tablas
\i database_schema.sql
```

### 4. Configurar variables de entorno
Crear archivo `.env`:
```env
JWT_SECRET=tu_jwt_secret_aqui
PORT=3000
NODE_ENV=development
```

### 5. Configurar Google Maps API
1. Obtener API Key de Google Maps
2. Reemplazar `YOUR_GOOGLE_MAPS_API_KEY` en `index.html`

### 6. Ejecutar la aplicación
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 🔧 Configuración

### Base de Datos
- **Host:** dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com
- **Puerto:** 5432
- **Base de datos:** catrieltx
- **Usuario:** paatodev
- **Contraseña:** 1LP2UNJouEUZKOWpXbVRQUcSMqH3m6PR

### Mercado Pago
- **Public Key:** APP_USR-03766435-8e82-4920-8514-2a696c52fb57
- **Access Token:** APP_USR-7672466710082923-102021-004dde191211b870d77e405947cc03c3-1527969500
- **Client ID:** 7672466710082923

### Cuenta Administrador
- **Email:** paatodev@dev.com
- **Contraseña:** ajsdbuahfbasijvnsv

## 📱 Uso de la Aplicación

### Para Pasajeros
1. **Registrarse/Iniciar sesión**
2. **Ver mapa** con taxis disponibles
3. **Solicitar viaje** con origen y destino
4. **Chat** con el conductor asignado
5. **Pagar** via Mercado Pago
6. **Calificar** el servicio

### Para Conductores
1. **Registrarse** como conductor
2. **Completar perfil** con información del vehículo
3. **Marcarse como disponible**
4. **Aceptar viajes** solicitados
5. **Actualizar ubicación** en tiempo real
6. **Comunicarse** con pasajeros

### Para Administradores
1. **Acceso completo** a todas las funcionalidades
2. **Gestión de usuarios** y conductores
3. **Monitoreo** de viajes y pagos
4. **Configuración** del sistema

## 💰 Sistema de Tarifas

- **Tarifa base:** $4,000 ARS por viaje
- **Comisión:** $500 ARS (para la empresa)
- **Ganancias conductor:** $3,500 ARS por viaje

## 🗺️ Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios (pasajeros, conductores, admin)
- `driver_profiles` - Perfiles de conductores
- `trips` - Viajes realizados
- `chat_messages` - Mensajes del chat
- `payments` - Pagos procesados
- `ratings` - Calificaciones
- `notifications` - Notificaciones
- `system_config` - Configuración del sistema

## 🔒 Seguridad

- **Autenticación JWT** para todas las rutas protegidas
- **Encriptación bcrypt** para contraseñas
- **Validación** de datos en frontend y backend
- **CORS** configurado para seguridad
- **SSL** en conexiones de base de datos

## 📞 Soporte

Para soporte técnico o consultas:
- **Desarrollador:** PaatoDev
- **Email:** paatodev@dev.com

## 📄 Licencia

Este proyecto está desarrollado por PaatoDev. Todos los derechos reservados.

---

**ZarlippRN** - Tu servicio de transporte confiable y seguro 🚗💨
