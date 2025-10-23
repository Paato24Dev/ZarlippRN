// ========== JAVASCRIPT PARA FORGOT PASSWORD (forgot-password.html) ==========

// Elementos del DOM
const forgotPasswordForm = document.getElementById('forgot-password-form');
const emailInput = document.getElementById('email');

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
 * Simula el envío del email de recuperación
 */
async function sendRecoveryEmail(email) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular verificación de email existente
    const existingEmails = ['cliente@test.com', 'chofer@test.com', 'admin@zarlipprn.com'];
    
    if (existingEmails.includes(email)) {
        return { success: true, message: 'Email de recuperación enviado' };
    } else {
        throw new Error('No se encontró una cuenta con ese email');
    }
}

// ========== MANEJO DEL FORMULARIO ==========
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
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
        
        // Mostrar estado de carga
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Simular envío de email
            const result = await sendRecoveryEmail(email);
            
            // Mostrar mensaje de éxito
            showNotification(result.message, 'success');
            
            // Limpiar formulario
            emailInput.value = '';
            
            // Mostrar información adicional
            setTimeout(() => {
                showNotification('Revisa tu bandeja de entrada y carpeta de spam', 'info');
            }, 2000);
            
            // Redirigir al login después de un delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 4000);
            
        } catch (error) {
            console.error('Error al enviar email:', error);
            showNotification(error.message || 'Error al enviar el email', 'error');
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== FUNCIONALIDADES ADICIONALES ==========

// Auto-focus en el campo de email
document.addEventListener('DOMContentLoaded', () => {
    if (emailInput) {
        emailInput.focus();
    }
});

// Verificar si ya está logueado
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            showNotification('Ya estás logueado', 'info');
            setTimeout(() => {
                if (user.type === 'cliente') {
                    window.location.href = 'cliente-perfil.html';
                } else if (user.type === 'chofer') {
                    window.location.href = 'chofer-perfil.html';
                }
            }, 1000);
        }
    }
});
