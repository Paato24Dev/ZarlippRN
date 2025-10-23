// ========== JAVASCRIPT PARA LOGIN (login.html) ==========

// Elementos del DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');

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
 * Valida el formato del email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida la contraseña (mínimo 6 caracteres)
 */
function isValidPassword(password) {
    return password.length >= 6;
}

/**
 * Simula el proceso de login
 */
async function simulateLogin(email, password) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Datos de prueba (en producción esto vendría del servidor)
    const testUsers = [
        {
            id: 1,
            email: 'cliente@test.com',
            password: '123456',
            nombre: 'Juan',
            apellido: 'Pérez',
            telefono: '+54 299 123 4567',
            genero: 'masculino',
            type: 'cliente'
        },
        {
            id: 2,
            email: 'chofer@test.com',
            password: '123456',
            nombre: 'María',
            apellido: 'González',
            telefono: '+54 299 987 6543',
            genero: 'femenino',
            type: 'chofer',
            vehiculo: 'Renault Logan',
            patente: 'AB 123 CD',
            rating: 4.9
        }
    ];
    
    const user = testUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Remover la contraseña antes de guardar
        const { password: _, ...userData } = user;
        return userData;
    } else {
        throw new Error('Credenciales inválidas');
    }
}

/**
 * Guarda los datos del usuario en localStorage
 */
function saveUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
}

/**
 * Redirige al usuario según su tipo
 */
function redirectUser(user) {
    if (user.type === 'cliente') {
        window.location.href = 'cliente-perfil.html';
    } else if (user.type === 'chofer') {
        window.location.href = 'chofer-perfil.html';
    }
}

// ========== MANEJO DEL FORMULARIO DE LOGIN ==========
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;
        
        // Validaciones
        if (!email) {
            showNotification('Por favor ingresa tu email', 'error');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Por favor ingresa un email válido', 'error');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showNotification('Por favor ingresa tu contraseña', 'error');
            passwordInput.focus();
            return;
        }
        
        if (!isValidPassword(password)) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            passwordInput.focus();
            return;
        }
        
        // Mostrar estado de carga
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Ingresando...';
        submitBtn.disabled = true;
        
        try {
            // Simular login
            const user = await simulateLogin(email, password);
            
            // Guardar datos del usuario
            saveUserData(user);
            
            // Mostrar mensaje de éxito
            showNotification(`¡Bienvenido ${user.nombre}!`, 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                redirectUser(user);
            }, 1500);
            
        } catch (error) {
            console.error('Error en login:', error);
            showNotification(error.message || 'Error al iniciar sesión', 'error');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== FUNCIONALIDADES ADICIONALES ==========

// Auto-completar campos si hay datos guardados
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }
});

// Guardar email si está marcado "recordar"
if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', () => {
        if (rememberCheckbox.checked && emailInput.value) {
            localStorage.setItem('savedEmail', emailInput.value);
        } else {
            localStorage.removeItem('savedEmail');
        }
    });
}

// Verificar si ya está logueado
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            showNotification('Ya estás logueado', 'info');
            setTimeout(() => {
                redirectUser(user);
            }, 1000);
        }
    }
});
