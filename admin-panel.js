// =====================================================
// ZARLIPPRN - PANEL DE ADMINISTRACIÓN
// Desarrollado por PaatoDev
// =====================================================

class AdminPanel {
    
    // Mostrar panel de administración
    static showAdminPanel() {
        if (!currentUser || currentUser.userType !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a este panel.');
            return;
        }
        
        // Crear modal de administración
        const adminModal = document.createElement('div');
        adminModal.className = 'modal';
        adminModal.id = 'admin-modal';
        adminModal.innerHTML = `
            <div class="modal-content admin-modal-content">
                <div class="modal-header">
                    <h2>Panel de Administración - ZarlippRN</h2>
                    <span class="close" onclick="AdminPanel.closeAdminPanel()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="admin-tabs">
                        <button class="admin-tab active" onclick="AdminPanel.showTab('users')">Usuarios</button>
                        <button class="admin-tab" onclick="AdminPanel.showTab('drivers')">Conductores</button>
                        <button class="admin-tab" onclick="AdminPanel.showTab('trips')">Viajes</button>
                        <button class="admin-tab" onclick="AdminPanel.showTab('ratings')">Valoraciones</button>
                        <button class="admin-tab" onclick="AdminPanel.showTab('chat')">Chat</button>
                        <button class="admin-tab" onclick="AdminPanel.showTab('stats')">Estadísticas</button>
                    </div>
                    
                    <div class="admin-content">
                        <div id="admin-users" class="admin-tab-content active">
                            <h3>Usuarios Registrados</h3>
                            <div id="users-list" class="admin-list"></div>
                        </div>
                        
                        <div id="admin-drivers" class="admin-tab-content">
                            <h3>Conductores Activos</h3>
                            <div id="drivers-list" class="admin-list"></div>
                        </div>
                        
                        <div id="admin-trips" class="admin-tab-content">
                            <h3>Historial de Viajes</h3>
                            <div id="trips-list" class="admin-list"></div>
                        </div>
                        
                        <div id="admin-ratings" class="admin-tab-content">
                            <h3>Valoraciones y Comentarios</h3>
                            <div id="ratings-list" class="admin-list"></div>
                        </div>
                        
                        <div id="admin-chat" class="admin-tab-content">
                            <h3>Mensajes del Chat</h3>
                            <div id="chat-list" class="admin-list"></div>
                        </div>
                        
                        <div id="admin-stats" class="admin-tab-content">
                            <h3>Estadísticas Generales</h3>
                            <div id="stats-content" class="admin-stats"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(adminModal);
        adminModal.style.display = 'block';
        
        // Cargar datos
        this.loadUsers();
        this.loadDrivers();
        this.loadTrips();
        this.loadRatings();
        this.loadChatMessages();
        this.loadStats();
    }
    
    // Cerrar panel de administración
    static closeAdminPanel() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Cambiar pestaña
    static showTab(tabName) {
        // Ocultar todas las pestañas
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Mostrar pestaña seleccionada
        document.getElementById(`admin-${tabName}`).classList.add('active');
        event.target.classList.add('active');
    }
    
    // Cargar usuarios
    static loadUsers() {
        const usersList = document.getElementById('users-list');
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        
        let html = '<div class="admin-item">';
        html += '<h4>Usuarios Locales</h4>';
        
        Object.values(localUsers).forEach(user => {
            html += `
                <div class="user-item">
                    <div class="user-info">
                        <strong>${user.name}</strong> (${user.email})
                        <br>
                        <small>Tipo: ${user.userType} | Tel: ${user.phone || 'No especificado'}</small>
                        <br>
                        <small>Registrado: ${new Date(user.id).toLocaleDateString('es-AR')}</small>
                    </div>
                    <div class="user-actions">
                        <button onclick="AdminPanel.viewUserDetails(${user.id})">Ver Detalles</button>
                        <button onclick="AdminPanel.editUser(${user.id})">Editar</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        usersList.innerHTML = html;
    }
    
    // Cargar conductores
    static loadDrivers() {
        const driversList = document.getElementById('drivers-list');
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        
        let html = '<div class="admin-item">';
        html += '<h4>Conductores Registrados</h4>';
        
        Object.values(localUsers).forEach(user => {
            if (user.userType === 'driver' && user.driverInfo) {
                html += `
                    <div class="driver-item">
                        <div class="driver-info">
                            <strong>${user.name}</strong> (${user.email})
                            <br>
                            <small>Alias: ${user.driverInfo.alias}</small>
                            <br>
                            <small>Vehículo: ${user.driverInfo.vehicleMake} ${user.driverInfo.vehicleModel} (${user.driverInfo.vehicleColor})</small>
                            <br>
                            <small>Patente: ${user.driverInfo.vehiclePlate}</small>
                        </div>
                        <div class="driver-actions">
                            <button onclick="AdminPanel.viewDriverDetails(${user.id})">Ver Detalles</button>
                            <button onclick="AdminPanel.toggleDriverStatus(${user.id})">Cambiar Estado</button>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        driversList.innerHTML = html;
    }
    
    // Cargar viajes
    static loadTrips() {
        const tripsList = document.getElementById('trips-list');
        tripsList.innerHTML = '<div class="admin-item"><p>Los viajes se guardarán aquí cuando se implemente la funcionalidad completa.</p></div>';
    }
    
    // Cargar valoraciones
    static loadRatings() {
        const ratingsList = document.getElementById('ratings-list');
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        
        let html = '<div class="admin-item">';
        html += '<h4>Valoraciones Recientes</h4>';
        
        Object.values(localUsers).forEach(user => {
            const ratings = JSON.parse(localStorage.getItem(`ratings_${user.id}`) || '[]');
            ratings.forEach(rating => {
                html += `
                    <div class="rating-item">
                        <div class="rating-info">
                            <strong>${rating.raterName}</strong> calificó con ${rating.rating} estrellas
                            <br>
                            <small>Comentario: "${rating.comment}"</small>
                            <br>
                            <small>Fecha: ${rating.date} ${rating.time}</small>
                        </div>
                    </div>
                `;
            });
        });
        
        html += '</div>';
        ratingsList.innerHTML = html;
    }
    
    // Cargar mensajes de chat
    static loadChatMessages() {
        const chatList = document.getElementById('chat-list');
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        
        let html = '<div class="admin-item">';
        html += '<h4>Mensajes del Chat</h4>';
        
        Object.values(localUsers).forEach(user => {
            const messages = JSON.parse(localStorage.getItem(`chat_${user.id}`) || '[]');
            messages.forEach(message => {
                html += `
                    <div class="message-item">
                        <div class="message-info">
                            <strong>${message.senderName}</strong> (${user.email})
                            <br>
                            <small>Mensaje: "${message.content}"</small>
                            <br>
                            <small>Fecha: ${new Date(message.timestamp).toLocaleString('es-AR')}</small>
                        </div>
                    </div>
                `;
            });
        });
        
        html += '</div>';
        chatList.innerHTML = html;
    }
    
    // Cargar estadísticas
    static loadStats() {
        const statsContent = document.getElementById('stats-content');
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        
        const totalUsers = Object.keys(localUsers).length;
        const totalDrivers = Object.values(localUsers).filter(u => u.userType === 'driver').length;
        const totalPassengers = Object.values(localUsers).filter(u => u.userType === 'passenger').length;
        
        let totalRatings = 0;
        let totalMessages = 0;
        
        Object.values(localUsers).forEach(user => {
            const ratings = JSON.parse(localStorage.getItem(`ratings_${user.id}`) || '[]');
            const messages = JSON.parse(localStorage.getItem(`chat_${user.id}`) || '[]');
            totalRatings += ratings.length;
            totalMessages += messages.length;
        });
        
        statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Usuarios</h4>
                    <div class="stat-number">${totalUsers}</div>
                </div>
                <div class="stat-card">
                    <h4>Conductores</h4>
                    <div class="stat-number">${totalDrivers}</div>
                </div>
                <div class="stat-card">
                    <h4>Pasajeros</h4>
                    <div class="stat-number">${totalPassengers}</div>
                </div>
                <div class="stat-card">
                    <h4>Valoraciones</h4>
                    <div class="stat-number">${totalRatings}</div>
                </div>
                <div class="stat-card">
                    <h4>Mensajes</h4>
                    <div class="stat-number">${totalMessages}</div>
                </div>
                <div class="stat-card">
                    <h4>Viajes</h4>
                    <div class="stat-number">0</div>
                </div>
            </div>
        `;
    }
    
    // Ver detalles del usuario
    static viewUserDetails(userId) {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        const user = Object.values(localUsers).find(u => u.id === userId);
        
        if (user) {
            alert(`Detalles del Usuario:\n\nNombre: ${user.name}\nEmail: ${user.email}\nTeléfono: ${user.phone}\nTipo: ${user.userType}\nID: ${user.id}`);
        }
    }
    
    // Ver detalles del conductor
    static viewDriverDetails(userId) {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '{}');
        const user = Object.values(localUsers).find(u => u.id === userId);
        
        if (user && user.driverInfo) {
            alert(`Detalles del Conductor:\n\nNombre: ${user.name}\nEmail: ${user.email}\nAlias: ${user.driverInfo.alias}\nVehículo: ${user.driverInfo.vehicleMake} ${user.driverInfo.vehicleModel}\nColor: ${user.driverInfo.vehicleColor}\nPatente: ${user.driverInfo.vehiclePlate}\nLicencia: ${user.driverInfo.driverLicense}`);
        }
    }
}

// Exportar para uso global
window.AdminPanel = AdminPanel;
