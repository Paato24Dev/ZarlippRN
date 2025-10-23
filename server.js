const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// ========== CONFIGURACIÓN DE BASE DE DATOS ==========
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zarlipprn_db',
    charset: 'utf8mb4'
};

let db;

// Función para conectar a la base de datos
async function connectDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos MySQL');
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        process.exit(1);
    }
}

// ========== MIDDLEWARE DE AUTENTICACIÓN ==========
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const [users] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [decoded.userId]);
        
        if (users.length === 0) {
            return res.status(403).json({ error: 'Usuario no encontrado' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// ========== RUTAS DE AUTENTICACIÓN ==========

// Registro de usuario
app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nombre').notEmpty().trim(),
    body('apellido').notEmpty().trim(),
    body('telefono').notEmpty().trim(),
    body('genero').isIn(['masculino', 'femenino', 'otro', 'no-decir']),
    body('type').isIn(['cliente', 'chofer'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, nombre, apellido, telefono, genero, type } = req.body;

        // Verificar si el email ya existe
        const [existingUsers] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Ya existe una cuenta con este email' });
        }

        // Hash de la contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const [result] = await db.execute(
            'INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, genero, tipo, email_verificado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, passwordHash, nombre, apellido, telefono, genero, type, true]
        );

        // Si es chofer, insertar información adicional
        if (type === 'chofer') {
            const { vehiculo_marca, vehiculo_modelo, vehiculo_patente, licencia_numero, licencia_vencimiento } = req.body;
            
            await db.execute(
                'INSERT INTO choferes (usuario_id, vehiculo_marca, vehiculo_modelo, vehiculo_patente, licencia_numero, licencia_vencimiento) VALUES (?, ?, ?, ?, ?, ?)',
                [result.insertId, vehiculo_marca, vehiculo_modelo, vehiculo_patente, licencia_numero, licencia_vencimiento]
            );
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: result.insertId, email, type },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: result.insertId,
                email,
                nombre,
                apellido,
                telefono,
                genero,
                type
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Inicio de sesión
app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: user.tipo },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Remover password_hash de la respuesta
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== RUTAS DE USUARIOS ==========

// Obtener perfil del usuario
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Obtener información del usuario
        const [users] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [userId]);
        const user = users[0];

        // Si es chofer, obtener información adicional
        let choferInfo = null;
        if (user.tipo === 'chofer') {
            const [choferes] = await db.execute('SELECT * FROM choferes WHERE usuario_id = ?', [userId]);
            choferInfo = choferes[0];
        }

        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            choferInfo
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar perfil del usuario
app.put('/api/users/profile', authenticateToken, [
    body('nombre').optional().notEmpty().trim(),
    body('apellido').optional().notEmpty().trim(),
    body('telefono').optional().notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const { nombre, apellido, telefono } = req.body;

        await db.execute(
            'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?',
            [nombre, apellido, telefono, userId]
        );

        res.json({ message: 'Perfil actualizado exitosamente' });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== RUTAS DE VIAJES ==========

// Crear nuevo viaje
app.post('/api/trips', authenticateToken, [
    body('tipo').isIn(['pasajero', 'encomienda']),
    body('origen_direccion').notEmpty().trim(),
    body('destino_direccion').notEmpty().trim(),
    body('precio_final').isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const clienteId = req.user.id;
        const { tipo, origen_direccion, destino_direccion, distancia_km, tiempo_estimado_min, precio_final, observaciones } = req.body;

        const [result] = await db.execute(
            'INSERT INTO viajes (cliente_id, tipo, origen_direccion, destino_direccion, distancia_km, tiempo_estimado_min, precio_final, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [clienteId, tipo, origen_direccion, destino_direccion, distancia_km, tiempo_estimado_min, precio_final, observaciones]
        );

        res.status(201).json({
            message: 'Viaje creado exitosamente',
            tripId: result.insertId
        });

    } catch (error) {
        console.error('Error creando viaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener viajes disponibles para choferes
app.get('/api/trips/available', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'chofer') {
            return res.status(403).json({ error: 'Solo los choferes pueden ver viajes disponibles' });
        }

        const [trips] = await db.execute(`
            SELECT v.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.telefono as cliente_telefono
            FROM viajes v
            JOIN usuarios u ON v.cliente_id = u.id
            WHERE v.estado = 'pendiente'
            ORDER BY v.fecha_solicitud ASC
        `);

        res.json({ trips });

    } catch (error) {
        console.error('Error obteniendo viajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Aceptar viaje
app.put('/api/trips/:id/accept', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'chofer') {
            return res.status(403).json({ error: 'Solo los choferes pueden aceptar viajes' });
        }

        const tripId = req.params.id;
        const choferId = req.user.id;

        // Verificar que el viaje esté disponible
        const [trips] = await db.execute('SELECT * FROM viajes WHERE id = ? AND estado = "pendiente"', [tripId]);
        
        if (trips.length === 0) {
            return res.status(404).json({ error: 'Viaje no encontrado o no disponible' });
        }

        // Actualizar viaje
        await db.execute(
            'UPDATE viajes SET chofer_id = ?, estado = "asignado", fecha_asignacion = NOW() WHERE id = ?',
            [choferId, tripId]
        );

        res.json({ message: 'Viaje aceptado exitosamente' });

    } catch (error) {
        console.error('Error aceptando viaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== RUTAS DE SOPORTE ==========

// Enviar mensaje de soporte
app.post('/api/support', [
    body('nombre').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('mensaje').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, mensaje } = req.body;
        const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await db.execute(
            'INSERT INTO mensajes_soporte (nombre, email, mensaje, ticket_id) VALUES (?, ?, ?, ?)',
            [nombre, email, mensaje, ticketId]
        );

        res.status(201).json({
            message: 'Mensaje enviado exitosamente',
            ticketId
        });

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ========== RUTAS ESTÁTICAS ==========

// Servir archivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/soporte', (req, res) => {
    res.sendFile(path.join(__dirname, 'soporte.html'));
});

// ========== MANEJO DE ERRORES ==========

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ========== INICIALIZACIÓN DEL SERVIDOR ==========

async function startServer() {
    await connectDB();

app.listen(PORT, () => {
        console.log(`🚀 Servidor ZarlippRN ejecutándose en puerto ${PORT}`);
        console.log(`📱 Accede a: http://localhost:${PORT}`);
        console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer().catch(console.error);

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando servidor...');
    if (db) {
        await db.end();
    }
        process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servidor...');
    if (db) {
        await db.end();
    }
        process.exit(0);
});
