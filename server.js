// Backend API para ZarlippRN
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const mercadopago = require('mercadopago');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Mercado Pago
mercadopago.configure({
    access_token: config.mercadoPago.accessToken
});

// Pool de conexiones PostgreSQL
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.username,
    password: config.database.password,
    ssl: config.database.ssl
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'zarlipprn_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, userType = 'passenger' } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const result = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, user_type',
            [name, email, phone, passwordHash, userType]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            process.env.JWT_SECRET || 'zarlipprn_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.user_type
            },
            token
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const result = await pool.query(
            'SELECT id, name, email, password_hash, user_type FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            process.env.JWT_SECRET || 'zarlipprn_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.user_type
            },
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de usuarios
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const result = await pool.query(
            'SELECT id, name, email, phone, user_type, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de conductores
app.post('/api/drivers/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            licenseNumber, vehicleMake, vehicleModel, vehicleYear,
            vehicleColor, vehiclePlate, vehicleType, workScheduleStart, workScheduleEnd
        } = req.body;

        const result = await pool.query(
            `INSERT INTO driver_profiles 
             (user_id, license_number, vehicle_make, vehicle_model, vehicle_year, 
              vehicle_color, vehicle_plate, vehicle_type, work_schedule_start, work_schedule_end)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (user_id) DO UPDATE SET
             license_number = EXCLUDED.license_number,
             vehicle_make = EXCLUDED.vehicle_make,
             vehicle_model = EXCLUDED.vehicle_model,
             vehicle_year = EXCLUDED.vehicle_year,
             vehicle_color = EXCLUDED.vehicle_color,
             vehicle_plate = EXCLUDED.vehicle_plate,
             vehicle_type = EXCLUDED.vehicle_type,
             work_schedule_start = EXCLUDED.work_schedule_start,
             work_schedule_end = EXCLUDED.work_schedule_end,
             updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, licenseNumber, vehicleMake, vehicleModel, vehicleYear,
             vehicleColor, vehiclePlate, vehicleType, workScheduleStart, workScheduleEnd]
        );

        res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando perfil conductor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/drivers/available', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT dp.*, u.name, u.phone 
             FROM driver_profiles dp 
             JOIN users u ON dp.user_id = u.id 
             WHERE dp.is_available = true AND u.is_active = true`
        );

        res.json({ success: true, drivers: result.rows });
    } catch (error) {
        console.error('Error obteniendo conductores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de viajes
app.post('/api/trips/request', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            pickupAddress, pickupLatitude, pickupLongitude,
            destinationAddress, destinationLatitude, destinationLongitude
        } = req.body;

        const result = await pool.query(
            `INSERT INTO trips 
             (passenger_id, pickup_address, pickup_latitude, pickup_longitude,
              destination_address, destination_latitude, destination_longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [userId, pickupAddress, pickupLatitude, pickupLongitude,
             destinationAddress, destinationLatitude, destinationLongitude]
        );

        res.json({ success: true, trip: result.rows[0] });
    } catch (error) {
        console.error('Error solicitando viaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/trips/:id/accept', authenticateToken, async (req, res) => {
    try {
        const tripId = req.params.id;
        const driverId = req.user.userId;

        const result = await pool.query(
            `UPDATE trips 
             SET driver_id = $1, trip_status = 'accepted', accepted_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND trip_status = 'requested'
             RETURNING *`,
            [driverId, tripId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Viaje no encontrado o ya aceptado' });
        }

        res.json({ success: true, trip: result.rows[0] });
    } catch (error) {
        console.error('Error aceptando viaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de chat
app.get('/api/chat/:tripId', authenticateToken, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        
        const result = await pool.query(
            `SELECT cm.*, u.name as sender_name 
             FROM chat_messages cm 
             JOIN users u ON cm.sender_id = u.id 
             WHERE cm.trip_id = $1 
             ORDER BY cm.created_at ASC`,
            [tripId]
        );

        res.json({ success: true, messages: result.rows });
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/chat/send', authenticateToken, async (req, res) => {
    try {
        const { tripId, content, messageType = 'text' } = req.body;
        const senderId = req.user.userId;

        const result = await pool.query(
            `INSERT INTO chat_messages (trip_id, sender_id, content, message_type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [tripId, senderId, content, messageType]
        );

        res.json({ success: true, message: result.rows[0] });
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas de pagos
app.post('/api/payments/create', authenticateToken, async (req, res) => {
    try {
        const { tripId, amount } = req.body;
        const userId = req.user.userId;

        // Crear preferencia de Mercado Pago
        const preference = {
            items: [
                {
                    title: 'Viaje ZarlippRN',
                    quantity: 1,
                    unit_price: amount,
                    currency_id: 'ARS'
                }
            ],
            payer: {
                email: req.user.email
            },
            back_urls: {
                success: `${req.protocol}://${req.get('host')}/payment/success`,
                failure: `${req.protocol}://${req.get('host')}/payment/failure`,
                pending: `${req.protocol}://${req.get('host')}/payment/pending`
            },
            auto_return: 'approved'
        };

        const response = await mercadopago.preferences.create(preference);

        // Guardar información del pago en la base de datos
        await pool.query(
            `INSERT INTO payments (trip_id, user_id, amount, mercado_pago_id, payment_status)
             VALUES ($1, $2, $3, $4, 'pending')`,
            [tripId, userId, amount, response.body.id]
        );

        res.json({
            success: true,
            paymentUrl: response.body.init_point,
            paymentId: response.body.id
        });
    } catch (error) {
        console.error('Error creando pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor ZarlippRN ejecutándose en puerto ${port}`);
    console.log(`Desarrollado por: ${config.app.developer}`);
});

module.exports = app;
