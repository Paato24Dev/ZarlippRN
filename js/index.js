// ========== JAVASCRIPT PARA PÁGINA PRINCIPAL (index.html) ==========

// Elementos del DOM
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const fromInput = document.getElementById('desde');
const toInput = document.getElementById('hasta');
const pedidoForm = document.getElementById('pedido-form');

// ========== MENÚ MÓVIL ==========
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        if (!document.getElementById('mobile-overlay')) {
            createMobileOverlay();
        } else {
            document.getElementById('mobile-overlay').classList.toggle('show');
        }
    });
}

// Crear overlay si no existe
function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        mobileMenu.classList.remove('show');
        overlay.classList.remove('show');
    });
}

// ========== GEOLOCALIZACIÓN Y MAPAS ==========

// Variables globales para geolocalización
let userLocation = null;
let mapInstance = null;

// Función para obtener la ubicación actual del usuario
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                resolve(userLocation);
            },
            (error) => {
                console.warn('Error obteniendo ubicación:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}

// Función para autocompletar direcciones (simulada)
function autocompleteAddress(input, callback) {
    const addresses = [
        'Centro de Neuquén',
        'Barrio Norte, Neuquén',
        'Barrio Sur, Neuquén',
        'Zona Oeste, Neuquén',
        'Zona Este, Neuquén',
        'Catriel, Río Negro',
        'Centenario, Neuquén',
        'Plottier, Neuquén',
        'Cipolletti, Río Negro',
        'Villa Regina, Río Negro',
        'Aeropuerto Internacional de Neuquén',
        'Terminal de Ómnibus de Neuquén',
        'Hospital Castro Rendón',
        'Universidad Nacional del Comahue',
        'Mall Plaza Norte',
        'Hiper Libertad',
        'Supermercado La Anónima',
        'Farmacia Dr. Ahorro',
        'Banco Nación',
        'Banco Santander'
    ];

    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) return;

        const matches = addresses.filter(addr => 
            addr.toLowerCase().includes(value)
        ).slice(0, 5);

        showAutocompleteSuggestions(input, matches, callback);
    });
}

// Mostrar sugerencias de autocompletado
function showAutocompleteSuggestions(input, suggestions, callback) {
    // Remover sugerencias anteriores
    const existingSuggestions = document.getElementById('address-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }

    if (suggestions.length === 0) return;

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'address-suggestions';
    suggestionsContainer.className = 'address-suggestions';
    
    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;
        
        suggestionItem.addEventListener('click', () => {
            input.value = suggestion;
            suggestionsContainer.remove();
            if (callback) callback(suggestion);
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });

    // Posicionar las sugerencias debajo del input
    const inputRect = input.getBoundingClientRect();
    suggestionsContainer.style.cssText = `
        position: absolute;
        top: ${inputRect.bottom + window.scrollY + 5}px;
        left: ${inputRect.left + window.scrollX}px;
        width: ${inputRect.width}px;
        background: var(--primary-black);
        border: 2px solid var(--primary-yellow);
        border-radius: 10px;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        box-shadow: var(--shadow-lg);
    `;

    document.body.appendChild(suggestionsContainer);

    // Cerrar sugerencias al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeSuggestions(e) {
            if (!suggestionsContainer.contains(e.target) && e.target !== input) {
                suggestionsContainer.remove();
                document.removeEventListener('click', closeSuggestions);
            }
        });
    }, 100);
}

// Función para calcular distancia entre dos puntos
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Función para estimar precio basado en distancia
function estimatePrice(distance) {
    const basePrice = 4000;
    const pricePerKm = 800;
    
    if (distance <= 5) return basePrice;
    if (distance <= 10) return basePrice + (distance - 5) * pricePerKm;
    return basePrice + (distance - 5) * pricePerKm * 1.4; // 40% más para distancias largas
}

// ========== FUNCIÓN PARA SCROLL AL FORMULARIO ==========
function scrollToOrderForm(type = 'ride') {
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Si es para encomienda, cambiar el placeholder del destino
        if (type === 'package') {
            const hastaInput = document.getElementById('hasta');
            if (hastaInput) {
                hastaInput.placeholder = 'Dirección de destino del paquete';
            }
        }
        
        // Enfocar el primer input después del scroll
        setTimeout(() => {
            const desdeInput = document.getElementById('desde');
            if (desdeInput) {
                desdeInput.focus();
            }
        }, 500);
    }
}

// Hacer la función global
window.scrollToOrderForm = scrollToOrderForm;

// ========== FUNCIONES DE UTILIDAD ==========

/**
 * Muestra una notificación en pantalla
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
        z-index: 10000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Valida si el usuario está logueado
 */
function isUserLoggedIn() {
    return localStorage.getItem('user') !== null;
}

/**
 * Redirige al usuario según su tipo
 */
function redirectUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        if (user.type === 'cliente') {
            window.location.href = 'cliente-perfil.html';
        } else if (user.type === 'chofer') {
            window.location.href = 'chofer-perfil.html';
        }
    }
}

// ========== MANEJO DEL FORMULARIO DE PEDIDO ==========
if (pedidoForm) {
    pedidoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!isUserLoggedIn()) {
            showNotification('Debes iniciar sesión para pedir un viaje', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        const desde = fromInput.value.trim();
        const hasta = toInput.value.trim();
        
        if (!desde || !hasta) {
            showNotification('Por favor completa ambos campos', 'error');
            return;
        }
        
        // Simular pedido de viaje
        showNotification('Pedido enviado correctamente', 'success');
        
        // Mostrar modal de pagos
        const tripData = {
            from: desde,
            to: hasta,
            price: estimatePrice(Math.random() * 15 + 2), // Precio estimado
            distance: Math.random() * 15 + 2
        };
        
        setTimeout(() => {
            window.paymentSystem.showPaymentModal(tripData);
        }, 1000);
        
        // Limpiar formulario
        fromInput.value = '';
        toInput.value = '';
        
        // Redirigir al perfil del usuario después del pago
        // setTimeout(() => {
        //     redirectUser();
        // }, 1500);
    });
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ya está logueado
    if (isUserLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Usuario logueado:', user);
    }

    // ========== INICIALIZAR GEOLOCALIZACIÓN Y AUTCOMPLETADO ==========
    const desdeInput = document.getElementById('desde');
    const hastaInput = document.getElementById('hasta');
    const locationBtn = document.getElementById('location-btn');

    // Configurar autocompletado para ambos inputs
    if (desdeInput) {
        autocompleteAddress(desdeInput, (selectedAddress) => {
            console.log('Dirección origen seleccionada:', selectedAddress);
        });
    }

    if (hastaInput) {
        autocompleteAddress(hastaInput, (selectedAddress) => {
            console.log('Dirección destino seleccionada:', selectedAddress);
            // Calcular precio estimado si tenemos ambas direcciones
            estimateTripPrice();
        });
    }

    // Configurar botón de geolocalización
    if (locationBtn && desdeInput) {
        locationBtn.addEventListener('click', async () => {
            locationBtn.classList.add('loading');
            locationBtn.disabled = true;

            try {
                const location = await getUserLocation();
                desdeInput.value = 'Mi ubicación actual';
                desdeInput.dataset.lat = location.lat;
                desdeInput.dataset.lng = location.lng;
                
                showNotification('Ubicación obtenida correctamente', 'success');
                estimateTripPrice();
            } catch (error) {
                console.error('Error obteniendo ubicación:', error);
                showNotification('No se pudo obtener tu ubicación. Por favor, ingrésala manualmente.', 'warning');
            } finally {
                locationBtn.classList.remove('loading');
                locationBtn.disabled = false;
            }
        });
    }

    // Función para estimar precio del viaje
    function estimateTripPrice() {
        const desde = desdeInput?.value;
        const hasta = hastaInput?.value;
        
        if (!desde || !hasta) return;

        // Simular cálculo de distancia (en una app real usarías una API de mapas)
        const simulatedDistance = Math.random() * 15 + 2; // Entre 2 y 17 km
        const estimatedPrice = estimatePrice(simulatedDistance);
        
        // Mostrar precio estimado
        showPriceEstimate(estimatedPrice, simulatedDistance);
    }

    function showPriceEstimate(price, distance) {
        // Remover estimación anterior si existe
        const existingEstimate = document.getElementById('price-estimate');
        if (existingEstimate) {
            existingEstimate.remove();
        }

        const estimateDiv = document.createElement('div');
        estimateDiv.id = 'price-estimate';
        estimateDiv.className = 'price-estimate';
        estimateDiv.innerHTML = `
            <div class="estimate-content">
                <div class="estimate-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <div class="estimate-details">
                    <div class="estimate-price">$${price.toLocaleString()}</div>
                    <div class="estimate-distance">~${distance.toFixed(1)} km</div>
                </div>
            </div>
        `;

        // Insertar después del formulario
        const form = document.getElementById('pedido-form');
        if (form) {
            form.appendChild(estimateDiv);
        }
    }
});