// Configuración de la base de datos y APIs
const config = {
    // Base de datos PostgreSQL
    database: {
        host: 'dpg-d3rdpg95pdvs73fiskl0-a.oregon-postgres.render.com',
        port: 5432,
        database: 'catrieltx',
        username: 'paatodev',
        password: '1LP2UNJouEUZKOWpXbVRQUcSMqH3m6PR',
        ssl: {
            rejectUnauthorized: false
        }
    },
    
    // Mercado Pago
    mercadoPago: {
        publicKey: 'APP_USR-03766435-8e82-4920-8514-2a696c52fb57',
        accessToken: 'APP_USR-7672466710082923-102021-004dde191211b870d77e405947cc03c3-1527969500',
        clientId: '7672466710082923',
        clientSecret: 'X3MjrSia1cIlddikQRgWk07dG7WBwXh4',
        userId: '1527969500'
    },
    
    // Google OAuth
    google: {
        clientId: '918680994935-onf5obhtfhtt6addjkdl2t2dq4epqcbg.apps.googleusercontent.com',
        clientSecret: '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',
        projectId: 'singular-chain-465922-i5'
    },
    
    // Configuración de la aplicación
    app: {
        name: 'ZarlippRN',
        developer: 'PaatoDev',
        baseFare: 4000,
        commission: 500,
        driverEarnings: 3500,
        currency: 'ARS'
    },
    
    // Cuenta maestra admin
    admin: {
        email: 'paatodev@dev.com',
        password: 'ajsdbuahfbasijvnsv'
    },
    
    // Ubicación de prueba
    testLocation: {
        googleMapsLink: 'https://maps.app.goo.gl/DmKXmeypGksgVNRQA'
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
