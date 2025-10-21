-- ZarlippRN Database Structure - Script Corregido
-- Base de datos para sistema de transporte tipo Uber/Taxi
-- Desarrollado por PaatoDev

-- =====================================================
-- PASO 1: ELIMINAR TABLAS EXISTENTES (si es necesario)
-- =====================================================

-- Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;

-- =====================================================
-- PASO 2: CREAR TABLAS DESDE CERO
-- =====================================================

-- Tabla de usuarios (pasajeros, conductores, admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de perfiles de conductores
CREATE TABLE driver_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(50),
    vehicle_plate VARCHAR(20),
    vehicle_type VARCHAR(50) DEFAULT 'sedan',
    is_available BOOLEAN DEFAULT false,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_trips INTEGER DEFAULT 0,
    work_schedule_start TIME,
    work_schedule_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de viajes
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    destination_address TEXT NOT NULL,
    destination_latitude DECIMAL(10, 8),
    destination_longitude DECIMAL(11, 8),
    trip_status VARCHAR(20) DEFAULT 'requested' CHECK (trip_status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
    fare_amount DECIMAL(10, 2) DEFAULT 4000.00,
    commission_amount DECIMAL(10, 2) DEFAULT 500.00,
    driver_earnings DECIMAL(10, 2) DEFAULT 3500.00,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT
);

-- Tabla de mensajes del chat
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'location', 'system')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de calificaciones
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    rater_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rated_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    payment_method VARCHAR(50),
    mercado_pago_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PASO 3: INSERTAR DATOS INICIALES
-- =====================================================

-- Insertar configuración inicial
INSERT INTO system_config (config_key, config_value, description) VALUES
('base_fare', '4000', 'Tarifa base por viaje'),
('commission_rate', '500', 'Comisión por viaje'),
('driver_earnings', '3500', 'Ganancias del conductor por viaje'),
('app_name', 'ZarlippRN', 'Nombre de la aplicación'),
('company_name', 'PaatoDev', 'Nombre de la empresa desarrolladora')
ON CONFLICT (config_key) DO NOTHING;

-- Crear usuario administrador maestro
INSERT INTO users (email, password_hash, name, user_type) VALUES
('paatodev@dev.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PaatoDev Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PASO 4: CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_available ON driver_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_trips_passenger ON trips(passenger_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(trip_status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_trip ON chat_messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_ratings_trip ON ratings(trip_id);
CREATE INDEX IF NOT EXISTS idx_payments_trip ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =====================================================
-- PASO 5: CREAR FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Verificar usuario admin
SELECT 'Usuario admin creado:' as status;
SELECT id, name, email, user_type FROM users WHERE email = 'paatodev@dev.com';

-- Verificar configuración
SELECT 'Configuración inicial:' as status;
SELECT config_key, config_value FROM system_config ORDER BY config_key;

-- Mensaje de éxito
SELECT '¡Base de datos ZarlippRN configurada correctamente!' as mensaje;
SELECT 'Desarrollado por: PaatoDev' as desarrollador;
