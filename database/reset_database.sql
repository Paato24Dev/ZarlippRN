-- ========== SCRIPT PARA REINICIAR BASE DE DATOS ZARLIPPRN ==========
-- Este script elimina y recrea la base de datos con datos de prueba
-- Útil para desarrollo y testing

-- ========== ELIMINAR BASE DE DATOS EXISTENTE ==========
DROP DATABASE IF EXISTS zarlipprn_db;

-- ========== CREAR BASE DE DATOS NUEVA ==========
CREATE DATABASE zarlipprn_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- ========== USAR LA BASE DE DATOS ==========
USE zarlipprn_db;

-- ========== TABLA DE USUARIOS ==========
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero ENUM('masculino', 'femenino', 'otro', 'no-decir') NOT NULL,
    tipo ENUM('cliente', 'chofer') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo)
);

-- ========== TABLA DE CHOFERES ==========
CREATE TABLE choferes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    vehiculo_marca VARCHAR(50) NOT NULL,
    vehiculo_modelo VARCHAR(50) NOT NULL,
    vehiculo_patente VARCHAR(10) UNIQUE NOT NULL,
    vehiculo_color VARCHAR(30),
    vehiculo_ano YEAR,
    licencia_numero VARCHAR(20) UNIQUE NOT NULL,
    licencia_vencimiento DATE NOT NULL,
    seguro_poliza VARCHAR(50),
    seguro_vencimiento DATE,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_viajes INT DEFAULT 0,
    online BOOLEAN DEFAULT FALSE,
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_online (online),
    INDEX idx_rating (rating_promedio)
);

-- ========== TABLA DE VIAJES ==========
CREATE TABLE viajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    chofer_id INT,
    tipo ENUM('pasajero', 'encomienda') NOT NULL,
    origen_direccion TEXT NOT NULL,
    origen_lat DECIMAL(10, 8),
    origen_lng DECIMAL(11, 8),
    destino_direccion TEXT NOT NULL,
    destino_lat DECIMAL(10, 8),
    destino_lng DECIMAL(11, 8),
    distancia_km DECIMAL(8, 2),
    tiempo_estimado_min INT,
    precio_base DECIMAL(10, 2),
    precio_final DECIMAL(10, 2),
    estado ENUM('pendiente', 'asignado', 'en_camino', 'en_progreso', 'completado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
    observaciones TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP NULL,
    fecha_inicio TIMESTAMP NULL,
    fecha_fin TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id),
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_chofer_id (chofer_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_solicitud (fecha_solicitud),
    INDEX idx_tipo (tipo)
);

-- ========== TABLA DE CALIFICACIONES ==========
CREATE TABLE calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viaje_id INT NOT NULL,
    cliente_id INT NOT NULL,
    chofer_id INT NOT NULL,
    calificacion_cliente_a_chofer TINYINT CHECK (calificacion_cliente_a_chofer >= 1 AND calificacion_cliente_a_chofer <= 5),
    calificacion_chofer_a_cliente TINYINT CHECK (calificacion_chofer_a_cliente >= 1 AND calificacion_chofer_a_cliente <= 5),
    comentario_cliente TEXT,
    comentario_chofer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id),
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id),
    INDEX idx_viaje_id (viaje_id),
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_chofer_id (chofer_id)
);

-- ========== TABLA DE MENSAJES DE SOPORTE ==========
CREATE TABLE mensajes_soporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    estado ENUM('nuevo', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'nuevo',
    respuesta TEXT,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_created_at (created_at)
);

-- ========== INSERTAR DATOS DE PRUEBA ==========

-- Usuario cliente de prueba
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, genero, tipo, email_verificado) 
VALUES ('cliente@test.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Juan', 'Pérez', '+54 299 123 4567', 'masculino', 'cliente', TRUE);

-- Usuario chofer de prueba
INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, genero, tipo, email_verificado) 
VALUES ('chofer@test.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'María', 'González', '+54 299 987 6543', 'femenino', 'chofer', TRUE);

-- Información adicional del chofer
INSERT INTO choferes (usuario_id, vehiculo_marca, vehiculo_modelo, vehiculo_patente, vehiculo_color, vehiculo_ano, licencia_numero, licencia_vencimiento, seguro_poliza, seguro_vencimiento, rating_promedio, total_viajes, online) 
VALUES (2, 'Renault', 'Logan', 'AB 123 CD', 'Blanco', 2020, 'LIC123456', '2025-12-31', 'POL789012', '2024-12-31', 4.9, 150, FALSE);

-- Viajes de ejemplo
INSERT INTO viajes (cliente_id, chofer_id, tipo, origen_direccion, destino_direccion, distancia_km, tiempo_estimado_min, precio_final, estado, metodo_pago, fecha_solicitud, fecha_fin) 
VALUES 
(1, 2, 'pasajero', 'Av. Argentina 123, Neuquén', 'Leloir 450, Neuquén', 5.2, 15, 3500, 'completado', 'efectivo', '2024-01-15 10:30:00', '2024-01-15 10:45:00'),
(1, 2, 'encomienda', 'San Martín 800, Neuquén', 'Barrio Gregorio Alvarez, Neuquén', 8.5, 25, 2800, 'completado', 'efectivo', '2024-01-16 14:20:00', '2024-01-16 14:45:00');

-- Calificaciones de ejemplo
INSERT INTO calificaciones (viaje_id, cliente_id, chofer_id, calificacion_cliente_a_chofer, calificacion_chofer_a_cliente, comentario_cliente, comentario_chofer) 
VALUES 
(1, 1, 2, 5, 5, 'Excelente servicio, muy puntual', 'Cliente muy amable'),
(2, 1, 2, 4, 5, 'Buen servicio, llegó a tiempo', 'Todo perfecto');

-- Mensaje de soporte de ejemplo
INSERT INTO mensajes_soporte (usuario_id, nombre, email, mensaje, estado, ticket_id) 
VALUES (1, 'Juan Pérez', 'cliente@test.com', 'Hola, tengo una consulta sobre las tarifas.', 'nuevo', 'TICKET-001');

-- ========== CONFIRMACIÓN ==========
SELECT 'Base de datos ZarlippRN reiniciada con datos de prueba' as mensaje;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_choferes FROM choferes;
SELECT COUNT(*) as total_viajes FROM viajes;
SELECT COUNT(*) as total_mensajes_soporte FROM mensajes_soporte;
