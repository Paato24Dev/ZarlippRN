// ========== SISTEMA DE EFECTOS VISUALES ==========

class VisualEffects {
    constructor() {
        this.particles = [];
        this.cursor = { x: 0, y: 0 };
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.createParticles();
        this.setupScrollAnimations();
        this.setupCustomCursor();
        this.setupHoverEffects();
        this.startAnimationLoop();
    }

    // ========== SISTEMA DE PARTÍCULAS ==========
    createParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';
        document.body.appendChild(container);

        for (let i = 0; i < 15; i++) {
            this.createParticle(container);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 4 + 6;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;
        
        container.appendChild(particle);
    }

    // ========== ANIMACIONES DE SCROLL ==========
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observar elementos con clases de scroll reveal
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
            observer.observe(el);
        });
    }

    // ========== CURSOR PERSONALIZADO ==========
    setupCustomCursor() {
        // Crear elementos del cursor
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        
        const cursorOutline = document.createElement('div');
        cursorOutline.className = 'cursor-outline';
        
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        // Seguir el mouse sin delay
        document.addEventListener('mousemove', (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
            
            // Aplicar posición inmediatamente sin transición
            cursorDot.style.transition = 'none';
            cursorOutline.style.transition = 'none';
            
            cursorDot.style.left = `${e.clientX - 4}px`;
            cursorDot.style.top = `${e.clientY - 4}px`;
            
            cursorOutline.style.left = `${e.clientX - 15}px`;
            cursorOutline.style.top = `${e.clientY - 15}px`;
        });

        // Efectos en hover
        document.querySelectorAll('a, button, .hover-effect').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.transform = 'scale(1.5)';
                cursorOutline.style.borderColor = 'var(--primary-yellow)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.transform = 'scale(1)';
                cursorOutline.style.borderColor = 'var(--primary-yellow)';
            });
        });
    }

    // ========== EFECTOS DE HOVER ==========
    setupHoverEffects() {
        // Efectos en botones
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.classList.add('animate-pulse');
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('animate-pulse');
            });
        });

        // Efectos en tarjetas
        document.querySelectorAll('.card, .trip-card, .stat-card').forEach(card => {
            card.classList.add('hover-lift');
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Efectos en iconos
        document.querySelectorAll('.stat-icon, .route-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.classList.add('animate-wiggle');
            });
            
            icon.addEventListener('animationend', () => {
                icon.classList.remove('animate-wiggle');
            });
        });
    }

    // ========== ANIMACIONES AUTOMÁTICAS ==========
    startAnimationLoop() {
        const animate = () => {
            this.animateElements();
            requestAnimationFrame(animate);
        };
        animate();
    }

    animateElements() {
        // Animar elementos con clase animate-float
        document.querySelectorAll('.animate-float').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.animationPlayState = 'running';
            } else {
                el.style.animationPlayState = 'paused';
            }
        });

        // Animar elementos con clase animate-glow
        document.querySelectorAll('.animate-glow').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.animationPlayState = 'running';
            } else {
                el.style.animationPlayState = 'paused';
            }
        });
    }

    // ========== EFECTOS ESPECIALES ==========
    
    // Efecto de confeti para éxito
    createConfetti() {
        const colors = ['#FFD700', '#8A2BE2', '#FF6B6B', '#4ECDC4', '#45B7D1'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    z-index: 10000;
                    animation: confettiFall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 20);
        }
        
        // Agregar keyframes para confetti si no existen
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Efecto de pulso para notificaciones importantes
    createPulseEffect(element) {
        element.classList.add('animate-pulse');
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, 2000);
    }

    // Efecto de shake para errores
    createShakeEffect(element) {
        element.classList.add('animate-shake');
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 500);
    }

    // Efecto de bounce para elementos importantes
    createBounceEffect(element) {
        element.classList.add('animate-bounceIn');
        setTimeout(() => {
            element.classList.remove('animate-bounceIn');
        }, 600);
    }

    // Efecto de shimmer para elementos destacados
    createShimmerEffect(element) {
        element.classList.add('shimmer-effect');
        setTimeout(() => {
            element.classList.remove('shimmer-effect');
        }, 2000);
    }

    // ========== EFECTOS DE TRANSICIÓN DE PÁGINA ==========
    createPageTransition() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--gradient-primary);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Fade out
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }, 300);
    }

    // ========== EFECTOS DE LOADING ==========
    createLoadingEffect(container) {
        const loader = document.createElement('div');
        loader.className = 'loading-effect';
        loader.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
        `;
        
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        
        container.style.position = 'relative';
        container.appendChild(loader);
        
        return loader;
    }

    removeLoadingEffect(loader) {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    }

    // ========== EFECTOS DE TEXTO ==========
    createTypewriterEffect(element, text, speed = 100) {
        element.textContent = '';
        let i = 0;
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }

    // ========== EFECTOS DE MOUSE ==========
    createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 215, 0, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Agregar keyframes para ripple si no existen
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    window.visualEffects = new VisualEffects();
    
    // Agregar efectos a elementos específicos
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            window.visualEffects.createRippleEffect(btn, e);
        });
    });
    
    // Efecto de confeti en éxito de pago
    document.addEventListener('paymentSuccess', () => {
        window.visualEffects.createConfetti();
    });
    
    // Efecto de shake en errores
    document.addEventListener('paymentError', () => {
        const errorElement = document.querySelector('.payment-modal');
        if (errorElement) {
            window.visualEffects.createShakeEffect(errorElement);
        }
    });
});
