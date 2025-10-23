// ========== SISTEMA DE NOTIFICACIONES PUSH ==========

class NotificationSystem {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.serviceWorker = null;
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.log('Notificaciones no soportadas');
            return;
        }

        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', this.serviceWorker);
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
            }
        }

        // Verificar permisos
        this.checkPermission();
    }

    async requestPermission() {
        if (!this.isSupported) return false;
        
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        
        return this.permission === 'granted';
    }

    checkPermission() {
        if (this.permission === 'granted') {
            this.showInstallPrompt();
        }
    }

    async showInstallPrompt() {
        // Detectar si la app puede ser instalada
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallBanner(deferredPrompt);
        });

        // Detectar si ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App ya está instalada');
        }
    }

    showInstallBanner(deferredPrompt) {
        const banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>Instalar ZarlippRN</h3>
                    <p>Acceso rápido desde tu pantalla de inicio</p>
                </div>
                <div class="install-actions">
                    <button class="btn-secondary" onclick="this.closest('.install-banner').remove()">Ahora no</button>
                    <button class="btn-primary" onclick="notificationSystem.installApp(this.closest('.install-banner'))">Instalar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 10000);
    }

    async installApp(banner) {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                showNotification('¡App instalada correctamente!', 'success');
            }
            
            window.deferredPrompt = null;
            banner.remove();
        }
    }

    // ========== NOTIFICACIONES SIMULADAS ==========
    
    async sendNotification(title, options = {}) {
        if (!await this.requestPermission()) {
            console.log('Permisos de notificación denegados');
            return;
        }

        const defaultOptions = {
            body: options.body || '',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: Date.now()
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver',
                    icon: '/icons/action-view.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: '/icons/action-close.png'
                }
            ]
        };

        if (this.serviceWorker && this.serviceWorker.active) {
            this.serviceWorker.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                options: { ...defaultOptions, ...options }
            });
        } else {
            new Notification(title, { ...defaultOptions, ...options });
        }
    }

    // ========== NOTIFICACIONES ESPECÍFICAS ==========
    
    notifyTripAssigned(tripData) {
        this.sendNotification('🚗 Viaje Asignado', {
            body: `Conductor: ${tripData.driverName} - ${tripData.carModel}`,
            tag: 'trip-assigned',
            requireInteraction: true
        });
    }

    notifyDriverArrived(driverData) {
        this.sendNotification('📍 Conductor Llegó', {
            body: `${driverData.driverName} está esperando en ${driverData.location}`,
            tag: 'driver-arrived',
            requireInteraction: true
        });
    }

    notifyPaymentSuccess(amount) {
        this.sendNotification('💰 Pago Exitoso', {
            body: `Se procesó el pago de $${amount.toLocaleString()}`,
            tag: 'payment-success'
        });
    }

    notifyPromotion(promotion) {
        this.sendNotification('🎉 Nueva Promoción', {
            body: promotion.description,
            tag: 'promotion',
            requireInteraction: true
        });
    }

    notifyMaintenance() {
        this.sendNotification('🔧 Mantenimiento Programado', {
            body: 'La app estará en mantenimiento el domingo de 2-4 AM',
            tag: 'maintenance'
        });
    }

    // ========== NOTIFICACIONES PROGRAMADAS ==========
    
    scheduleNotification(title, body, delay) {
        setTimeout(() => {
            this.sendNotification(title, { body });
        }, delay);
    }

    scheduleReminder(message, delay) {
        this.scheduleNotification('⏰ Recordatorio', message, delay);
    }

    // ========== NOTIFICACIONES DE ESTADO ==========
    
    notifyOnlineStatus() {
        this.sendNotification('🟢 Conectado', {
            body: 'Estás en línea y recibiendo viajes',
            tag: 'online-status'
        });
    }

    notifyOfflineStatus() {
        this.sendNotification('🔴 Desconectado', {
            body: 'Te has desconectado del sistema',
            tag: 'offline-status'
        });
    }

    // ========== NOTIFICACIONES DE CALIFICACIÓN ==========
    
    notifyRatingRequest(tripId) {
        this.sendNotification('⭐ Califica tu Viaje', {
            body: '¿Cómo fue tu experiencia? Tu opinión nos ayuda a mejorar',
            tag: 'rating-request',
            requireInteraction: true,
            actions: [
                { action: 'rate-5', title: '⭐⭐⭐⭐⭐' },
                { action: 'rate-4', title: '⭐⭐⭐⭐' },
                { action: 'rate-3', title: '⭐⭐⭐' },
                { action: 'rate-2', title: '⭐⭐' },
                { action: 'rate-1', title: '⭐' }
            ]
        });
    }

    // ========== NOTIFICACIONES DE SEGURIDAD ==========
    
    notifySecurityAlert(type, details) {
        this.sendNotification('🚨 Alerta de Seguridad', {
            body: `Actividad sospechosa detectada: ${details}`,
            tag: 'security-alert',
            requireInteraction: true
        });
    }

    // ========== NOTIFICACIONES DE SOPORTE ==========
    
    notifySupportResponse(ticketId) {
        this.sendNotification('💬 Respuesta de Soporte', {
            body: `Hemos respondido tu consulta #${ticketId}`,
            tag: 'support-response'
        });
    }

    // ========== CONFIGURACIÓN ==========
    
    setNotificationPreferences(preferences) {
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    }

    getNotificationPreferences() {
        return JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
    }

    // ========== LIMPIAR NOTIFICACIONES ==========
    
    clearAllNotifications() {
        if ('serviceWorker' in navigator && this.serviceWorker) {
            this.serviceWorker.active.postMessage({
                type: 'CLEAR_NOTIFICATIONS'
            });
        }
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
    
    // Escuchar eventos personalizados
    document.addEventListener('tripAssigned', (e) => {
        window.notificationSystem.notifyTripAssigned(e.detail);
    });
    
    document.addEventListener('driverArrived', (e) => {
        window.notificationSystem.notifyDriverArrived(e.detail);
    });
    
    document.addEventListener('paymentSuccess', (e) => {
        window.notificationSystem.notifyPaymentSuccess(e.detail.amount);
    });
});
