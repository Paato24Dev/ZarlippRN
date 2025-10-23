// ========== SISTEMA DE ANALYTICS Y MÉTRICAS ==========

class AnalyticsSystem {
    constructor() {
        this.events = [];
        this.metrics = {};
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.pageViews = 0;
        this.userInteractions = 0;
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        this.startSessionTracking();
        this.loadStoredMetrics();
    }

    // ========== GENERACIÓN DE IDS ==========
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== TRACKING DE PÁGINAS ==========
    trackPageView(page = window.location.pathname) {
        const pageView = {
            id: this.generateEventId(),
            type: 'page_view',
            page: page,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };

        this.events.push(pageView);
        this.pageViews++;
        this.saveMetrics();
        
        console.log('Analytics: Página vista', pageView);
    }

    // ========== TRACKING DE EVENTOS ==========
    trackEvent(eventName, properties = {}) {
        const event = {
            id: this.generateEventId(),
            type: 'custom_event',
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname
        };

        this.events.push(event);
        this.userInteractions++;
        this.saveMetrics();
        
        console.log('Analytics: Evento', event);
    }

    // ========== TRACKING DE USUARIOS ==========
    trackUser(userData) {
        const userEvent = {
            id: this.generateEventId(),
            type: 'user_identification',
            userId: userData.id || 'anonymous',
            userType: userData.type || 'unknown',
            properties: userData,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        this.events.push(userEvent);
        this.saveMetrics();
        
        console.log('Analytics: Usuario identificado', userEvent);
    }

    // ========== TRACKING DE CONVERSIONES ==========
    trackConversion(conversionType, value = 0, properties = {}) {
        const conversion = {
            id: this.generateEventId(),
            type: 'conversion',
            conversionType: conversionType,
            value: value,
            properties: properties,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname
        };

        this.events.push(conversion);
        this.saveMetrics();
        
        console.log('Analytics: Conversión', conversion);
    }

    // ========== TRACKING DE ERRORES ==========
    trackError(error, context = {}) {
        const errorEvent = {
            id: this.generateEventId(),
            type: 'error',
            errorMessage: error.message || error,
            errorStack: error.stack || '',
            context: context,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        this.events.push(errorEvent);
        this.saveMetrics();
        
        console.error('Analytics: Error trackeado', errorEvent);
    }

    // ========== TRACKING DE PERFORMANCE ==========
    trackPerformance(metricName, value, unit = 'ms') {
        const performanceEvent = {
            id: this.generateEventId(),
            type: 'performance',
            metricName: metricName,
            value: value,
            unit: unit,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            page: window.location.pathname
        };

        this.events.push(performanceEvent);
        this.saveMetrics();
        
        console.log('Analytics: Performance', performanceEvent);
    }

    // ========== CONFIGURACIÓN DE EVENT LISTENERS ==========
    setupEventListeners() {
        // Tracking de clicks en botones
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn-primary, .btn-secondary, a[href]')) {
                this.trackEvent('button_click', {
                    element: e.target.tagName,
                    text: e.target.textContent?.trim(),
                    href: e.target.href || null,
                    className: e.target.className
                });
            }
        });

        // Tracking de formularios
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id,
                formAction: e.target.action,
                formMethod: e.target.method
            });
        });

        // Tracking de cambios en inputs
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.trackEvent('form_field_change', {
                    fieldType: e.target.type || e.target.tagName,
                    fieldName: e.target.name,
                    fieldId: e.target.id
                });
            }
        });

        // Tracking de scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackEvent('page_scroll', {
                    scrollY: window.scrollY,
                    scrollPercentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
                });
            }, 1000);
        });

        // Tracking de tiempo en página
        this.trackTimeOnPage();

        // Tracking de errores JavaScript
        window.addEventListener('error', (e) => {
            this.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Tracking de errores de Promise
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e.reason, {
                type: 'unhandled_promise_rejection'
            });
        });
    }

    // ========== TRACKING DE TIEMPO ==========
    trackTimeOnPage() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - startTime;
            this.trackPerformance('time_on_page', timeOnPage);
        });

        // Tracking cada 30 segundos
        setInterval(() => {
            const timeOnPage = Date.now() - startTime;
            this.trackPerformance('time_on_page_periodic', timeOnPage);
        }, 30000);
    }

    // ========== TRACKING DE SESIÓN ==========
    startSessionTracking() {
        // Duración de sesión
        setInterval(() => {
            const sessionDuration = Date.now() - this.startTime;
            this.trackPerformance('session_duration', sessionDuration);
        }, 60000); // Cada minuto

        // Tracking de actividad
        let lastActivity = Date.now();
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            });
        });

        // Detectar inactividad
        setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (timeSinceLastActivity > 300000) { // 5 minutos
                this.trackEvent('user_inactive', {
                    inactiveTime: timeSinceLastActivity
                });
            }
        }, 60000);
    }

    // ========== MÉTRICAS ESPECÍFICAS DE NEGOCIO ==========
    
    // Tracking de viajes
    trackTripRequest(tripData) {
        this.trackEvent('trip_requested', {
            from: tripData.from,
            to: tripData.to,
            type: tripData.type || 'passenger',
            estimatedPrice: tripData.price
        });
    }

    trackTripCompleted(tripData) {
        this.trackConversion('trip_completed', tripData.price, {
            tripId: tripData.id,
            duration: tripData.duration,
            distance: tripData.distance,
            driverId: tripData.driverId
        });
    }

    // Tracking de pagos
    trackPaymentInitiated(paymentData) {
        this.trackEvent('payment_initiated', {
            amount: paymentData.amount,
            method: paymentData.method,
            tripId: paymentData.tripId
        });
    }

    trackPaymentCompleted(paymentData) {
        this.trackConversion('payment_completed', paymentData.amount, {
            transactionId: paymentData.transactionId,
            method: paymentData.method,
            tripId: paymentData.tripId
        });
    }

    // Tracking de registro
    trackUserRegistration(userData) {
        this.trackConversion('user_registration', 0, {
            userType: userData.type,
            registrationMethod: userData.method || 'form'
        });
    }

    // Tracking de login
    trackUserLogin(userData) {
        this.trackEvent('user_login', {
            userType: userData.type,
            loginMethod: userData.method || 'form'
        });
    }

    // ========== ALMACENAMIENTO ==========
    saveMetrics() {
        const metricsData = {
            sessionId: this.sessionId,
            startTime: this.startTime,
            pageViews: this.pageViews,
            userInteractions: this.userInteractions,
            events: this.events.slice(-100), // Mantener solo los últimos 100 eventos
            lastUpdated: Date.now()
        };

        localStorage.setItem('zarlipprn_analytics', JSON.stringify(metricsData));
    }

    loadStoredMetrics() {
        try {
            const stored = localStorage.getItem('zarlipprn_analytics');
            if (stored) {
                const data = JSON.parse(stored);
                this.metrics = data;
                
                // Si es la misma sesión, continuar contando
                if (data.sessionId === this.sessionId) {
                    this.pageViews = data.pageViews || 0;
                    this.userInteractions = data.userInteractions || 0;
                    this.events = data.events || [];
                }
            }
        } catch (error) {
            console.error('Error cargando métricas:', error);
        }
    }

    // ========== REPORTES ==========
    getSessionReport() {
        const sessionDuration = Date.now() - this.startTime;
        const eventsByType = this.events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});

        return {
            sessionId: this.sessionId,
            duration: sessionDuration,
            pageViews: this.pageViews,
            userInteractions: this.userInteractions,
            eventsByType: eventsByType,
            totalEvents: this.events.length,
            currentPage: window.location.pathname,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    getConversionReport() {
        const conversions = this.events.filter(event => event.type === 'conversion');
        const conversionTypes = conversions.reduce((acc, conversion) => {
            if (!acc[conversion.conversionType]) {
                acc[conversion.conversionType] = {
                    count: 0,
                    totalValue: 0,
                    averageValue: 0
                };
            }
            acc[conversion.conversionType].count++;
            acc[conversion.conversionType].totalValue += conversion.value;
            acc[conversion.conversionType].averageValue = 
                acc[conversion.conversionType].totalValue / acc[conversion.conversionType].count;
            return acc;
        }, {});

        return {
            totalConversions: conversions.length,
            conversionTypes: conversionTypes,
            totalValue: conversions.reduce((sum, c) => sum + c.value, 0)
        };
    }

    getErrorReport() {
        const errors = this.events.filter(event => event.type === 'error');
        const errorTypes = errors.reduce((acc, error) => {
            const errorType = error.errorMessage || 'Unknown Error';
            acc[errorType] = (acc[errorType] || 0) + 1;
            return acc;
        }, {});

        return {
            totalErrors: errors.length,
            errorTypes: errorTypes,
            recentErrors: errors.slice(-10)
        };
    }

    // ========== EXPORTAR DATOS ==========
    exportData() {
        const data = {
            sessionReport: this.getSessionReport(),
            conversionReport: this.getConversionReport(),
            errorReport: this.getErrorReport(),
            allEvents: this.events,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zarlipprn-analytics-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== LIMPIAR DATOS ==========
    clearData() {
        this.events = [];
        this.pageViews = 0;
        this.userInteractions = 0;
        localStorage.removeItem('zarlipprn_analytics');
        console.log('Analytics: Datos limpiados');
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsSystem();
    
    // Tracking automático de eventos específicos
    document.addEventListener('tripRequested', (e) => {
        window.analytics.trackTripRequest(e.detail);
    });
    
    document.addEventListener('tripCompleted', (e) => {
        window.analytics.trackTripCompleted(e.detail);
    });
    
    document.addEventListener('paymentInitiated', (e) => {
        window.analytics.trackPaymentInitiated(e.detail);
    });
    
    document.addEventListener('paymentCompleted', (e) => {
        window.analytics.trackPaymentCompleted(e.detail);
    });
    
    document.addEventListener('userRegistered', (e) => {
        window.analytics.trackUserRegistration(e.detail);
    });
    
    document.addEventListener('userLoggedIn', (e) => {
        window.analytics.trackUserLogin(e.detail);
    });
});
