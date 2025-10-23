// ========== JAVASCRIPT PARA PERFIL DE CHOFER (chofer-perfil.html) ==========

// Elementos del DOM
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnMobile = document.getElementById('logout-btn-mobile');
const statusToggle = document.getElementById('status-toggle');
const statusLabel = document.getElementById('status-label');
const driverName = document.getElementById('driver-name');
const driverFullName = document.getElementById('driver-full-name');
const driverAvatar = document.getElementById('driver-avatar');
const tripsContainer = document.getElementById('trips-container');

// Variables de estado
let isOnline = false;
let availableTrips = [];

// ========== FUNCIONES DE UTILIDAD ==========

/**
 * Muestra una notificación en pantalla
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Verifica si el usuario está logueado
 */
function isUserLoggedIn() {
    return localStorage.getItem('user') !== null && localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Obtiene los datos del usuario logueado
 */
function getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Cierra la sesión del usuario
 */
function logout() {
    // Si está online, desconectar primero
    if (isOnline) {
        toggleStatus();
    }
    
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    showNotification('Sesión cerrada correctamente', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Carga los datos del chofer en la interfaz
 */
function loadDriverData() {
    const user = getUserData();
    
    if (user) {
        // Actualizar nombre
        if (driverName) {
            driverName.textContent = user.nombre;
        }
        
        // Actualizar nombre completo
        if (driverFullName) {
            driverFullName.textContent = `${user.nombre} ${user.apellido}`;
        }
        
        // Actualizar avatar (primera letra del nombre)
        if (driverAvatar) {
            driverAvatar.textContent = user.nombre.charAt(0).toUpperCase();
        }
    }
}

/**
 * Simula la carga de viajes disponibles
 */
async function loadAvailableTrips() {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Datos de ejemplo de viajes disponibles
    const trips = [
        {
            id: 1,
            tipo: 'pasajero',
            origen: 'Av. Argentina 123, Neuquén',
            destino: 'Leloir 450 (Oficinas), Neuquén',
            precio: 3500,
            tiempoEstimado: '3 min'
        },
        {
            id: 2,
            tipo: 'encomienda',
            origen: 'San Martín 800 (Local Ropa), Neuquén',
            destino: 'Barrio Gregorio Alvarez (Casa), Neuquén',
            precio: 2800,
            tiempoEstimado: '8 min'
        }
    ];
    
    return trips;
}

/**
 * Muestra los viajes disponibles
 */
function displayTrips(trips) {
    if (!tripsContainer) return;
    
    if (trips.length === 0) {
        tripsContainer.innerHTML = `
            <div class="bg-gray-800 rounded-xl shadow-2xl p-10 text-center">
                <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-yellow-400 mx-auto mb-6">
                    <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-3">
                    No hay viajes disponibles
                </h3>
                <p class="text-gray-400 max-w-sm mx-auto">
                    Estás conectado. Te notificaremos en cuanto entre un nuevo pedido de viaje.
                </p>
            </div>
        `;
        return;
    }
    
    const tripsHTML = trips.map(trip => `
        <div class="bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-yellow-400/20 hover:ring-2 hover:ring-yellow-400/50">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <span class="bg-${trip.tipo === 'pasajero' ? 'blue' : 'purple'}-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ${trip.tipo === 'pasajero' ? 'Viaje de Pasajero' : 'Encomienda'}
                    </span>
                    <span class="text-2xl font-bold text-yellow-400">~$${trip.precio}</span>
                </div>
                
                <div class="space-y-3 mb-5">
                    <div class="flex items-center text-gray-300">
                        <svg class="w-5 h-5 mr-3 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0 2a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" clip-rule="evenodd" />
                            <path d="M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                        </svg>
                        <span>${trip.origen}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <svg class="w-5 h-5 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.1.4-.223.615-.372A10.461 10.461 0 0 0 14 15.125V14.5a4.5 4.5 0 0 0-4.5-4.5h-1A4.5 4.5 0 0 0 4 14.5v.625c0 .653.09 1.285.266 1.909.176.624.4 1.22.68 1.772.18.36.388.702.615.996.14.18.29.348.45.5a5.741 5.741 0 0 0 .281.246l.018.01.006.002Z" clip-rule="evenodd" />
                            <path d="M10 12a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
                        </svg>
                        <span>${trip.destino}</span>
                    </div>
                </div>
            </div>
            <div class="bg-gray-700/50 p-4 flex gap-4">
                <button class="w-1/2 bg-gray-600 text-gray-300 font-bold py-3 rounded-lg transform transition-all duration-200 hover:bg-gray-500 hover:text-white" onclick="ignoreTrip(${trip.id})">
                    Ignorar
                </button>
                <button class="w-1/2 bg-yellow-400 text-black font-bold py-3 rounded-lg transform transition-all duration-200 hover:bg-yellow-300 hover:scale-105 shadow-lg hover:shadow-yellow-400/50" onclick="acceptTrip(${trip.id})">
                    Aceptar Viaje (${trip.tiempoEstimado})
                </button>
            </div>
        </div>
    `).join('');
    
    tripsContainer.innerHTML = tripsHTML;
}

/**
 * Cambia el estado de conexión del chofer
 */
function toggleStatus() {
    isOnline = !isOnline;
    
    if (statusLabel) {
        if (isOnline) {
            statusLabel.textContent = 'Conectado';
            statusLabel.classList.remove('text-gray-400');
            statusLabel.classList.add('text-yellow-400');
            showNotification('Te has conectado. Ahora recibirás viajes disponibles.', 'success');
            
            // Cargar viajes disponibles
            loadAndDisplayTrips();
        } else {
            statusLabel.textContent = 'Desconectado';
            statusLabel.classList.remove('text-yellow-400');
            statusLabel.classList.add('text-gray-400');
            showNotification('Te has desconectado. No recibirás más viajes.', 'info');
            
            // Limpiar viajes
            availableTrips = [];
            displayTrips([]);
        }
    }
}

/**
 * Carga y muestra los viajes disponibles
 */
async function loadAndDisplayTrips() {
    if (!isOnline) return;
    
    try {
        const trips = await loadAvailableTrips();
        availableTrips = trips;
        displayTrips(trips);
    } catch (error) {
        console.error('Error al cargar viajes:', error);
        showNotification('Error al cargar viajes disponibles', 'error');
    }
}

/**
 * Ignora un viaje
 */
function ignoreTrip(tripId) {
    availableTrips = availableTrips.filter(trip => trip.id !== tripId);
    displayTrips(availableTrips);
    showNotification('Viaje ignorado', 'info');
}

/**
 * Acepta un viaje
 */
function acceptTrip(tripId) {
    const trip = availableTrips.find(t => t.id === tripId);
    if (trip) {
        showNotification(`Viaje aceptado: ${trip.origen} → ${trip.destino}`, 'success');
        // En una aplicación real, aquí se notificaría al servidor
        ignoreTrip(tripId);
    }
}

// ========== MANEJO DE EVENTOS ==========

// Menú móvil
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener('click', logout);
}

// Toggle de estado
if (statusToggle) {
    statusToggle.addEventListener('change', toggleStatus);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    if (!isUserLoggedIn()) {
        showNotification('Debes iniciar sesión para acceder a esta página', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Verificar que sea un chofer
    const user = getUserData();
    if (user && user.type !== 'chofer') {
        showNotification('Esta página es solo para choferes', 'error');
        setTimeout(() => {
            if (user.type === 'cliente') {
                window.location.href = 'cliente-perfil.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
        return;
    }
    
    // Cargar datos del chofer
    loadDriverData();
    
    // Inicializar estado como desconectado
    isOnline = false;
    if (statusToggle) {
        statusToggle.checked = false;
    }
});
