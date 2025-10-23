// ========== SISTEMA DE PAGOS SIMULADO ==========

class PaymentSystem {
    constructor() {
        this.paymentMethods = [
            { id: 'mercadopago', name: 'Mercado Pago', icon: '💳', type: 'digital' },
            { id: 'cash', name: 'Efectivo', icon: '💵', type: 'cash' },
            { id: 'card', name: 'Tarjeta de Débito/Crédito', icon: '💳', type: 'card' },
            { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏦', type: 'transfer' }
        ];
        this.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    }

    // Mostrar modal de pagos
    showPaymentModal(tripData) {
        const modal = this.createPaymentModal(tripData);
        document.body.appendChild(modal);
        this.animateModalIn(modal);
    }

    // Crear modal de pagos
    createPaymentModal(tripData) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-overlay"></div>
            <div class="payment-modal-content">
                <div class="payment-header">
                    <h2>💳 Método de Pago</h2>
                    <button class="payment-close" onclick="this.closest('.payment-modal').remove()">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div class="trip-summary">
                    <div class="trip-route">
                        <div class="route-point">
                            <div class="route-icon origin">📍</div>
                            <span>${tripData.from}</span>
                        </div>
                        <div class="route-line"></div>
                        <div class="route-point">
                            <div class="route-icon destination">🎯</div>
                            <span>${tripData.to}</span>
                        </div>
                    </div>
                    <div class="trip-price">
                        <span class="price-label">Total a pagar:</span>
                        <span class="price-amount">$${tripData.price.toLocaleString()}</span>
                    </div>
                </div>

                <div class="payment-methods">
                    <h3>Selecciona tu método de pago:</h3>
                    <div class="methods-grid">
                        ${this.paymentMethods.map(method => `
                            <div class="payment-method" data-method="${method.id}">
                                <div class="method-icon">${method.icon}</div>
                                <div class="method-name">${method.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="payment-actions">
                    <button class="btn-secondary payment-cancel">Cancelar</button>
                    <button class="btn-primary payment-confirm" disabled>Confirmar Pago</button>
                </div>
            </div>
        `;

        this.setupPaymentModalEvents(modal, tripData);
        return modal;
    }

    // Configurar eventos del modal
    setupPaymentModalEvents(modal, tripData) {
        const methods = modal.querySelectorAll('.payment-method');
        const confirmBtn = modal.querySelector('.payment-confirm');
        const cancelBtn = modal.querySelector('.payment-cancel');
        const overlay = modal.querySelector('.payment-modal-overlay');

        let selectedMethod = null;

        methods.forEach(method => {
            method.addEventListener('click', () => {
                methods.forEach(m => m.classList.remove('selected'));
                method.classList.add('selected');
                selectedMethod = method.dataset.method;
                confirmBtn.disabled = false;
            });
        });

        confirmBtn.addEventListener('click', () => {
            if (selectedMethod) {
                this.processPayment(tripData, selectedMethod, modal);
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        overlay.addEventListener('click', () => {
            modal.remove();
        });
    }

    // Procesar pago
    async processPayment(tripData, methodId, modal) {
        const confirmBtn = modal.querySelector('.payment-confirm');
        const originalText = confirmBtn.textContent;
        
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<div class="spinner"></div> Procesando...';

        try {
            // Simular procesamiento de pago
            await this.simulatePaymentProcessing(methodId);
            
            // Crear transacción
            const transaction = {
                id: this.generateTransactionId(),
                tripId: this.generateTripId(),
                amount: tripData.price,
                method: methodId,
                status: 'completed',
                timestamp: new Date().toISOString(),
                tripData: tripData
            };

            this.transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(this.transactions));

            // Mostrar confirmación
            this.showPaymentConfirmation(transaction, modal);

        } catch (error) {
            showNotification('Error procesando el pago. Intenta nuevamente.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalText;
        }
    }

    // Simular procesamiento de pago
    simulatePaymentProcessing(methodId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular fallo ocasional (5% de probabilidad)
                if (Math.random() < 0.05) {
                    reject(new Error('Payment failed'));
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    // Mostrar confirmación de pago
    showPaymentConfirmation(transaction, modal) {
        modal.innerHTML = `
            <div class="payment-modal-overlay"></div>
            <div class="payment-modal-content success">
                <div class="success-animation">
                    <div class="success-icon">✅</div>
                    <h2>¡Pago Exitoso!</h2>
                </div>
                
                <div class="transaction-details">
                    <div class="detail-item">
                        <span class="detail-label">Número de transacción:</span>
                        <span class="detail-value">#${transaction.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Monto:</span>
                        <span class="detail-value">$${transaction.amount.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Método:</span>
                        <span class="detail-value">${this.paymentMethods.find(m => m.id === transaction.method)?.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha:</span>
                        <span class="detail-value">${new Date(transaction.timestamp).toLocaleString()}</span>
                    </div>
                </div>

                <div class="success-message">
                    <p>Tu conductor será asignado en breve. Te enviaremos una notificación cuando esté en camino.</p>
                </div>

                <div class="payment-actions">
                    <button class="btn-primary payment-close" onclick="this.closest('.payment-modal').remove()">
                        Continuar
                    </button>
                </div>
            </div>
        `;

        // Simular asignación de conductor
        setTimeout(() => {
            this.simulateDriverAssignment(transaction);
        }, 3000);
    }

    // Simular asignación de conductor
    simulateDriverAssignment(transaction) {
        const drivers = [
            { name: 'Carlos Mendoza', rating: 4.8, car: 'Toyota Corolla', plate: 'ABC-123' },
            { name: 'María González', rating: 4.9, car: 'Chevrolet Onix', plate: 'DEF-456' },
            { name: 'Roberto Silva', rating: 4.7, car: 'Volkswagen Gol', plate: 'GHI-789' }
        ];

        const assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];
        
        showNotification(`🚗 Conductor asignado: ${assignedDriver.name} (${assignedDriver.car})`, 'success');
        
        // Simular llegada del conductor
        setTimeout(() => {
            showNotification(`📍 ${assignedDriver.name} está en camino. Tiempo estimado: 5-8 minutos`, 'info');
        }, 10000);
    }

    // Generar ID de transacción
    generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Generar ID de viaje
    generateTripId() {
        return 'TRIP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Animar entrada del modal
    animateModalIn(modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        
        requestAnimationFrame(() => {
            modal.style.transition = 'all 0.3s ease';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
    }

    // Obtener historial de transacciones
    getTransactionHistory() {
        return this.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Obtener estadísticas de pagos
    getPaymentStats() {
        const stats = {
            totalTransactions: this.transactions.length,
            totalAmount: this.transactions.reduce((sum, t) => sum + t.amount, 0),
            methodBreakdown: {},
            monthlyStats: {}
        };

        this.transactions.forEach(transaction => {
            // Métodos de pago
            if (!stats.methodBreakdown[transaction.method]) {
                stats.methodBreakdown[transaction.method] = { count: 0, amount: 0 };
            }
            stats.methodBreakdown[transaction.method].count++;
            stats.methodBreakdown[transaction.method].amount += transaction.amount;

            // Estadísticas mensuales
            const month = new Date(transaction.timestamp).toISOString().substr(0, 7);
            if (!stats.monthlyStats[month]) {
                stats.monthlyStats[month] = { count: 0, amount: 0 };
            }
            stats.monthlyStats[month].count++;
            stats.monthlyStats[month].amount += transaction.amount;
        });

        return stats;
    }
}

// Instancia global del sistema de pagos
window.paymentSystem = new PaymentSystem();
