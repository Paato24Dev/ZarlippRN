// ========== JAVASCRIPT PARA PÁGINA DE SERVICIOS (servicios.html) ==========

// Elementos del DOM
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

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Animaciones de entrada para las tarjetas
    const cards = document.querySelectorAll('.service-card-large, .additional-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
