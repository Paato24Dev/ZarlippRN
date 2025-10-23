# ZarlippRN - Servicio de Taxis y Encomiendas

## Descripción
ZarlippRN es una aplicación web moderna para el servicio de taxis y encomiendas en Neuquén, Argentina. Permite a los usuarios solicitar viajes y enviar paquetes de forma rápida y segura.

## Características Principales

### Para Clientes
- Registro e inicio de sesión
- Solicitud de viajes de pasajeros
- Envío de encomiendas
- Seguimiento de viajes en tiempo real
- Historial de viajes
- Sistema de calificaciones
- Centro de soporte

### Para Choferes
- Panel de control para choferes
- Recepción de solicitudes de viaje
- Gestión de estado (online/offline)
- Historial de viajes completados
- Sistema de calificaciones
- Información del vehículo

### Funcionalidades Técnicas
- Interfaz responsive con Tailwind CSS
- API de análisis de rutas con Gemini AI
- Base de datos MySQL con estructura completa
- Autenticación segura con JWT
- Notificaciones en tiempo real
- Sistema de soporte integrado

## Estructura del Proyecto

```
zarlipprn/
├── css/
│   └── styles.css          # Estilos globales
├── js/
│   ├── index.js            # Página principal
│   ├── login.js            # Inicio de sesión
│   ├── forgot-password.js  # Recuperación de contraseña
│   ├── registro.js         # Registro de usuarios
│   ├── cliente-perfil.js   # Panel de cliente
│   ├── chofer-perfil.js    # Panel de chofer
│   └── soporte.js          # Centro de soporte
├── database/
│   ├── zarlipprn_database.sql  # Script completo de BD
│   ├── reset_database.sql      # Script para reiniciar BD
│   └── drop_database.sql       # Script para eliminar BD
├── index.html              # Página principal
├── login.html              # Inicio de sesión
├── forgot-password.html     # Recuperación de contraseña
├── registro.html           # Registro de usuarios
├── cliente-perfil.html     # Panel de cliente
├── chofer-perfil.html      # Panel de chofer
├── soporte.html            # Centro de soporte
├── package.json            # Configuración del proyecto
├── server.js               # Servidor backend
└── README.md               # Este archivo
```

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/zarlipprn/zarlipprn.git
   cd zarlipprn
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   # Crear la base de datos
   mysql -u root -p < database/zarlipprn_database.sql
   
   # O reiniciar con datos de prueba
   mysql -u root -p < database/reset_database.sql
   ```

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta las pruebas
- `npm run setup-db` - Configura la base de datos
- `npm run reset-db` - Reinicia la base de datos con datos de prueba
- `npm run drop-db` - Elimina la base de datos

## Base de Datos

### Tablas Principales
- `usuarios` - Información de usuarios (clientes y choferes)
- `choferes` - Información adicional de choferes
- `viajes` - Registro de todos los viajes
- `calificaciones` - Sistema de calificaciones mutuas
- `mensajes_soporte` - Centro de soporte
- `notificaciones` - Sistema de notificaciones
- `sesiones` - Gestión de sesiones de usuario

### Datos de Prueba
El sistema incluye usuarios de prueba:
- **Cliente**: cliente@test.com / contraseña: 123456
- **Chofer**: chofer@test.com / contraseña: 123456

## Tecnologías Utilizadas

### Frontend
- HTML5 semántico
- CSS3 con Tailwind CSS
- JavaScript ES6+
- Font Inter de Google Fonts

### Backend
- Node.js con Express.js
- MySQL con mysql2
- Autenticación JWT
- Socket.io para tiempo real
- Bcrypt para hash de contraseñas

### Herramientas de Desarrollo
- Nodemon para desarrollo
- Jest para testing
- ESLint para linting
- Git para control de versiones

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/trips` - Obtener historial de viajes

### Viajes
- `POST /api/trips` - Crear nuevo viaje
- `GET /api/trips/available` - Obtener viajes disponibles
- `PUT /api/trips/:id/accept` - Aceptar viaje
- `PUT /api/trips/:id/complete` - Completar viaje

### Soporte
- `POST /api/support` - Enviar mensaje de soporte
- `GET /api/support/tickets` - Obtener tickets de soporte

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

- **Email**: contacto@zarlipprn.com
- **Sitio Web**: https://zarlipprn.com
- **GitHub**: https://github.com/zarlipprn/zarlipprn

## Changelog

### v1.0.0 (2024-01-XX)
- Lanzamiento inicial
- Sistema completo de usuarios y autenticación
- Panel de cliente y chofer
- Sistema de viajes y encomiendas
- Centro de soporte
- Integración con Gemini AI para análisis de rutas
- Base de datos MySQL completa
