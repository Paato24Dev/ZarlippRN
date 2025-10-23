// ========== JAVASCRIPT PARA PÁGINA DE REGISTRO (registro.html) ==========

document.addEventListener('DOMContentLoaded', () => {
    const btnCliente = document.getElementById('btn-cliente');
    const btnChofer = document.getElementById('btn-chofer');
    const userTypeInput = document.getElementById('userType');
    const registerForm = document.getElementById('register-form');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

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

    // Función para actualizar el estado de los botones
    function updateUserType(type) {
        if (type === 'cliente') {
            btnCliente.classList.add('active');
            btnChofer.classList.remove('active');
            userTypeInput.value = 'cliente';
        } else if (type === 'chofer') {
            btnChofer.classList.add('active');
            btnCliente.classList.remove('active');
            userTypeInput.value = 'chofer';
        }
    }

    // Event Listeners para los botones de tipo de usuario
    if (btnCliente) {
        btnCliente.addEventListener('click', () => updateUserType('cliente'));
    }

    if (btnChofer) {
        btnChofer.addEventListener('click', () => updateUserType('chofer'));
    }

    // Inicializar el tipo de usuario al cargar la página (por defecto 'cliente')
    updateUserType('cliente');

    // ========== INDICADOR DE FORTALEZA DE CONTRASEÑA ==========
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrength(strength);
        });
    }

    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length === 0) {
            return { level: 'none', score: 0, feedback: 'Ingresa una contraseña' };
        }

        if (password.length >= 8) score += 1;
        else feedback.push('Mínimo 8 caracteres');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Agrega minúsculas');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Agrega mayúsculas');

        if (/\d/.test(password)) score += 1;
        else feedback.push('Agrega números');

        if (/[^a-zA-Z\d]/.test(password)) score += 1;
        else feedback.push('Agrega símbolos');

        if (password.length >= 12) score += 1;

        if (score <= 1) return { level: 'weak', score, feedback: 'Muy débil' };
        if (score <= 2) return { level: 'fair', score, feedback: 'Débil' };
        if (score <= 4) return { level: 'good', score, feedback: 'Buena' };
        return { level: 'strong', score, feedback: 'Muy fuerte' };
    }

    function updatePasswordStrength(strength) {
        strengthFill.className = `strength-fill ${strength.level}`;
        strengthText.className = `strength-text ${strength.level}`;
        strengthText.textContent = strength.feedback;
    }

    // Manejo del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar el envío por defecto

            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const gender = document.getElementById('gender').value;
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const userType = userTypeInput.value;

            // Validación mejorada
            if (!validateForm(nombre, apellido, gender, phone, email, password, confirmPassword)) {
                return;
            }

            // Simular registro con validación de email
            showNotification('Validando email...', 'info');
            
            setTimeout(() => {
                // Simular verificación de email
                showNotification(`Cuenta de ${userType} creada exitosamente para ${nombre} ${apellido}.`, 'success');
                showNotification('Se ha enviado un email de confirmación a tu correo.', 'info');

                // Guardar usuario en localStorage (simulación de sesión)
                const user = { 
                    nombre, 
                    apellido, 
                    email, 
                    phone,
                    gender,
                    type: userType, 
                    isLoggedIn: true,
                    emailVerified: false,
                    createdAt: new Date().toISOString(),
                    avatar: generateAvatar(nombre, apellido)
                };
                localStorage.setItem('user', JSON.stringify(user));

                // Redirigir según el tipo de usuario
                setTimeout(() => {
                    if (userType === 'cliente') {
                        window.location.href = 'cliente-perfil.html';
                    } else if (userType === 'chofer') {
                        window.location.href = 'chofer-perfil.html';
                    }
                }, 2000);
            }, 1500);
        });
    }

    // ========== FUNCIONES DE VALIDACIÓN MEJORADAS ==========

    function validateForm(nombre, apellido, gender, phone, email, password, confirmPassword) {
        // Validar campos obligatorios
        if (!nombre || !apellido || !gender || !phone || !email || !password || !confirmPassword) {
            showNotification('Por favor, completa todos los campos.', 'error');
            return false;
        }

        // Validar nombre y apellido
        if (nombre.length < 2 || apellido.length < 2) {
            showNotification('El nombre y apellido deben tener al menos 2 caracteres.', 'error');
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Por favor, ingresa un email válido.', 'error');
            return false;
        }

        // Validar teléfono
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            showNotification('Por favor, ingresa un número de teléfono válido.', 'error');
            return false;
        }

        // Validar contraseña
        if (password.length < 8) {
            showNotification('La contraseña debe tener al menos 8 caracteres.', 'error');
            return false;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showNotification('La contraseña debe contener al menos una mayúscula, una minúscula y un número.', 'error');
            return false;
        }

        // Validar confirmación de contraseña
        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden.', 'error');
            return false;
        }

        return true;
    }

    function generateAvatar(nombre, apellido) {
        const initials = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
        const colors = ['#FFD700', '#8A2BE2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return {
            initials,
            color,
            type: 'initials'
        };
    }

    // ========== FUNCIONES DE UTILIDAD (para notificaciones) ==========

    /**
     * Muestra una notificación temporal en la esquina superior derecha.
     * @param {string} message - El mensaje a mostrar.
     * @param {'success'|'error'|'warning'|'info'} type - El tipo de notificación.
     */
    function showNotification(message, type) {
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
        }, 5000); // La notificación desaparece después de 5 segundos
    }
});