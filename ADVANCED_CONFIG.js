/**
 * ===================================================================
 * BENI BK - GUIDE D'INTÉGRATION AVANCÉE
 * ===================================================================
 * 
 * Ce fichier contient des exemples avancés et des snippets pour
 * étendre les fonctionnalités du système
 */

// ======================== 1. AJOUTER NOUVEAUX PRODUITS ========================

/**
 * Exemple: Ajouter 5 nouveaux plats
 */
function addNewProducts() {
    // Étendre CONFIG.PRODUCTS
    CONFIG.PRODUCTS.plats.push({
        id: 101,
        name: 'Saka Wali (Feuilles cuites)',
        description: 'Sauce traditionnelle avec viande, riz blanc inclus.',
        price: 40000,
        image: 'https://via.placeholder.com/300x250?text=Saka+Wali',
        category: 'plats'
    });
    
    CONFIG.PRODUCTS.boissons.push({
        id: 201,
        name: 'Vin de Palme Frais',
        description: 'Boisson traditionnelle congolaise, nature et authentique.',
        price: 12000,
        image: 'https://via.placeholder.com/300x250?text=Vin+Palme',
        category: 'boissons'
    });
}

// Appel au démarrage si nécessaire
// addNewProducts();

// ======================== 2. INTÉGRATION PAIEMENT RÉEL ========================

/**
 * Intégration avec API Stripe/PayPal (exemple)
 */
async function integrateRealPayment(provider, amount) {
    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
            },
            body: JSON.stringify({
                provider: provider,
                amount: amount,
                currency: 'CDF',
                metadata: {
                    cart: cartManager.getCart(),
                    timestamp: new Date().toISOString()
                }
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✓ Paiement traité:', result.transactionId);
            // Rediriger vers page confirmation
            window.location.href = `/confirmation?tx=${result.transactionId}`;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('❌ Erreur paiement:', error);
        showNotification('Erreur: ' + error.message, 'error');
    }
}

// ======================== 3. SYSTÈME DE RÉDUCTIONS/PROMO ========================

/**
 * Appliquer code promo
 */
function applyPromoCode(code) {
    const PROMO_CODES = {
        'BENI50': { discount: 50000, type: 'fixed' },      // 50.000 FC
        'PROMO20': { discount: 0.20, type: 'percentage' },  // 20%
        'NEWYEAR': { discount: 0.15, type: 'percentage' }   // 15%
    };

    const promo = PROMO_CODES[code.toUpperCase()];
    if (!promo) {
        showNotification('Code invalide', 'error');
        return;
    }

    let discount = 0;
    if (promo.type === 'fixed') {
        discount = promo.discount;
    } else if (promo.type === 'percentage') {
        discount = cartManager.calculateSubtotal() * promo.discount;
    }

    const discountedTotal = Math.max(0, cartManager.calculateTotal() - discount);
    showNotification(`✓ Réduction appliquée: -${discount.toLocaleString('fr-FR')} FC`, 'success');
    
    return discountedTotal;
}

// ======================== 4. SYSTÈME D'HISTORIQUE COMMANDES ========================

/**
 * Sauvegarder historique commandes
 */
const orderHistory = (() => {
    const storageKey = 'beniOrderHistory';

    const saveOrder = (orderData) => {
        try {
            const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const order = {
                id: `ORD-${Date.now()}`,
                date: new Date().toISOString(),
                items: orderData.items,
                total: orderData.total,
                paymentMethod: orderData.paymentMethod,
                status: 'pending' // pending, confirmed, delivered
            };

            history.push(order);
            localStorage.setItem(storageKey, JSON.stringify(history));
            
            return order.id;
        } catch (error) {
            console.error('Erreur sauvegarde commande:', error);
        }
    };

    const getHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch (error) {
            console.error('Erreur lecture historique:', error);
            return [];
        }
    };

    const getOrderById = (orderId) => {
        const history = getHistory();
        return history.find(order => order.id === orderId);
    };

    return { saveOrder, getHistory, getOrderById };
})();

// Utilisation
/*
const orderId = orderHistory.saveOrder({
    items: cartManager.getCart(),
    total: cartManager.calculateTotal(),
    paymentMethod: 'mpesa'
});

console.log('Commande créée:', orderId);
*/

// ======================== 5. SYSTÈME DE NOTIFICATIONS AVANCÉES ========================

/**
 * Notifications avec son et vibrations
 */
const advancedNotifications = {
    success: (message) => {
        showNotification(message, 'success');
        if ('Notification' in window) {
            new Notification('BENI BK ✓', { body: message });
        }
        if ('vibrate' in navigator) {
            navigator.vibrate(200);
        }
    },
    
    error: (message) => {
        showNotification(message, 'error');
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    },
    
    warning: (message) => {
        showNotification(message, 'warning');
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }
};

// ======================== 6. ANALYTICS & TRACKING ========================

/**
 * Suivi des événements utilisateur
 */
const analytics = {
    events: [],
    
    trackEvent: (eventName, data = {}) => {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: data,
            userAgent: navigator.userAgent
        };
        
        analytics.events.push(event);
        console.log(`📊 Event: ${eventName}`, data);
        
        // Optionnel: envoyer à serveur
        // analytics.sendToServer(event);
    },

    trackAddToCart: (productId, productName, price) => {
        analytics.trackEvent('add_to_cart', {
            productId,
            productName,
            price,
            cartSize: cartManager.getCart().length
        });
    },

    trackCheckout: (total, method) => {
        analytics.trackEvent('checkout', {
            total,
            paymentMethod: method,
            itemCount: cartManager.getCart().length
        });
    },

    sendToServer: async (event) => {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Erreur envoi analytics:', error);
        }
    }
};

// ======================== 7. INTÉGRATION EMAIL ========================

/**
 * Envoyer confirmation par email
 */
async function sendConfirmationEmail(customerEmail) {
    if (!cartManager.validateCart()) return;

    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: customerEmail,
                subject: 'Confirmation Commande BENI BK',
                cart: cartManager.getCart(),
                total: cartManager.calculateTotal(),
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            showNotification('✓ Email de confirmation envoyé', 'success');
        }
    } catch (error) {
        console.error('Erreur email:', error);
    }
}

// ======================== 8. SYSTÈME FIDÉLITÉ ========================

/**
 * Programme de fidélité avec points
 */
const loyaltyProgram = (() => {
    const storageKey = 'beniLoyaltyPoints';
    const POINTS_RATE = 1; // 1 FC = 1 point

    const addPoints = (amount) => {
        const points = getPoints();
        const newPoints = points + Math.floor(amount * POINTS_RATE);
        localStorage.setItem(storageKey, newPoints.toString());
        
        showNotification(`+${Math.floor(amount * POINTS_RATE)} points fidélité!`, 'success');
        return newPoints;
    };

    const getPoints = () => {
        return parseInt(localStorage.getItem(storageKey) || '0');
    };

    const redeemPoints = (pointsAmount) => {
        const current = getPoints();
        if (current < pointsAmount) {
            showNotification('Points insuffisants', 'error');
            return false;
        }

        localStorage.setItem(storageKey, (current - pointsAmount).toString());
        showNotification(`-${pointsAmount} points utilisés`, 'info');
        return true;
    };

    return { addPoints, getPoints, redeemPoints };
})();

// ======================== 9. INTÉGRATION MAPS/GPS ========================

/**
 * Afficher localisation restaurant
 */
function showRestaurantLocation() {
    const lat = -4.3376; // Kinshasa approximé
    const lng = 15.3136;
    const mapsUrl = `https://www.google.com/maps/?q=${lat},${lng}`;
    
    window.open(mapsUrl, '_blank');
}

// Alternative: Embed Google Maps
function embedRestaurantMap() {
    return `
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
            width="400" 
            height="300" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy"
        ></iframe>
    `;
}

// ======================== 10. SERVICE WORKER (PWA) ========================

/**
 * Enregistrer Service Worker pour mode offline
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✓ Service Worker enregistré'))
        .catch(err => console.error('Erreur Service Worker:', err));
}

// Service Worker example (sw.js)
/*
const CACHE_NAME = 'beni-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/script.js',
                '/style.css'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/index.html'))
    );
});
*/

// ======================== 11. DEBUG & TESTS ========================

/**
 * Utilitaires debug
 */
const DEBUG = {
    // Afficher l'état du panier
    showCartState: () => {
        console.table(cartManager.getCart());
        console.log('Sous-total:', cartManager.calculateSubtotal());
        console.log('Total:', cartManager.calculateTotal());
    },

    // Remplir le panier pour tests
    populateTestCart: () => {
        cartManager.addToCart(1, 'Poulet Mayo', 25000, 2);
        cartManager.addToCart(4, 'Moambe', 45000, 1);
        cartManager.addToCart(9, 'Jus', 8000, 3);
    },

    // Vider le cache
    clearCache: () => {
        localStorage.clear();
        location.reload();
    },

    // Afficher config
    showConfig: () => {
        console.table(CONFIG);
    }
};

// Utilisation: DEBUG.populateTestCart();

// ======================== 12. EXPORT RAPPORT COMMANDES ========================

/**
 * Exporter historique en CSV
 */
function exportOrdersToCSV() {
    const history = orderHistory.getHistory();
    
    let csv = 'ID,Date,Total,Methode,Statut\n';
    history.forEach(order => {
        csv += `${order.id},"${new Date(order.date).toLocaleString()}",${order.total},${order.paymentMethod},${order.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beni_orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// ======================== 13. A/B TESTING ========================

/**
 * Tests A/B pour optimisation
 */
const ABTesting = {
    variants: {
        'cta_color': localStorage.getItem('cta_variant') || 'gold', // gold ou silver
        'checkout_flow': localStorage.getItem('checkout_variant') || 'simple' // simple ou advanced
    },

    setVariant: (test, variant) => {
        localStorage.setItem(`${test}_variant`, variant);
        location.reload();
    },

    getVariant: (test) => {
        return ABTesting.variants[test];
    }
};

// ======================== 14. RÉGLAGE PERFORMANCE ========================

/**
 * Optimisations performance
 */
const performance = {
    // Lazy loading images
    lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    },

    // Débounce pour optimisation
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ======================== 15. DOCUMENTATION API ========================

/**
 * API Publique BENI BK
 * 
 * Endpoints de base:
 * POST /api/order - Créer commande
 * GET  /api/menu - Récupérer menu
 * POST /api/payment - Traiter paiement
 * GET  /api/order/:id - Récupérer commande
 * POST /api/email - Envoyer email
 * 
 * Headers:
 * Authorization: Bearer {token}
 * Content-Type: application/json
 * 
 * Rate Limiting: 100 req/minute
 * Timeout: 30 secondes
 */

console.log('✓ Configuration avancée chargée');
