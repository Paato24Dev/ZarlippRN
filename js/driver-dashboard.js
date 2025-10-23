// ========== DASHBOARD DE CONDUCTORES AVANZADO ==========

class DriverDashboard {
    constructor() {
        this.isOnline = false;
        this.startTime = null;
        this.todayEarnings = 0;
        this.todayTrips = 0;
        this.driverRating = 4.8;
        this.availableTrips = [];
        this.activeTrips = [];
        this.tripHistory = [];
        
        this.init();
    }

    init() {
        this.loadDriverData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadAvailableTrips();
        this.loadTripHistory();
    }

    loadDriverData() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.nombre && user.apellido) {
            document.getElementById('driver-full-name').textContent = `${user.nombre} ${user.apellido}`;
            document.getElementById('driver-avatar').textContent = user.nombre.charAt(0) + user.apellido.charAt(0);
        }
    }

    setupEventListeners() {
        // Toggle de estado online/offline
        const statusToggle = document.querySelector('.toggle-input');
        if (statusToggle) {
            statusToggle.addEventListener('change', (e) => {
                this.toggleOnlineStatus(e.target.checked);
            });
        }

        // Botones del mapa
        const refreshMapBtn = document.getElementById('refresh-map');
        const centerMapBtn = document.getElementById('center-map');
        
        if (refreshMapBtn) {
            refreshMapBtn.addEventListener('click', () => this.refreshMap());
        }
        
        if (centerMapBtn) {
            centerMapBtn.addEventListener('click', () => this.centerMap());
        }

        // Filtro de historial
        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', (e) => {
                this.filterTripHistory(e.target.value);
            });
        }
    }

    toggleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        const statusLabel = document.getElementById('status-label');
        
        if (isOnline) {
            this.startTime = new Date();
            statusLabel.textContent = 'En línea';
            statusLabel.style.color = 'var(--primary-yellow)';
            this.startRealTimeUpdates();
            this.loadAvailableTrips();
            showNotification('🚗 Estás en línea. Los viajes aparecerán aquí.', 'success');
        } else {
            statusLabel.textContent = 'Desconectado';
            statusLabel.style.color = 'var(--text-gray)';
            this.stopRealTimeUpdates();
            showNotification('📴 Te has desconectado.', 'info');
        }
    }

    startRealTimeUpdates() {
        if (!this.isOnline) return;

        // Actualizar tiempo online cada segundo
        this.onlineTimeInterval = setInterval(() => {
            this.updateOnlineTime();
        }, 1000);

        // Actualizar viajes disponibles cada 30 segundos
        this.tripsInterval = setInterval(() => {
            this.loadAvailableTrips();
        }, 30000);

        // Simular nuevos viajes cada 2 minutos
        this.newTripsInterval = setInterval(() => {
            this.simulateNewTrip();
        }, 120000);
    }

    stopRealTimeUpdates() {
        if (this.onlineTimeInterval) clearInterval(this.onlineTimeInterval);
        if (this.tripsInterval) clearInterval(this.tripsInterval);
        if (this.newTripsInterval) clearInterval(this.newTripsInterval);
    }

    updateOnlineTime() {
        if (!this.startTime) return;
        
        const now = new Date();
        const diffMs = now - this.startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        const timeElement = document.getElementById('online-time');
        if (timeElement) {
            timeElement.textContent = `${diffHours}h ${diffMinutes}m`;
        }
    }

    loadAvailableTrips() {
        if (!this.isOnline) return;

        // Simular viajes disponibles
        const trips = this.generateMockTrips();
        this.availableTrips = trips;
        this.renderAvailableTrips(trips);
    }

    generateMockTrips() {
        const tripTypes = ['passenger', 'package'];
        const origins = [
            'Centro de Neuquén',
            'Barrio Norte',
            'Barrio Sur',
            'Zona Oeste',
            'Zona Este',
            'Catriel, Río Negro',
            'Centenario',
            'Plottier'
        ];
        const destinations = [
            'Aeropuerto Internacional',
            'Terminal de Ómnibus',
            'Hospital Castro Rendón',
            'Mall Plaza Norte',
            'Universidad Nacional del Comahue',
            'Centro de Neuquén',
            'Barrio Norte',
            'Barrio Sur'
        ];

        const trips = [];
        const numTrips = Math.floor(Math.random() * 3) + 1; // 1-3 viajes

        for (let i = 0; i < numTrips; i++) {
            const type = tripTypes[Math.floor(Math.random() * tripTypes.length)];
            const origin = origins[Math.floor(Math.random() * origins.length)];
            let destination = destinations[Math.floor(Math.random() * destinations.length)];
            
            // Evitar que origen y destino sean iguales
            while (destination === origin) {
                destination = destinations[Math.floor(Math.random() * destinations.length)];
            }

            const distance = Math.random() * 15 + 2; // 2-17 km
            const basePrice = type === 'passenger' ? 4000 : 3500;
            const price = Math.round(basePrice + (distance - 5) * 800);

            trips.push({
                id: `trip_${Date.now()}_${i}`,
                type: type,
                origin: origin,
                destination: destination,
                price: price,
                distance: distance,
                estimatedTime: Math.round(distance * 2 + Math.random() * 5), // minutos
                passengerName: type === 'passenger' ? this.generateRandomName() : null,
                packageWeight: type === 'package' ? Math.floor(Math.random() * 25) + 1 : null
            });
        }

        return trips;
    }

    generateRandomName() {
        const names = ['María', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Diego', 'Laura', 'Miguel'];
        const surnames = ['González', 'Rodríguez', 'Martínez', 'López', 'García', 'Fernández', 'Pérez', 'Sánchez'];
        
        const name = names[Math.floor(Math.random() * names.length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        
        return `${name} ${surname}`;
    }

    renderAvailableTrips(trips) {
        const container = document.getElementById('available-trips');
        if (!container) return;

        if (trips.length === 0) {
            container.innerHTML = `
                <div class="no-trips">
                    <div class="no-trips-icon">🚗</div>
                    <p>No hay viajes disponibles en este momento</p>
                    <small>Los viajes aparecerán aquí cuando estén disponibles</small>
                </div>
            `;
            return;
        }

        container.innerHTML = trips.map(trip => `
            <div class="available-trip-card" data-trip-id="${trip.id}">
                <div class="trip-header">
                    <span class="trip-badge ${trip.type === 'passenger' ? 'passenger-badge' : 'package-badge'}">
                        ${trip.type === 'passenger' ? '👤 Pasajero' : '📦 Encomienda'}
                    </span>
                    <span class="trip-price">$${trip.price.toLocaleString()}</span>
                </div>
                
                <div class="trip-route">
                    <div class="route-item">
                        <span class="route-icon origin">📍</span>
                        <span>${trip.origin}</span>
                    </div>
                    <div class="route-item">
                        <span class="route-icon destination">🎯</span>
                        <span>${trip.destination}</span>
                    </div>
                </div>
                
                <div class="trip-details">
                    <div class="detail-item">
                        <span>Distancia:</span>
                        <span>${trip.distance.toFixed(1)} km</span>
                    </div>
                    <div class="detail-item">
                        <span>Tiempo estimado:</span>
                        <span>${trip.estimatedTime} min</span>
                    </div>
                    ${trip.passengerName ? `
                        <div class="detail-item">
                            <span>Pasajero:</span>
                            <span>${trip.passengerName}</span>
                        </div>
                    ` : ''}
                    ${trip.packageWeight ? `
                        <div class="detail-item">
                            <span>Peso:</span>
                            <span>${trip.packageWeight} kg</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="trip-actions">
                    <button class="btn-secondary" onclick="driverDashboard.rejectTrip('${trip.id}')">
                        Rechazar
                    </button>
                    <button class="btn-primary" onclick="driverDashboard.acceptTrip('${trip.id}')">
                        Aceptar Viaje
                    </button>
                </div>
            </div>
        `).join('');
    }

    acceptTrip(tripId) {
        const trip = this.availableTrips.find(t => t.id === tripId);
        if (!trip) return;

        // Mover a viajes activos
        this.activeTrips.push({
            ...trip,
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            estimatedArrival: new Date(Date.now() + trip.estimatedTime * 60000).toISOString()
        });

        // Remover de disponibles
        this.availableTrips = this.availableTrips.filter(t => t.id !== tripId);

        // Actualizar UI
        this.renderAvailableTrips(this.availableTrips);
        this.renderActiveTrips();
        this.updateStats();

        showNotification(`✅ Viaje aceptado. Tiempo estimado: ${trip.estimatedTime} minutos`, 'success');

        // Simular llegada del conductor
        setTimeout(() => {
            this.simulateDriverArrival(tripId);
        }, trip.estimatedTime * 60000);
    }

    rejectTrip(tripId) {
        this.availableTrips = this.availableTrips.filter(t => t.id !== tripId);
        this.renderAvailableTrips(this.availableTrips);
        showNotification('❌ Viaje rechazado', 'info');
    }

    simulateDriverArrival(tripId) {
        const activeTrip = this.activeTrips.find(t => t.id === tripId);
        if (!activeTrip) return;

        activeTrip.status = 'arrived';
        showNotification(`📍 Has llegado a ${activeTrip.origin}. Esperando al pasajero...`, 'info');

        // Simular inicio del viaje
        setTimeout(() => {
            this.simulateTripStart(tripId);
        }, 30000); // 30 segundos
    }

    simulateTripStart(tripId) {
        const activeTrip = this.activeTrips.find(t => t.id === tripId);
        if (!activeTrip) return;

        activeTrip.status = 'in_progress';
        activeTrip.startedAt = new Date().toISOString();
        showNotification(`🚗 Viaje en curso hacia ${activeTrip.destination}`, 'info');

        // Simular finalización del viaje
        setTimeout(() => {
            this.completeTrip(tripId);
        }, activeTrip.estimatedTime * 60000);
    }

    completeTrip(tripId) {
        const activeTrip = this.activeTrips.find(t => t.id === tripId);
        if (!activeTrip) return;

        // Mover a historial
        const completedTrip = {
            ...activeTrip,
            status: 'completed',
            completedAt: new Date().toISOString(),
            earnings: activeTrip.price * 0.8 // 80% para el conductor
        };

        this.tripHistory.unshift(completedTrip);
        this.activeTrips = this.activeTrips.filter(t => t.id !== tripId);

        // Actualizar estadísticas
        this.todayEarnings += completedTrip.earnings;
        this.todayTrips++;

        this.renderActiveTrips();
        this.renderTripHistory();
        this.updateStats();

        showNotification(`💰 Viaje completado! Ganaste $${completedTrip.earnings.toLocaleString()}`, 'success');
    }

    renderActiveTrips() {
        const container = document.getElementById('active-trips-list');
        if (!container) return;

        if (this.activeTrips.length === 0) {
            container.innerHTML = `
                <div class="no-active-trips">
                    <div class="no-trips-icon">🚗</div>
                    <p>No tienes viajes activos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.activeTrips.map(trip => `
            <div class="active-trip-card">
                <div class="trip-status ${trip.status}">
                    <span class="status-icon">
                        ${trip.status === 'accepted' ? '⏳' : trip.status === 'arrived' ? '📍' : '🚗'}
                    </span>
                    <span class="status-text">
                        ${trip.status === 'accepted' ? 'En camino' : trip.status === 'arrived' ? 'Esperando' : 'En viaje'}
                    </span>
                </div>
                
                <div class="trip-info">
                    <div class="route-info">
                        <span class="origin">${trip.origin}</span>
                        <span class="arrow">→</span>
                        <span class="destination">${trip.destination}</span>
                    </div>
                    <div class="trip-price">$${trip.price.toLocaleString()}</div>
                </div>
                
                <div class="trip-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getTripProgress(trip)}%"></div>
                    </div>
                    <span class="progress-text">${this.getTripProgressText(trip)}</span>
                </div>
            </div>
        `).join('');
    }

    getTripProgress(trip) {
        if (trip.status === 'accepted') return 25;
        if (trip.status === 'arrived') return 50;
        if (trip.status === 'in_progress') return 75;
        return 100;
    }

    getTripProgressText(trip) {
        if (trip.status === 'accepted') return 'Dirigiéndote al origen';
        if (trip.status === 'arrived') return 'Esperando al pasajero';
        if (trip.status === 'in_progress') return 'Viaje en curso';
        return 'Completado';
    }

    loadTripHistory() {
        // Cargar historial desde localStorage o generar datos de ejemplo
        const savedHistory = JSON.parse(localStorage.getItem('driverTripHistory') || '[]');
        
        if (savedHistory.length === 0) {
            // Generar historial de ejemplo
            this.tripHistory = this.generateMockHistory();
        } else {
            this.tripHistory = savedHistory;
        }

        this.renderTripHistory();
    }

    generateMockHistory() {
        const history = [];
        const today = new Date();
        
        for (let i = 0; i < 15; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            
            const trip = this.generateMockTrips()[0];
            history.push({
                ...trip,
                status: 'completed',
                completedAt: date.toISOString(),
                earnings: trip.price * 0.8,
                rating: 4.5 + Math.random() * 0.5
            });
        }
        
        return history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    }

    renderTripHistory() {
        const container = document.getElementById('trip-history-list');
        if (!container) return;

        const filteredHistory = this.getFilteredHistory();
        
        if (filteredHistory.length === 0) {
            container.innerHTML = `
                <div class="no-history">
                    <div class="no-trips-icon">📋</div>
                    <p>No hay viajes en este período</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredHistory.map(trip => `
            <div class="history-trip-card">
                <div class="trip-date">
                    ${new Date(trip.completedAt).toLocaleDateString()}
                </div>
                
                <div class="trip-route">
                    <div class="route-item">
                        <span class="route-icon">📍</span>
                        <span>${trip.origin}</span>
                    </div>
                    <div class="route-item">
                        <span class="route-icon">🎯</span>
                        <span>${trip.destination}</span>
                    </div>
                </div>
                
                <div class="trip-summary">
                    <div class="summary-item">
                        <span class="label">Ganancia:</span>
                        <span class="value earnings">$${trip.earnings.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Calificación:</span>
                        <span class="value rating">${trip.rating.toFixed(1)} ⭐</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFilteredHistory() {
        const filter = document.getElementById('history-filter')?.value || 'today';
        const now = new Date();
        
        return this.tripHistory.filter(trip => {
            const tripDate = new Date(trip.completedAt);
            
            switch (filter) {
                case 'today':
                    return tripDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return tripDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return tripDate >= monthAgo;
                case 'all':
                default:
                    return true;
            }
        });
    }

    filterTripHistory(filter) {
        this.renderTripHistory();
    }

    updateStats() {
        document.getElementById('today-earnings').textContent = `$${this.todayEarnings.toLocaleString()}`;
        document.getElementById('today-trips').textContent = this.todayTrips.toString();
        document.getElementById('driver-rating').textContent = this.driverRating.toFixed(1);
    }

    refreshMap() {
        showNotification('🔄 Actualizando mapa...', 'info');
        this.loadAvailableTrips();
    }

    centerMap() {
        showNotification('🎯 Centrando en tu ubicación...', 'info');
    }

    simulateNewTrip() {
        if (!this.isOnline || this.availableTrips.length >= 3) return;
        
        const newTrip = this.generateMockTrips()[0];
        this.availableTrips.push(newTrip);
        this.renderAvailableTrips(this.availableTrips);
        
        showNotification(`🚗 Nuevo viaje disponible: ${newTrip.origin} → ${newTrip.destination}`, 'info');
    }
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.driverDashboard = new DriverDashboard();
});
