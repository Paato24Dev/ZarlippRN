-- ========== SCRIPT SQL PARA ZARLIPPRN (SIMPLIFICADO) ==========
-- Base de datos: zarlipprn_db
-- Versión: 1.0
-- Fecha: 2024
-- Compatible con HeidiSQL y PostgreSQL

-- ========== ELIMINAR BASE DE DATOS EXISTENTE (SI EXISTE) ==========
DROP DATABASE IF EXISTS zarlipprn_db;

-- ========== CREAR BASE DE DATOS ==========
CREATE DATABASE zarlipprn_db;

-- ========== TABLA DE USUARIOS ==========
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro', 'no-decir')) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('cliente', 'chofer')) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- ========== TABLA DE CHOFERES (INFORMACIÓN ADICIONAL) ==========
CREATE TABLE choferes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    vehiculo_marca VARCHAR(50) NOT NULL,
    vehiculo_modelo VARCHAR(50) NOT NULL,
    vehiculo_patente VARCHAR(10) UNIQUE NOT NULL,
    vehiculo_color VARCHAR(30),
    vehiculo_ano INTEGER,
    licencia_numero VARCHAR(20) UNIQUE NOT NULL,
    licencia_vencimiento DATE NOT NULL,
    seguro_poliza VARCHAR(50),
    seguro_vencimiento DATE,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_viajes INTEGER DEFAULT 0,
    online BOOLEAN DEFAULT FALSE,
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índices para choferes
CREATE INDEX idx_choferes_usuario_id ON choferes(usuario_id);
CREATE INDEX idx_choferes_online ON choferes(online);
CREATE INDEX idx_choferes_rating ON choferes(rating_promedio);

-- ========== TABLA DE VIAJES ==========
CREATE TABLE viajes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    chofer_id INTEGER,
    tipo VARCHAR(20) CHECK (tipo IN ('pasajero', 'encomienda')) NOT NULL,
    origen_direccion TEXT NOT NULL,
    origen_lat DECIMAL(10, 8),
    origen_lng DECIMAL(11, 8),
    destino_direccion TEXT NOT NULL,
    destino_lat DECIMAL(10, 8),
    destino_lng DECIMAL(11, 8),
    distancia_km DECIMAL(8, 2),
    tiempo_estimado_min INTEGER,
    precio_base DECIMAL(10, 2),
    precio_final DECIMAL(10, 2),
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'asignado', 'en_camino', 'en_progreso', 'completado', 'cancelado')) DEFAULT 'pendiente',
    metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')) DEFAULT 'efectivo',
    observaciones TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP NULL,
    fecha_inicio TIMESTAMP NULL,
    fecha_fin TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id)
);

-- Crear índices para viajes
CREATE INDEX idx_viajes_cliente_id ON viajes(cliente_id);
CREATE INDEX idx_viajes_chofer_id ON viajes(chofer_id);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha_solicitud ON viajes(fecha_solicitud);
CREATE INDEX idx_viajes_tipo ON viajes(tipo);

-- ========== TABLA DE CALIFICACIONES ==========
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    viaje_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    chofer_id INTEGER NOT NULL,
    calificacion_cliente_a_chofer SMALLINT CHECK (calificacion_cliente_a_chofer >= 1 AND calificacion_cliente_a_chofer <= 5),
    calificacion_chofer_a_cliente SMALLINT CHECK (calificacion_chofer_a_cliente >= 1 AND calificacion_chofer_a_cliente <= 5),
    comentario_cliente TEXT,
    comentario_chofer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id),
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id)
);

-- Crear índices para calificaciones
CREATE INDEX idx_calificaciones_viaje_id ON calificaciones(viaje_id);
CREATE INDEX idx_calificaciones_cliente_id ON calificaciones(cliente_id);
CREATE INDEX idx_calificaciones_chofer_id ON calificaciones(chofer_id);

-- ========== TABLA DE MENSAJES DE SOPORTE ==========
CREATE TABLE mensajes_soporte (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('nuevo', 'en_proceso', 'resuelto', 'cerrado')) DEFAULT 'nuevo',
    respuesta TEXT,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Crear índices para mensajes_soporte
CREATE INDEX idx_mensajes_soporte_usuario_id ON mensajes_soporte(usuario_id);
CREATE INDEX idx_mensajes_soporte_estado ON mensajes_soporte(estado);
CREATE INDEX idx_mensajes_soporte_ticket_id ON mensajes_soporte(ticket_id);
CREATE INDEX idx_mensajes_soporte_created_at ON mensajes_soporte(created_at);

-- ========== TABLA DE NOTIFICACIONES ==========
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índices para notificaciones
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_created_at ON notificaciones(created_at);

-- ========== TABLA DE SESIONES ==========
CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Crear índices para sesiones
CREATE INDEX idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_expires_at ON sesiones(expires_at);

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

-- Mensaje de soporte de ejemplo
INSERT INTO mensajes_soporte (usuario_id, nombre, email, mensaje, estado, ticket_id) 
VALUES (1, 'Juan Pérez', 'cliente@test.com', 'Hola, tengo una consulta sobre las tarifas.', 'nuevo', 'TICKET-001');

-- ========== VISTAS ÚTILES ==========

-- Vista de usuarios con información completa
CREATE VIEW vista_usuarios_completos AS
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.apellido,
    u.telefono,
    u.genero,
    u.tipo,
    u.activo,
    u.email_verificado,
    u.created_at,
    CASE 
        WHEN u.tipo = 'chofer' THEN c.vehiculo_marca
        ELSE NULL 
    END as vehiculo_marca,
    CASE 
        WHEN u.tipo = 'chofer' THEN c.vehiculo_modelo
        ELSE NULL 
    END as vehiculo_modelo,
    CASE 
        WHEN u.tipo = 'chofer' THEN c.vehiculo_patente
        ELSE NULL 
    END as vehiculo_patente,
    CASE 
        WHEN u.tipo = 'chofer' THEN c.rating_promedio
        ELSE NULL 
    END as rating_promedio,
    CASE 
        WHEN u.tipo = 'chofer' THEN c.online
        ELSE NULL 
    END as online
FROM usuarios u
LEFT JOIN choferes c ON u.id = c.usuario_id;

-- Vista de viajes con información detallada
CREATE VIEW vista_viajes_detallados AS
SELECT 
    v.id,
    v.tipo,
    v.origen_direccion,
    v.destino_direccion,
    v.distancia_km,
    v.tiempo_estimado_min,
    v.precio_final,
    v.estado,
    v.metodo_pago,
    v.fecha_solicitud,
    v.fecha_fin,
    c.nombre as cliente_nombre,
    c.apellido as cliente_apellido,
    c.telefono as cliente_telefono,
    ch.nombre as chofer_nombre,
    ch.apellido as chofer_apellido,
    ch.telefono as chofer_telefono
FROM viajes v
JOIN usuarios c ON v.cliente_id = c.id
LEFT JOIN usuarios ch ON v.chofer_id = ch.id;

-- ========== ÍNDICES ADICIONALES PARA OPTIMIZACIÓN ==========

-- Índice compuesto para búsquedas de viajes por cliente y estado
CREATE INDEX idx_viajes_cliente_estado ON viajes(cliente_id, estado);

-- Índice compuesto para búsquedas de viajes por chofer y estado
CREATE INDEX idx_viajes_chofer_estado ON viajes(chofer_id, estado);

-- Índice para búsquedas por fecha
CREATE INDEX idx_viajes_fecha ON viajes(fecha_solicitud);

-- ========== CONFIGURACIÓN FINAL ==========

-- Mostrar información de la base de datos creada
SELECT 'Base de datos ZarlippRN creada exitosamente' as mensaje;
SELECT COUNT(*) as total_tablas FROM information_schema.tables WHERE table_schema = 'public';
SELECT table_name as tablas FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;