// =====================================================
// ZARLIPPRN - FUNCIONES DE BASE DE DATOS
// Desarrollado por PaatoDev
// =====================================================

// Configuración de la base de datos
const DB_CONFIG = {
    host: 'dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com',
    port: 5432,
    database: 'catrieltx',
    username: 'paatodev',
    password: '1LP2UNJouEUZKOWpXbVRQUcSMqH3m6PR',
    ssl: true
};

// URL de conexión para el backend
const API_BASE_URL = 'http://localhost:3000/api';

// Funciones para guardar en base de datos
class DatabaseManager {
    
    // Guardar usuario en BD
    static async saveUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password_hash: userData.password,
                    name: userData.name,
                    phone: userData.phone,
                    user_type: userData.userType
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Usuario guardado en BD:', result.user);
                return result.user;
            } else {
                console.error('Error guardando usuario:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Guardar perfil de conductor en BD
    static async saveDriverProfile(userId, driverInfo) {
        try {
            const response = await fetch(`${API_BASE_URL}/driver-profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    license_number: driverInfo.driverLicense,
                    vehicle_make: driverInfo.vehicleMake,
                    vehicle_model: driverInfo.vehicleModel,
                    vehicle_year: new Date().getFullYear(),
                    vehicle_color: driverInfo.vehicleColor,
                    vehicle_plate: driverInfo.vehiclePlate,
                    vehicle_type: driverInfo.vehicleType,
                    alias: driverInfo.alias
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Perfil de conductor guardado en BD:', result.profile);
                return result.profile;
            } else {
                console.error('Error guardando perfil de conductor:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Guardar valoración en BD
    static async saveRating(ratingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trip_id: ratingData.tripId || null,
                    rater_id: ratingData.raterId,
                    rated_id: ratingData.ratedId,
                    rating: ratingData.rating,
                    comment: ratingData.comment
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Valoración guardada en BD:', result.rating);
                return result.rating;
            } else {
                console.error('Error guardando valoración:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Guardar mensaje de chat en BD
    static async saveChatMessage(messageData) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trip_id: messageData.tripId || null,
                    sender_id: messageData.senderId,
                    message_type: messageData.messageType || 'text',
                    content: messageData.content
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Mensaje guardado en BD:', result.message);
                return result.message;
            } else {
                console.error('Error guardando mensaje:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Guardar viaje en BD
    static async saveTrip(tripData) {
        try {
            const response = await fetch(`${API_BASE_URL}/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    passenger_id: tripData.passengerId,
                    driver_id: tripData.driverId,
                    pickup_address: tripData.pickupAddress,
                    pickup_latitude: tripData.pickupLatitude,
                    pickup_longitude: tripData.pickupLongitude,
                    destination_address: tripData.destinationAddress,
                    destination_latitude: tripData.destinationLatitude,
                    destination_longitude: tripData.destinationLongitude,
                    fare_amount: tripData.fareAmount || 4000.00,
                    commission_amount: tripData.commissionAmount || 500.00,
                    driver_earnings: tripData.driverEarnings || 3500.00
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Viaje guardado en BD:', result.trip);
                return result.trip;
            } else {
                console.error('Error guardando viaje:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Obtener estadísticas del usuario
    static async getUserStats(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
            const result = await response.json();
            
            if (result.success) {
                return result.stats;
            } else {
                console.error('Error obteniendo estadísticas:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
    
    // Obtener historial de actividad del usuario
    static async getUserActivity(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/activity`);
            const result = await response.json();
            
            if (result.success) {
                return result.activity;
            } else {
                console.error('Error obteniendo actividad:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error de conexión con BD:', error);
            return null;
        }
    }
}

// Exportar para uso global
window.DatabaseManager = DatabaseManager;
