// ========== JAVASCRIPT PARA SOPORTE (soporte.html) ==========

// Elementos del DOM
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const supportForm = document.getElementById('support-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

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
 * Simula el envío del mensaje de soporte
 */
async function sendSupportMessage(messageData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular procesamiento
    return {
        success: true,
        message: 'Mensaje enviado correctamente',
        ticketId: 'TICKET-' + Date.now()
    };
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
 * Auto-completa los campos del formulario si el usuario está logueado
 */
function autoFillForm() {
    const user = getUserData();
    
    if (user) {
        if (nameInput) {
            nameInput.value = `${user.nombre} ${user.apellido}`;
        }
        
        if (emailInput) {
            emailInput.value = user.email;
        }
    }
}

// ========== MANEJO DE EVENTOS ==========

// Menú móvil
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Formulario de soporte
if (supportForm) {
    supportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(supportForm);
        const messageData = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            message: formData.get('message').trim()
        };
        
        // Validaciones
        if (!messageData.name) {
            showNotification('Por favor ingresa tu nombre', 'error');
            nameInput.focus();
            return;
        }
        
        if (!messageData.email) {
            showNotification('Por favor ingresa tu email', 'error');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(messageData.email)) {
            showNotification('Por favor ingresa un email válido', 'error');
            emailInput.focus();
            return;
        }
        
        if (!messageData.message) {
            showNotification('Por favor ingresa tu mensaje', 'error');
            messageInput.focus();
            return;
        }
        
        if (messageData.message.length < 10) {
            showNotification('El mensaje debe tener al menos 10 caracteres', 'error');
            messageInput.focus();
            return;
        }
        
        // Mostrar estado de carga
        const submitBtn = supportForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simular envío del mensaje
            const result = await sendSupportMessage(messageData);
            
            // Mostrar mensaje de éxito
            showNotification(result.message, 'success');
            
            // Mostrar número de ticket
            setTimeout(() => {
                showNotification(`Tu número de ticket es: ${result.ticketId}`, 'info');
            }, 1500);
            
            // Limpiar formulario
            supportForm.reset();
            
            // Re-auto-completar si está logueado
            autoFillForm();
            
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            showNotification('Error al enviar el mensaje. Intenta de nuevo.', 'error');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== FUNCIONALIDADES ADICIONALES ==========

// Auto-completar formulario si el usuario está logueado
document.addEventListener('DOMContentLoaded', () => {
    autoFillForm();
});

// Contador de caracteres para el mensaje
if (messageInput) {
    const maxLength = 500;
    
    // Crear contador
    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-400 mt-2 text-right';
    counter.textContent = `0/${maxLength}`;
    
    messageInput.parentNode.appendChild(counter);
    
    // Actualizar contador
    messageInput.addEventListener('input', () => {
        const length = messageInput.value.length;
        counter.textContent = `${length}/${maxLength}`;
        
        if (length > maxLength * 0.9) {
            counter.classList.add('text-yellow-400');
        } else {
            counter.classList.remove('text-yellow-400');
        }
        
        if (length > maxLength) {
            counter.classList.add('text-red-400');
            messageInput.value = messageInput.value.substring(0, maxLength);
        } else {
            counter.classList.remove('text-red-400');
        }
    });
}

// Animación de aparición para las FAQ
document.addEventListener('DOMContentLoaded', () => {
    const details = document.querySelectorAll('details');
    
    details.forEach((detail, index) => {
        detail.style.opacity = '0';
        detail.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            detail.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            detail.style.opacity = '1';
            detail.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
