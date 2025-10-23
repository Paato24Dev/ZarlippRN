// ========== SERVICE WORKER PARA PWA ==========

const CACHE_NAME = 'zarlipprn-v1.0.0';
const STATIC_CACHE = 'zarlipprn-static-v1.0.0';
const DYNAMIC_CACHE = 'zarlipprn-dynamic-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/login.html',
    '/registro.html',
    '/servicios.html',
    '/tarifas.html',
    '/soporte.html',
    '/cliente-perfil.html',
    '/chofer-perfil.html',
    '/css/styles.css',
    '/css/animations.css',
    '/js/index.js',
    '/js/registro.js',
    '/js/servicios.js',
    '/js/tarifas.js',
    '/js/payment-system.js',
    '/js/visual-effects.js',
    '/js/driver-dashboard.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'
];

// Archivos dinámicos para cache
const DYNAMIC_FILES = [
    '/api/trips',
    '/api/payments',
    '/api/user'
];

// ========== INSTALACIÓN DEL SERVICE WORKER ==========
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error en instalación', error);
            })
    );
});

// ========== ACTIVACIÓN DEL SERVICE WORKER ==========
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activación completada');
                return self.clients.claim();
            })
    );
});

// ========== INTERCEPTAR PETICIONES ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estrategia: Cache First para archivos estáticos
    if (STATIC_FILES.includes(url.pathname) || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        event.respondWith(cacheFirst(request));
    }
    // Estrategia: Network First para APIs
    else if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
    }
    // Estrategia: Stale While Revalidate para otros recursos
    else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// ========== ESTRATEGIAS DE CACHE ==========

// Cache First: Buscar en cache primero, luego en red
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First Error:', error);
        return new Response('Recurso no disponible offline', { status: 503 });
    }
}

// Network First: Buscar en red primero, luego en cache
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network First: Usando cache offline');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Respuesta offline para APIs
        if (request.url.includes('/api/')) {
            return new Response(JSON.stringify({
                error: 'Sin conexión',
                offline: true,
                message: 'Funcionando en modo offline'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response('Recurso no disponible offline', { status: 503 });
    }
}

// Stale While Revalidate: Devolver cache inmediatamente y actualizar en segundo plano
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// ========== SINCRONIZACIÓN EN SEGUNDO PLANO ==========
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Sincronización en segundo plano');
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Sincronizar datos pendientes cuando se recupere la conexión
        const pendingData = await getPendingData();
        
        for (const data of pendingData) {
            await syncData(data);
        }
        
        console.log('Service Worker: Sincronización completada');
    } catch (error) {
        console.error('Service Worker: Error en sincronización', error);
    }
}

async function getPendingData() {
    // Obtener datos pendientes del IndexedDB
    return new Promise((resolve) => {
        const request = indexedDB.open('ZarlippRN', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingData'], 'readonly');
            const store = transaction.objectStore('pendingData');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
        };
        
        request.onerror = () => {
            resolve([]);
        };
    });
}

async function syncData(data) {
    try {
        const response = await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
        });
        
        if (response.ok) {
            // Eliminar datos sincronizados
            await removePendingData(data.id);
        }
    } catch (error) {
        console.error('Error sincronizando datos:', error);
    }
}

async function removePendingData(id) {
    return new Promise((resolve) => {
        const request = indexedDB.open('ZarlippRN', 1);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['pendingData'], 'readwrite');
            const store = transaction.objectStore('pendingData');
            store.delete(id);
            resolve();
        };
    });
}

// ========== NOTIFICACIONES PUSH ==========
self.addEventListener('push', (event) => {
    console.log('Service Worker: Notificación push recibida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de ZarlippRN',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalles',
                icon: '/icons/action-explore.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icons/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('ZarlippRN', options)
    );
});

// ========== CLICK EN NOTIFICACIONES ==========
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Click en notificación');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Solo cerrar la notificación
    } else {
        // Click en el cuerpo de la notificación
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ========== MENSAJES DEL CLIENTE ==========
self.addEventListener('message', (event) => {
    console.log('Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// ========== FUNCIONES DE UTILIDAD ==========

// Limpiar cache antiguo
async function cleanOldCache() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('zarlipprn-') && 
        name !== STATIC_CACHE && 
        name !== DYNAMIC_CACHE
    );
    
    await Promise.all(
        oldCaches.map(name => caches.delete(name))
    );
}

// Obtener información del cache
async function getCacheInfo() {
    const cacheNames = await caches.keys();
    const cacheInfo = {};
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        cacheInfo[name] = keys.length;
    }
    
    return cacheInfo;
}

console.log('Service Worker: Cargado correctamente');
