// ========== JAVASCRIPT PARA PERFIL DE CLIENTE (cliente-perfil.html) ==========

// Elementos del DOM
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnMobile = document.getElementById('logout-btn-mobile');
const editProfileBtn = document.getElementById('edit-profile-btn');
const userName = document.getElementById('user-name');
const userFullName = document.getElementById('user-full-name');
const userAvatar = document.getElementById('user-avatar');
const userEmail = document.getElementById('user-email');
const userPhone = document.getElementById('user-phone');

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
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    showNotification('Sesión cerrada correctamente', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Carga los datos del usuario en la interfaz
 */
function loadUserData() {
    const user = getUserData();
    
    if (user) {
        // Actualizar nombre
        if (userName) {
            userName.textContent = user.nombre;
        }
        
        // Actualizar nombre completo
        if (userFullName) {
            userFullName.textContent = `${user.nombre} ${user.apellido}`;
        }
        
        // Actualizar avatar (primera letra del nombre)
        if (userAvatar) {
            userAvatar.textContent = user.nombre.charAt(0).toUpperCase();
        }
        
        // Actualizar email
        if (userEmail) {
            userEmail.textContent = user.email;
        }
        
        // Actualizar teléfono
        if (userPhone) {
            userPhone.textContent = user.telefono;
        }
    }
}

/**
 * Simula la carga de viajes del usuario
 */
async function loadUserTrips() {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En una aplicación real, esto vendría del servidor
    const trips = [
        // Ejemplo de viajes (comentado por ahora)
        // {
        //     id: 1,
        //     origen: 'Av. Argentina 123',
        //     destino: 'Leloir 450',
        //     fecha: '2024-01-15',
        //     precio: 3500,
        //     estado: 'completado'
        // }
    ];
    
    return trips;
}

/**
 * Muestra el historial de viajes
 */
function displayTrips(trips) {
    const tripsContainer = document.querySelector('.lg\\:col-span-2 section');
    
    if (trips.length === 0) {
        // Mantener el estado vacío que ya está en el HTML
        return;
    }
    
    // Crear lista de viajes
    const tripsHTML = trips.map(trip => `
        <div class="bg-gray-800 rounded-xl shadow-2xl p-6 mb-4">
            <div class="flex justify-between items-center mb-4">
                <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${trip.estado}
                </span>
                <span class="text-xl font-bold text-yellow-400">$${trip.precio}</span>
            </div>
            
            <div class="space-y-3">
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
            
            <div class="mt-4 text-sm text-gray-400">
                ${new Date(trip.fecha).toLocaleDateString('es-AR')}
            </div>
        </div>
    `).join('');
    
    // Reemplazar el contenido del estado vacío
    tripsContainer.innerHTML = `
        <h2 class="text-3xl font-bold text-white mb-6">Mi Actividad</h2>
        ${tripsHTML}
    `;
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

// Editar perfil
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        showNotification('Función de editar perfil próximamente', 'info');
    });
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
    
    // Verificar que sea un cliente
    const user = getUserData();
    if (user && user.type !== 'cliente') {
        showNotification('Esta página es solo para clientes', 'error');
        setTimeout(() => {
            if (user.type === 'chofer') {
                window.location.href = 'chofer-perfil.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
        return;
    }
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar viajes del usuario
    try {
        const trips = await loadUserTrips();
        displayTrips(trips);
    } catch (error) {
        console.error('Error al cargar viajes:', error);
        showNotification('Error al cargar el historial de viajes', 'error');
    }
});
