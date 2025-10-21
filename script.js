// Variables globales
let currentUser = null;
let isLoggedIn = false;
// API_BASE_URL se define en database-manager.js

// Elementos del DOM
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const continueBtn = document.getElementById('continue-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeBtns = document.querySelectorAll('.close');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Simular tiempo de carga
    setTimeout(() => {
        showMainContent();
        // Inicializar mapa cuando se muestre el contenido principal
        setTimeout(() => {
            if (mapInitialized) {
                initializeMap();
            } else {
                console.warn('Esperando a que Google Maps se cargue...');
                // Intentar cada segundo hasta que esté listo
                const checkMap = setInterval(() => {
                    if (mapInitialized) {
                        initializeMap();
                        clearInterval(checkMap);
                    }
                }, 1000);
            }
        }, 1000);
    }, 3000);
    
    setupEventListeners();
    checkAuthStatus();
}

function showMainContent() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }, 500);
}

function setupEventListeners() {
    // Botón continuar
    continueBtn.addEventListener('click', showMainContent);
    
    // Navegación por pestañas
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Botones de autenticación
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
    
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
    });
    
    // Cerrar modales
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Formularios de autenticación
    setupAuthForms();
    
    // Chat
    setupChat();
    
    // Formulario de reserva
    setupBookingForm();
}

function switchTab(tabId) {
    // Prevenir acceso al perfil sin estar logueado
    if (tabId === 'profile' && !isLoggedIn) {
        showNotification('Debes iniciar sesión para acceder al perfil', 'warning');
        return;
    }
    
    // Remover clase active de todos los botones y contenidos
    navBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activar el botón y contenido seleccionado
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-tab`);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // Inicializar funcionalidades específicas según la pestaña
    if (tabId === 'map') {
        setTimeout(() => {
            if (typeof initMap === 'function') {
                initMap();
            }
        }, 100);
    } else if (tabId === 'profile' && isLoggedIn) {
        setTimeout(() => {
            updateProfileInfo();
            loadUserAvatar();
            updateRatingsFeed();
            initializeStarRating();
        }, 100);
    }
}

function setupAuthForms() {
    // Event listeners para botones del header
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const registerModal = document.getElementById('register-modal');
            if (registerModal) {
                registerModal.style.display = 'block';
            }
        });
    }
    
    // Formulario de login
    const loginForm = loginModal.querySelector('.auth-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (loginUser(email, password)) {
            loginModal.style.display = 'none';
            updateAuthUI();
        } else {
            alert('Credenciales incorrectas');
        }
    });
    
    // Formulario de registro
    const registerForm = registerModal.querySelector('.auth-form');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        
        if (registerUser(name, email, phone, password)) {
            registerModal.style.display = 'none';
            updateAuthUI();
        } else {
            alert('Error en el registro');
        }
    });
    
    // Event listeners para cerrar modales
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

async function loginUser(email, password) {
    try {
        // Intentar conectar con el servidor primero
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            isLoggedIn = true;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            return true;
        } else {
            alert(data.error || 'Error en el login');
            return false;
        }
    } catch (error) {
        console.error('Error de conexión con servidor, usando autenticación local:', error);
        
        // Fallback: Autenticación local sin servidor
        return loginUserLocal(email, password);
    }
}

function loginUserLocal(email, password) {
    // Usuarios predefinidos para desarrollo
    const predefinedUsers = {
        'paatodev@dev.com': {
            id: 1,
            name: 'PaatoDev Admin',
            email: 'paatodev@dev.com',
            password: 'ajsdbuahfbasijvnsv',
            userType: 'admin',
            phone: '+54 9 11 1234-5678'
        },
        'usuario@test.com': {
            id: 2,
            name: 'Usuario Test',
            email: 'usuario@test.com',
            password: '123456',
            userType: 'passenger',
            phone: '+54 9 11 9876-5432'
        },
        'conductor@test.com': {
            id: 3,
            name: 'Conductor Test',
            email: 'conductor@test.com',
            password: '123456',
            userType: 'driver',
            phone: '+54 9 11 5555-1234',
            driverInfo: {
                alias: 'CarlosTaxi',
                vehicleType: 'sedan',
                vehicleMake: 'Toyota',
                vehicleModel: 'Corolla',
                vehicleColor: 'Blanco',
                vehiclePlate: 'ABC-123',
                driverLicense: '12345678',
                isAvailable: false,
                rating: 4.8,
                totalTrips: 156
            }
        }
    };
    
    // Buscar en usuarios predefinidos
    let user = predefinedUsers[email];
    
    // Si no está en predefinidos, buscar en usuarios registrados localmente
    if (!user) {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        user = localUsers[email];
    }
    
    if (user && user.password === password) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            phone: user.phone,
            driverInfo: user.driverInfo
        };
        
        isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        console.log('Login exitoso, llamando updateAuthUI...');
        
        // Actualizar UI inmediatamente
        updateAuthUI();
        
        console.log('Mostrando notificación de bienvenida...');
        showNotification(`¡Bienvenido ${user.name}!`, 'success');
        
        console.log('Login exitoso (modo local):', currentUser);
        
        return true;
    } else {
        alert('Credenciales incorrectas');
        return false;
    }
}

async function registerUser(name, email, phone, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password, userType: 'passenger' })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            isLoggedIn = true;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            return true;
        } else {
            alert(data.error || 'Error en el registro');
            return false;
        }
    } catch (error) {
        console.error('Error de conexión con servidor, usando registro local:', error);
        
        // Fallback: Registro local sin servidor
        return registerUserLocal(name, email, phone, password);
    }
}

function registerUserLocal(name, email, phone, password, userType = 'passenger', driverInfo = null) {
    // Verificar si el usuario ya existe
    const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
    
    if (existingUsers[email]) {
        alert('El usuario ya existe');
        return false;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(), // ID único basado en timestamp
        name: name,
        email: email,
        phone: phone,
        password: password,
        userType: userType,
        driverInfo: driverInfo // Información adicional para conductores
    };
    
    // Guardar usuario localmente
    existingUsers[email] = newUser;
    localStorage.setItem('localUsers', JSON.stringify(existingUsers));
    
    // Intentar guardar en base de datos
    DatabaseManager.saveUser(newUser).then(savedUser => {
        if (savedUser) {
            console.log('Usuario guardado en base de datos:', savedUser);
            
            // Si es conductor, guardar también el perfil de conductor
            if (userType === 'driver' && driverInfo) {
                DatabaseManager.saveDriverProfile(savedUser.id, driverInfo).then(savedProfile => {
                    if (savedProfile) {
                        console.log('Perfil de conductor guardado en BD:', savedProfile);
                    }
                });
            }
        }
    });
    
    // Hacer login automático
    currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        phone: newUser.phone,
        driverInfo: newUser.driverInfo
    };
    
    isLoggedIn = true;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    // Actualizar UI inmediatamente
    updateAuthUI();
    
    showNotification(`¡Registro exitoso! Bienvenido ${name}`, 'success');
    console.log('Registro exitoso (modo local):', currentUser);
    
    return true;
}

// Función para mostrar/ocultar campos de conductor
function toggleDriverFields() {
    const accountType = document.querySelector('input[name="account-type"]:checked').value;
    const driverFields = document.getElementById('driver-fields');
    
    if (accountType === 'driver') {
        driverFields.style.display = 'block';
    } else {
        driverFields.style.display = 'none';
    }
}

// Función para manejar el registro con validación
function handleRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const accountType = document.querySelector('input[name="account-type"]:checked').value;
    
    // Validaciones básicas
    if (!name || !email || !password) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Validaciones específicas para conductores
    let driverInfo = null;
    if (accountType === 'driver') {
        const alias = document.getElementById('driver-alias').value.trim();
        const vehicleType = document.getElementById('vehicle-type').value;
        const vehicleMake = document.getElementById('vehicle-make').value.trim();
        const vehicleModel = document.getElementById('vehicle-model').value.trim();
        const vehicleColor = document.getElementById('vehicle-color').value.trim();
        const vehiclePlate = document.getElementById('vehicle-plate').value.trim();
        const driverLicense = document.getElementById('driver-license').value.trim();
        
        if (!alias || !vehicleMake || !vehicleModel || !vehicleColor || !vehiclePlate || !driverLicense) {
            alert('Por favor completa toda la información del vehículo');
            return;
        }
        
        driverInfo = {
            alias: alias,
            vehicleType: vehicleType,
            vehicleMake: vehicleMake,
            vehicleModel: vehicleModel,
            vehicleColor: vehicleColor,
            vehiclePlate: vehiclePlate,
            driverLicense: driverLicense,
            isAvailable: false,
            rating: 5.0,
            totalTrips: 0
        };
    }
    
    // Registrar usuario
    if (registerUserLocal(name, email, phone, password, accountType, driverInfo)) {
        closeModal('register-modal');
        // Limpiar formulario
        document.querySelector('#register-modal form').reset();
        document.getElementById('driver-fields').style.display = 'none';
    }
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateAuthUI();
    }
}

function updateAuthUI() {
    console.log('=== updateAuthUI INICIADO ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userSection = document.querySelector('.user-section');
    const profileTabBtn = document.getElementById('profile-tab-btn');
    
    console.log('Elementos encontrados:', {
        loginBtn: !!loginBtn,
        registerBtn: !!registerBtn,
        userSection: !!userSection,
        profileTabBtn: !!profileTabBtn
    });
    
    // Limpiar botones existentes
    if (userSection) {
        userSection.innerHTML = '';
    }
    
    if (isLoggedIn && currentUser) {
        console.log('Usuario logueado, configurando UI...');
        
        // Ocultar botones de login/registro
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        // Mostrar pestaña de perfil
        if (profileTabBtn) {
            profileTabBtn.style.display = 'flex';
            console.log('Pestaña de perfil mostrada');
        }
        
        // Crear botón de perfil en el header
        const profileBtn = document.createElement('button');
        profileBtn.className = 'auth-btn';
        profileBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
        profileBtn.addEventListener('click', () => {
            switchTab('profile');
        });
        
        // Crear botón de cerrar sesión
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'auth-btn logout-btn';
        logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Cerrar Sesión`;
        logoutBtn.addEventListener('click', logout);
        
        if (userSection) {
            userSection.appendChild(profileBtn);
            userSection.appendChild(logoutBtn);
            console.log('Botones de perfil y logout agregados');
        }
        
        // Si es admin, agregar botón de administración
        if (currentUser.userType === 'admin') {
            const adminBtn = document.createElement('button');
            adminBtn.className = 'auth-btn admin-btn';
            adminBtn.innerHTML = `<i class="fas fa-cog"></i> Admin`;
            adminBtn.addEventListener('click', () => {
                AdminPanel.showAdminPanel();
            });
            if (userSection) {
                userSection.appendChild(adminBtn);
                console.log('Botón de admin agregado');
            }
        }
        
        // Actualizar información del perfil automáticamente
        setTimeout(() => {
            updateProfileInfo();
            loadUserAvatar();
            updateRatingsFeed();
            initializeStarRating();
        }, 100);
        
        console.log('=== updateAuthUI COMPLETADO (LOGGED IN) ===');
    } else {
        console.log('Usuario no logueado, configurando UI...');
        
        // Mostrar botones de login/registro
        if (loginBtn) {
            loginBtn.style.display = 'block';
            loginBtn.style.visibility = 'visible';
            loginBtn.style.opacity = '1';
            console.log('Botón de login mostrado');
        } else {
            console.error('Botón de login no encontrado!');
            // Intentar encontrar el botón de otra manera
            const loginBtnAlt = document.querySelector('#login-btn');
            if (loginBtnAlt) {
                loginBtnAlt.style.display = 'block';
                loginBtnAlt.style.visibility = 'visible';
                loginBtnAlt.style.opacity = '1';
                console.log('Botón de login encontrado alternativamente');
            }
        }
        
        if (registerBtn) {
            registerBtn.style.display = 'block';
            registerBtn.style.visibility = 'visible';
            registerBtn.style.opacity = '1';
            console.log('Botón de registro mostrado');
        } else {
            console.error('Botón de registro no encontrado!');
            // Intentar encontrar el botón de otra manera
            const registerBtnAlt = document.querySelector('#register-btn');
            if (registerBtnAlt) {
                registerBtnAlt.style.display = 'block';
                registerBtnAlt.style.visibility = 'visible';
                registerBtnAlt.style.opacity = '1';
                console.log('Botón de registro encontrado alternativamente');
            }
        }
        
        // Ocultar pestaña de perfil
        if (profileTabBtn) {
            profileTabBtn.style.display = 'none';
            console.log('Pestaña de perfil ocultada');
        }
        
        // Si estamos en la pestaña de perfil, volver al inicio
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'profile-tab') {
            switchTab('home');
        }
        
        console.log('=== updateAuthUI COMPLETADO (NOT LOGGED IN) ===');
    }
}

function updateProfileInfo() {
    if (currentUser) {
        // Actualizar información básica
        const nameElement = document.getElementById('user-name');
        const emailElement = document.getElementById('user-email');
        const phoneElement = document.getElementById('user-phone');
        const typeElement = document.querySelector('.type-value');
        
        if (nameElement) nameElement.textContent = currentUser.name;
        if (emailElement) emailElement.textContent = currentUser.email;
        if (phoneElement) phoneElement.textContent = currentUser.phone || 'No especificado';
        
        if (typeElement) {
            typeElement.textContent = currentUser.userType === 'admin' ? 'Administrador' : 
                                    currentUser.userType === 'driver' ? 'Conductor' : 'Pasajero';
        }
        
        // Cargar datos reales del usuario (sin valores aleatorios)
        loadUserStats();
    }
}

function loadUserStats() {
    // Cargar estadísticas reales del localStorage
    const userStats = JSON.parse(localStorage.getItem(`userStats_${currentUser.id}`) || '{}');
    
    // Valores por defecto si no existen datos
    const stats = {
        totalTrips: userStats.totalTrips || 0,
        userRating: userStats.userRating || 0,
        totalSpent: userStats.totalSpent || 0,
        activeDays: userStats.activeDays || 1
    };
    
    // Actualizar elementos del DOM
    const totalTripsElement = document.getElementById('total-trips');
    const userRatingElement = document.getElementById('user-rating');
    const totalSpentElement = document.getElementById('total-spent');
    const activeDaysElement = document.getElementById('active-days');
    
    if (totalTripsElement) totalTripsElement.textContent = stats.totalTrips;
    if (userRatingElement) userRatingElement.textContent = stats.userRating > 0 ? stats.userRating.toFixed(1) : 'Sin calificaciones';
    if (totalSpentElement) totalSpentElement.textContent = formatCurrency(stats.totalSpent);
    if (activeDaysElement) activeDaysElement.textContent = stats.activeDays;
}

function saveUserStats() {
    if (currentUser) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${currentUser.id}`) || '{}');
        localStorage.setItem(`userStats_${currentUser.id}`, JSON.stringify(userStats));
    }
}

function addTrip() {
    if (currentUser) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${currentUser.id}`) || '{}');
        userStats.totalTrips = (userStats.totalTrips || 0) + 1;
        userStats.totalSpent = (userStats.totalSpent || 0) + 4000; // Tarifa fija
        localStorage.setItem(`userStats_${currentUser.id}`, JSON.stringify(userStats));
        loadUserStats(); // Actualizar inmediatamente
    }
}

function addRating(rating) {
    if (currentUser) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${currentUser.id}`) || '{}');
        const ratings = userStats.ratings || [];
        ratings.push(rating);
        
        // Calcular promedio
        const totalRating = ratings.reduce((sum, r) => sum + r, 0);
        userStats.userRating = totalRating / ratings.length;
        
        localStorage.setItem(`userStats_${currentUser.id}`, JSON.stringify(userStats));
        loadUserStats(); // Actualizar inmediatamente
    }
}

function setupChat() {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        addMessageToChat(message, 'user');
        messageInput.value = '';
        
        // Simular respuesta automática
        setTimeout(() => {
            const responses = [
                'Gracias por tu mensaje. ¿En qué podemos ayudarte?',
                'Un conductor estará disponible pronto.',
                '¿Necesitas información sobre tarifas?',
                '¿Quieres solicitar un taxi ahora?'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat(randomResponse, 'system');
        }, 1000);
    }
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setupBookingForm() {
    const bookBtn = document.querySelector('.book-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                alert('Debes iniciar sesión para solicitar un taxi');
                loginModal.style.display = 'block';
                return;
            }
            
            const pickup = document.getElementById('pickup-location').value;
            const destination = document.getElementById('destination').value;
            
            if (pickup && destination) {
                requestTaxi(pickup, destination);
            } else {
                alert('Por favor completa todos los campos');
            }
        });
    }
}

function requestTaxi(pickup, destination) {
    // Simular solicitud de taxi
    alert(`Taxi solicitado desde ${pickup} hasta ${destination}. Tarifa: $4000`);
    
    // Aquí conectarías con tu API para procesar el pago
    // Por ahora simulamos el proceso
    setTimeout(() => {
        if (confirm('¿Deseas proceder con el pago de $4000?')) {
            // Redirigir a Mercado Pago
            window.open('https://www.mercadopago.com.ar', '_blank');
        }
    }, 1000);
}

// Variables del mapa
let map;
let markers = [];
let userLocationMarker = null;
let availableDrivers = [];
let mapInitialized = false;

// Función callback para Google Maps
function initMap() {
    console.log('Google Maps cargado correctamente');
    mapInitialized = true;
    initializeMap();
}

// Función para inicializar mapa con Leaflet (gratis)
function initLeafletMap() {
    console.log('Inicializando mapa con Leaflet (OpenStreetMap)');
    
    // Crear mapa centrado en Argentina
    const map = L.map('map').setView([-35.0, -65.0], 6);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Agregar marcador de ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Marcador de usuario
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: '<div style="background: #00d4aa; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                
                L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('📍 Tu ubicación')
                    .openPopup();
                
                map.setView([lat, lng], 13);
                showNotification('Ubicación obtenida correctamente', 'success');
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                showNotification('No se pudo obtener tu ubicación', 'warning');
            }
        );
    }
    
    // Agregar conductores de prueba
    const drivers = [
        { name: 'Carlos Mendoza', lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', vehicle: 'Toyota Corolla', color: 'Blanco', plate: 'ABC-123', rating: 4.8 },
        { name: 'María González', lat: -31.4201, lng: -64.1888, city: 'Córdoba', vehicle: 'Chevrolet Cruze', color: 'Azul', plate: 'DEF-456', rating: 4.9 },
        { name: 'Roberto Silva', lat: -32.9442, lng: -60.6505, city: 'Rosario', vehicle: 'Ford Focus', color: 'Negro', plate: 'GHI-789', rating: 4.7 },
        { name: 'Ana Rodríguez', lat: -24.7821, lng: -65.4232, city: 'Tucumán', vehicle: 'Volkswagen Golf', color: 'Rojo', plate: 'JKL-012', rating: 5.0 },
        { name: 'Diego López', lat: -26.8241, lng: -65.2223, city: 'Salta', vehicle: 'Renault Logan', color: 'Gris', plate: 'MNO-345', rating: 4.6 },
        { name: 'Laura Fernández', lat: -38.0023, lng: -57.5575, city: 'Mar del Plata', vehicle: 'Peugeot 208', color: 'Verde', plate: 'PQR-678', rating: 4.9 }
    ];
    
    drivers.forEach(driver => {
        const driverIcon = L.divIcon({
            className: 'driver-marker',
            html: '<div style="background: #7209b7; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🚗</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        L.marker([driver.lat, driver.lng], { icon: driverIcon })
            .addTo(map)
            .bindPopup(`
                <div style="color: #1a1a2e; padding: 10px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #7209b7;">🚗 ${driver.name}</h3>
                    <p style="margin: 2px 0;"><strong>📍 Ciudad:</strong> ${driver.city}</p>
                    <p style="margin: 2px 0;"><strong>🚙 Vehículo:</strong> ${driver.vehicle}</p>
                    <p style="margin: 2px 0;"><strong>🎨 Color:</strong> ${driver.color}</p>
                    <p style="margin: 2px 0;"><strong>🔢 Placa:</strong> ${driver.plate}</p>
                    <p style="margin: 2px 0; color: #ff6b35;"><strong>⭐ ${driver.rating}</strong></p>
                    <div style="background: #7209b7; color: white; padding: 3px 8px; border-radius: 10px; font-size: 10px; display: inline-block; margin-top: 5px;">
                        DISPONIBLE
                    </div>
                </div>
            `);
    });
    
    console.log('Mapa Leaflet inicializado con', drivers.length, 'conductores');
}

// Funciones para el mapa con Google Maps
function initializeMap() {
    // Verificar si Google Maps está cargado
    if (typeof google === 'undefined') {
        console.log('Google Maps no está cargado, usando Leaflet como fallback');
        // Usar Leaflet como fallback
        if (typeof L !== 'undefined') {
            initLeafletMap();
        } else {
            console.error('Ni Google Maps ni Leaflet están disponibles');
            showTestMap();
        }
        return;
    }

    // Crear mapa centrado en Argentina (ubicación más amplia)
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: { lat: -35.0, lng: -65.0 }, // Centro de Argentina
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#1a1a2e' }]
            },
            {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#0f3460' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#16213e' }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#7209b7' }]
            }
        ],
        // Configuraciones adicionales para mejor experiencia
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    });

    // Obtener ubicación del usuario
    getCurrentLocation();
    
    // Cargar conductores disponibles
    loadAvailableDrivers();
    
    // Actualizar ubicación cada 30 segundos
    setInterval(loadAvailableDrivers, 30000);
}

async function loadAvailableDrivers() {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/available`);
        const data = await response.json();
        
        if (data.success) {
            availableDrivers = data.drivers;
            updateDriverMarkers();
        }
    } catch (error) {
        console.error('Error cargando conductores:', error);
        // Usar datos de prueba si la API no está disponible
        loadTestDrivers();
    }
}

function loadTestDrivers() {
    // Conductores de prueba distribuidos por Argentina
    availableDrivers = [
        {
            id: 1,
            name: 'Carlos Mendoza',
            vehicle_make: 'Toyota',
            vehicle_model: 'Corolla',
            vehicle_color: 'Blanco',
            vehicle_plate: 'ABC-123',
            rating: 4.8,
            total_trips: 156,
            current_latitude: -34.6037 + (Math.random() - 0.5) * 0.02, // Buenos Aires
            current_longitude: -58.3816 + (Math.random() - 0.5) * 0.02,
            city: 'Buenos Aires'
        },
        {
            id: 2,
            name: 'María González',
            vehicle_make: 'Chevrolet',
            vehicle_model: 'Cruze',
            vehicle_color: 'Azul',
            vehicle_plate: 'DEF-456',
            rating: 4.9,
            total_trips: 203,
            current_latitude: -31.4201 + (Math.random() - 0.5) * 0.02, // Córdoba
            current_longitude: -64.1888 + (Math.random() - 0.5) * 0.02,
            city: 'Córdoba'
        },
        {
            id: 3,
            name: 'Roberto Silva',
            vehicle_make: 'Ford',
            vehicle_model: 'Focus',
            vehicle_color: 'Negro',
            vehicle_plate: 'GHI-789',
            rating: 4.7,
            total_trips: 89,
            current_latitude: -32.9442 + (Math.random() - 0.5) * 0.02, // Rosario
            current_longitude: -60.6505 + (Math.random() - 0.5) * 0.02,
            city: 'Rosario'
        },
        {
            id: 4,
            name: 'Ana Rodríguez',
            vehicle_make: 'Volkswagen',
            vehicle_model: 'Golf',
            vehicle_color: 'Rojo',
            vehicle_plate: 'JKL-012',
            rating: 5.0,
            total_trips: 312,
            current_latitude: -24.7821 + (Math.random() - 0.5) * 0.02, // Tucumán
            current_longitude: -65.4232 + (Math.random() - 0.5) * 0.02,
            city: 'Tucumán'
        },
        {
            id: 5,
            name: 'Diego López',
            vehicle_make: 'Renault',
            vehicle_model: 'Logan',
            vehicle_color: 'Gris',
            vehicle_plate: 'MNO-345',
            rating: 4.6,
            total_trips: 78,
            current_latitude: -26.8241 + (Math.random() - 0.5) * 0.02, // Salta
            current_longitude: -65.2223 + (Math.random() - 0.5) * 0.02,
            city: 'Salta'
        },
        {
            id: 6,
            name: 'Laura Fernández',
            vehicle_make: 'Peugeot',
            vehicle_model: '208',
            vehicle_color: 'Verde',
            vehicle_plate: 'PQR-678',
            rating: 4.9,
            total_trips: 245,
            current_latitude: -38.0023 + (Math.random() - 0.5) * 0.02, // Mar del Plata
            current_longitude: -57.5575 + (Math.random() - 0.5) * 0.02,
            city: 'Mar del Plata'
        }
    ];
    
    console.log('Cargando conductores de prueba en Argentina:', availableDrivers.length);
    updateDriverMarkers();
}

function updateDriverMarkers() {
    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Crear marcadores para cada conductor
    availableDrivers.forEach(driver => {
        if (driver.current_latitude && driver.current_longitude) {
            const marker = new google.maps.Marker({
                position: { lat: driver.current_latitude, lng: driver.current_longitude },
                map: map,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#7209b7" stroke="#ffffff" stroke-width="2"/>
                            <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-family="Arial">🚗</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40)
                },
                title: `${driver.name} - ${driver.vehicle_make} ${driver.vehicle_model}`
            });

            // Info window para el conductor
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="color: #1a1a2e; padding: 15px; min-width: 250px;">
                        <h3 style="margin: 0 0 10px 0; color: #7209b7; font-size: 16px;">🚗 ${driver.name}</h3>
                        <div style="background: #f0f0f0; padding: 8px; border-radius: 5px; margin-bottom: 8px;">
                            <p style="margin: 2px 0;"><strong>📍 Ciudad:</strong> ${driver.city || 'Argentina'}</p>
                            <p style="margin: 2px 0;"><strong>🚙 Vehículo:</strong> ${driver.vehicle_make} ${driver.vehicle_model}</p>
                            <p style="margin: 2px 0;"><strong>🎨 Color:</strong> ${driver.vehicle_color}</p>
                            <p style="margin: 2px 0;"><strong>🔢 Placa:</strong> ${driver.vehicle_plate}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="margin: 2px 0; color: #ff6b35;"><strong>⭐ ${driver.rating}</strong></p>
                                <p style="margin: 2px 0; font-size: 12px;">${driver.total_trips} viajes</p>
                            </div>
                            <div style="background: #7209b7; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                                DISPONIBLE
                            </div>
                        </div>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            markers.push(marker);
        }
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        console.log('Solicitando ubicación del usuario...');
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log(`Ubicación obtenida: ${lat}, ${lng}`);
                
                // Crear marcador de ubicación del usuario
                if (userLocationMarker) {
                    userLocationMarker.setMap(null);
                }
                
                userLocationMarker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="15" cy="15" r="12" fill="#00d4aa" stroke="#ffffff" stroke-width="2"/>
                                <text x="15" y="19" text-anchor="middle" fill="white" font-size="12" font-family="Arial">📍</text>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(30, 30)
                    },
                    title: 'Tu ubicación',
                    animation: google.maps.Animation.DROP
                });
                
                // Centrar mapa en la ubicación del usuario con zoom apropiado
                map.setCenter({ lat, lng });
                map.setZoom(13); // Zoom más amplio para ver mejor el área
                
                // Crear círculo de precisión
                const accuracyCircle = new google.maps.Circle({
                    strokeColor: '#00d4aa',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    fillColor: '#00d4aa',
                    fillOpacity: 0.1,
                    map: map,
                    center: { lat, lng },
                    radius: position.coords.accuracy
                });
                
                showNotification('Ubicación obtenida correctamente', 'success');
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                let errorMessage = 'No se pudo obtener tu ubicación';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permisos de ubicación denegados';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado';
                        break;
                }
                
                showNotification(errorMessage, 'warning');
                
                // Usar ubicación por defecto (Buenos Aires)
                map.setCenter({ lat: -34.6037, lng: -58.3816 });
                map.setZoom(13);
            },
            options
        );
    } else {
        console.error('Geolocalización no soportada');
        showNotification('Geolocalización no soportada por este navegador', 'warning');
        
        // Usar ubicación por defecto
        map.setCenter({ lat: -34.6037, lng: -58.3816 });
        map.setZoom(13);
    }
}

// Funciones para conductores
function showDriverPanel() {
    if (currentUser && currentUser.type === 'driver') {
        // Mostrar panel específico para conductores
        console.log('Mostrando panel de conductor');
    }
}

// Funciones de administración
function showAdminPanel() {
    if (currentUser && currentUser.type === 'admin') {
        // Mostrar panel de administración
        console.log('Mostrando panel de administración');
    }
}

// Funciones de geolocalización
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log(`Ubicación: ${lat}, ${lng}`);
                // Aquí actualizarías el mapa con la ubicación
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                alert('No se pudo obtener tu ubicación');
            }
        );
    } else {
        alert('Geolocalización no soportada por este navegador');
    }
}

// Funciones de notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-secondary);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funciones de utilidad
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount);
}

function formatTime(date) {
    return new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Funciones para conductores
function registerAsDriver() {
    if (!isLoggedIn) {
        showNotification('Debes iniciar sesión para registrarte como conductor', 'warning');
        registerModal.style.display = 'block';
        return;
    }
    
    showNotification('¡Función de registro como conductor disponible!', 'info');
    console.log('Usuario registrándose como conductor:', currentUser?.name);
}

function toggleDriverAvailability() {
    if (!currentUser) {
        showNotification('Debes iniciar sesión para marcar tu disponibilidad', 'warning');
        return;
    }
    
    if (currentUser.userType !== 'driver') {
        showNotification('Solo los conductores pueden marcar su disponibilidad', 'warning');
        return;
    }
    
    console.log('Cambiando disponibilidad del conductor:', currentUser.name);
    showNotification('Estado de disponibilidad actualizado', 'success');
}

function updateDriverLocation() {
    if (!currentUser || currentUser.userType !== 'driver') {
        return;
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log(`Actualizando ubicación del conductor: ${lat}, ${lng}`);
                showNotification('Ubicación actualizada', 'success');
            },
            (error) => {
                console.error('Error actualizando ubicación:', error);
                showNotification('No se pudo actualizar la ubicación', 'warning');
            }
        );
    }
}

// Funciones del panel de perfil
function updateProfileInfo() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-email').textContent = currentUser.email;
        document.getElementById('user-phone').textContent = currentUser.phone || 'No especificado';
        
        const typeValue = document.querySelector('.type-value');
        if (typeValue) {
            typeValue.textContent = currentUser.userType === 'admin' ? 'Administrador' : 
                                  currentUser.userType === 'driver' ? 'Conductor' : 'Pasajero';
        }
        
        // Actualizar estadísticas (datos de ejemplo)
        document.getElementById('total-trips').textContent = Math.floor(Math.random() * 50) + 1;
        document.getElementById('user-rating').textContent = (4.5 + Math.random() * 0.5).toFixed(1);
        document.getElementById('total-spent').textContent = formatCurrency(Math.floor(Math.random() * 50000) + 10000);
        document.getElementById('active-days').textContent = Math.floor(Math.random() * 30) + 1;
    }
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        console.log('=== LOGOUT INICIADO ===');
        
        currentUser = null;
        isLoggedIn = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        console.log('Datos de sesión limpiados');
        console.log('isLoggedIn:', isLoggedIn);
        console.log('currentUser:', currentUser);
        
        showNotification('Sesión cerrada correctamente', 'info');
        
        console.log('Llamando updateAuthUI...');
        updateAuthUI();
        
        // Asegurar que se ejecute después de un pequeño delay
        setTimeout(() => {
            console.log('Ejecutando updateAuthUI con delay...');
            updateAuthUI();
        }, 100);
        
        // Volver a la pestaña de inicio
        switchTab('home');
        
        console.log('=== LOGOUT COMPLETADO ===');
    }
}

function editProfile() {
    const newName = prompt('Nuevo nombre:', currentUser.name);
    if (newName && newName.trim()) {
        currentUser.name = newName.trim();
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateProfileInfo();
        showNotification('Perfil actualizado correctamente', 'success');
    }
}

// Sistema de valoraciones
let currentRating = 0;

function initializeStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        updateStarDisplay();
    });
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffd700';
        } else {
            star.style.color = '#ddd';
        }
    });
}

function submitRating() {
    const comment = document.getElementById('rating-comment').value.trim();
    
    if (currentRating === 0) {
        alert('Por favor selecciona una calificación');
        return;
    }
    
    if (!comment) {
        alert('Por favor escribe un comentario');
        return;
    }
    
    // Guardar valoración en localStorage
    const ratings = JSON.parse(localStorage.getItem(`ratings_${currentUser.id}`) || '[]');
    const newRating = {
        id: Date.now(),
        raterName: currentUser.name,
        raterType: currentUser.userType,
        rating: currentRating,
        comment: comment,
        date: new Date().toLocaleDateString('es-AR'),
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
    
    ratings.unshift(newRating); // Agregar al inicio
    localStorage.setItem(`ratings_${currentUser.id}`, JSON.stringify(ratings));
    
    // Guardar en base de datos
    DatabaseManager.saveRating({
        tripId: null, // Por ahora null, se puede asociar a un viaje específico
        raterId: currentUser.id,
        ratedId: currentUser.id, // Auto-valoración por ahora
        rating: currentRating,
        comment: comment
    }).then(savedRating => {
        if (savedRating) {
            console.log('Valoración guardada en BD:', savedRating);
        }
    });
    
    // Actualizar estadísticas
    addRating(currentRating);
    
    // Actualizar feed de valoraciones
    updateRatingsFeed();
    
    // Limpiar formulario
    currentRating = 0;
    updateStarDisplay();
    document.getElementById('rating-comment').value = '';
    
    showNotification('Valoración enviada correctamente', 'success');
}

function updateRatingsFeed() {
    const ratingsList = document.getElementById('ratings-list');
    const emptyRatings = document.getElementById('empty-ratings');
    const ratings = JSON.parse(localStorage.getItem(`ratings_${currentUser.id}`) || '[]');
    
    if (ratings.length === 0) {
        if (emptyRatings) emptyRatings.style.display = 'block';
        return;
    }
    
    if (emptyRatings) emptyRatings.style.display = 'none';
    
    ratingsList.innerHTML = '';
    
    ratings.forEach(rating => {
        const ratingElement = document.createElement('div');
        ratingElement.className = 'rating-item';
        ratingElement.innerHTML = `
            <div class="rating-header">
                <div class="rater-info">
                    <div class="rater-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="rater-details">
                        <h4>${rating.raterName}</h4>
                        <p>${rating.raterType === 'admin' ? 'Administrador' : 
                            rating.raterType === 'driver' ? 'Conductor' : 'Pasajero'}</p>
                    </div>
                </div>
                <div class="rating-score">
                    <div class="stars">
                        ${'<i class="fas fa-star"></i>'.repeat(rating.rating)}
                        ${'<i class="far fa-star"></i>'.repeat(5 - rating.rating)}
                    </div>
                    <span class="rating-date">${rating.date} ${rating.time}</span>
                </div>
            </div>
            <div class="rating-comment">
                <p>"${rating.comment}"</p>
            </div>
        `;
        ratingsList.appendChild(ratingElement);
    });
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImage = document.getElementById('profile-image');
            const defaultAvatar = document.getElementById('default-avatar');
            
            profileImage.src = e.target.result;
            profileImage.style.display = 'block';
            defaultAvatar.style.display = 'none';
            
            // Guardar imagen en localStorage
            localStorage.setItem(`avatar_${currentUser.id}`, e.target.result);
            
            showNotification('Foto de perfil actualizada', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function loadUserAvatar() {
    if (currentUser) {
        const savedAvatar = localStorage.getItem(`avatar_${currentUser.id}`);
        if (savedAvatar) {
            const profileImage = document.getElementById('profile-image');
            const defaultAvatar = document.getElementById('default-avatar');
            
            profileImage.src = savedAvatar;
            profileImage.style.display = 'block';
            defaultAvatar.style.display = 'none';
        }
    }
}

// Configurar event listeners para el formulario de registro
function setupRegistrationForm() {
    // Event listener para mostrar/ocultar campos de conductor
    const accountTypeRadios = document.querySelectorAll('input[name="account-type"]');
    accountTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleDriverFields);
    });
    
    // Event listener para el formulario de registro
    const registerForm = document.querySelector('#register-modal form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

// Función para cerrar modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
