/**
 * ===================================================================
 * BENI BK - Restaurant Management System
 * Architecture: Module Pattern avec ES6+
 * Versions: 1.0.0
 * ===================================================================
 */

// ======================== CONFIGURATION ========================
const CONFIG = {
    DELIVERY_FEE: 1000, // FC
    SITE_URL: window.location.href.split('?')[0],
    WHATSAPP_NUMBER: '243977970594', // Format international sans +
    PAYMENT_PROVIDERS: {
        mpesa: {
            name: 'M-Pesa',
            code: '*256#',
            deepLink: (amount) => `tel:*256*1*1*${amount}#`
        },
        airtel: {
            name: 'Airtel Money',
            code: '*144#',
            deepLink: (amount) => `tel:*144*1*1*${amount}#`
        },
        orange: {
            name: 'Orange Money',
            code: '*150#',
            deepLink: (amount) => `tel:*150*1*1*${amount}#`
        }
    },
    PRODUCTS: {
        entrees: [
            {
                id: 1,
                name: 'Poulet Mayo Classique',
                description: 'Grillé au charbon, servi avec sa mayo maison.',
                price: 25000,
                image: './img/poulet mayo.jpeg',
                category: 'entrees'
            },
            {
                id: 2,
                name: 'Ntaba (Chèvre) Spécial',
                description: 'Morceaux de chèvre fumés, épices du pays.',
                price: 35000,
                image: 'https://via.placeholder.com/300x250?text=Ntaba',
                category: 'entrees'
            },
            {
                id: 3,
                name: 'Beignets Congolais',
                description: 'Pâte croustillante, sauce piquante maison.',
                price: 15000,
                image: 'https://via.placeholder.com/300x250?text=Beignets',
                category: 'entrees'
            }
        ],
        plats: [
            {
                id: 4,
                name: 'Moambe (Viande)',
                description: 'Sauce cacahuète traditionnelle avec riz blanc.',
                price: 45000,
                image: 'https://via.placeholder.com/300x250?text=Moambe',
                category: 'plats'
            },
            {
                id: 5,
                name: 'Liamba (Poisson) Premium',
                description: 'Poisson grillé entier, sauce tomate épicée.',
                price: 50000,
                image: 'https://via.placeholder.com/300x250?text=Liamba',
                category: 'plats'
            },
            {
                id: 6,
                name: 'Longe Rôtie',
                description: 'Longe de veau lentement rôtie aux épices.',
                price: 55000,
                image: 'https://via.placeholder.com/300x250?text=Longe',
                category: 'plats'
            }
        ],
        desserts: [
            {
                id: 7,
                name: 'Mikate (Gâteau)',
                description: 'Gâteau traditionnel congolais, sucré et aéré.',
                price: 12000,
                image: 'https://via.placeholder.com/300x250?text=Mikate',
                category: 'desserts'
            },
            {
                id: 8,
                name: 'Bananes Flambées',
                description: 'Bananes plantains caramélisées au rhum.',
                price: 18000,
                image: 'https://via.placeholder.com/300x250?text=Bananes',
                category: 'desserts'
            }
        ],
        boissons: [
            {
                id: 9,
                name: 'Jus de Fruits Frais',
                description: 'Mangue, papaye ou goyave pressée du jour.',
                price: 8000,
                image: 'https://via.placeholder.com/300x250?text=Jus',
                category: 'boissons'
            },
            {
                id: 10,
                name: 'Eau de Coco Naturelle',
                description: 'Coco fraîche, refroidissante et naturelle.',
                price: 10000,
                image: 'https://via.placeholder.com/300x250?text=Coco',
                category: 'boissons'
            }
        ]
    }
};

// ======================== CART MANAGER ========================
/**
 * Gestionnaire complet du panier avec validation, calculs précis et persistance
 */
const cartManager = (() => {
    // État privé
    let cart = [];
    const storageKey = 'beniCookieCart';
    
    // Initialisation depuis localStorage
    const init = () => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch (e) {
                console.error('Erreur de récupération du panier:', e);
                cart = [];
            }
        }
        updateUI();
    };

    // Vérifier si un article existe déjà
    const findItem = (id) => cart.find(item => item.id === id);

    /**
     * Ajouter un article au panier (gère les quantités)
     * @param {number} productId - ID du produit
     * @param {string} name - Nom du produit
     * @param {number} price - Prix unitaire
     * @param {number} quantity - Quantité (défaut 1)
     */
    const addToCart = (productId, name, price, quantity = 1) => {
        if (!productId || !name || price <= 0) {
            showNotification('Erreur: Données du produit invalides', 'error');
            return;
        }

        const existingItem = findItem(productId);
        
        if (existingItem) {
            // Incrémenter la quantité
            existingItem.quantity += quantity;
            showNotification(`${name} - Quantité mise à jour (+${quantity})`, 'info');
        } else {
            // Ajouter nouveau produit
            cart.push({
                id: productId,
                name,
                price: parseFloat(price), // Assurer la précision décimale
                quantity
            });
            showNotification(`${name} ajouté au panier!`, 'success');
        }
        
        saveCart();
        updateUI();
    };

    /**
     * Mettre à jour la quantité d'un article
     */
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const item = findItem(productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            saveCart();
            updateUI();
        }
    };

    /**
     * Retirer un article du panier
     */
    const removeFromCart = (productId) => {
        const item = findItem(productId);
        if (item) {
            cart = cart.filter(i => i.id !== productId);
            showNotification(`${item.name} supprimé du panier`, 'info');
            saveCart();
            updateUI();
        }
    };

    /**
     * Vider complètement le panier
     */
    const clearCart = () => {
        if (cart.length === 0) {
            showNotification('Le panier est déjà vide', 'warning');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir vider le panier?')) {
            cart = [];
            saveCart();
            updateUI();
            showNotification('Panier vidé', 'info');
        }
    };

    /**
     * Calculer le sous-total avec précision décimale
     */
    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            const itemTotal = parseFloat((item.price * item.quantity).toFixed(2));
            return parseFloat((total + itemTotal).toFixed(2));
        }, 0);
    };

    /**
     * Calculer le total avec frais de livraison
     */
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return parseFloat((subtotal + CONFIG.DELIVERY_FEE).toFixed(2));
    };

    /**
     * Obtenir le panier courant
     */
    const getCart = () => [...cart];

    /**
     * Valider le panier avant paiement
     */
    const validateCart = () => {
        if (cart.length === 0) {
            showNotification('❌ Votre panier est vide!', 'error');
            return false;
        }
        return true;
    };

    /**
     * Sauvegarder le panier dans localStorage
     */
    const saveCart = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(cart));
        } catch (e) {
            console.error('Erreur de sauvegarde du panier:', e);
        }
    };

    /**
     * Mettre à jour l'interface utilisateur
     */
    const updateUI = () => {
        updateCartDisplay();
        updateCartCount();
        updateCartSummary();
        updatePaymentButton();
    };

    /**
     * Afficher les articles du panier
     */
    const updateCartDisplay = () => {
        const cartContainer = document.getElementById('cart-items');
        
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            return;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-name">
                    <strong>${escapeHtml(item.name)}</strong>
                    <div class="cart-item-details">
                        ${item.price.toLocaleString('fr-FR')} FC × ${item.quantity}
                    </div>
                </div>
                <span class="cart-item-price">${(item.price * item.quantity).toLocaleString('fr-FR')} FC</span>
                <div class="cart-item-qty-controls">
                    <button class="btn-qty" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span style="width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="btn-qty" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-remove" onclick="cartManager.removeFromCart(${item.id})" title="Supprimer">🗑️</button>
            </div>
        `).join('');
    };

    /**
     * Mettre à jour le badge du nombre d'articles
     */
    const updateCartCount = () => {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    };

    /**
     * Mettre à jour le résumé du panier (totaux)
     */
    const updateCartSummary = () => {
        const subtotal = calculateSubtotal();
        const total = calculateTotal();

        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total-price');
        const paymentAmountEl = document.getElementById('paymentAmount');

        if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('fr-FR') + ' FC';
        if (totalEl) totalEl.textContent = total.toLocaleString('fr-FR') + ' FC';
        if (paymentAmountEl) paymentAmountEl.textContent = total.toLocaleString('fr-FR') + ' FC';
    };

    /**
     * Activer/désactiver le bouton de paiement
     */
    const updatePaymentButton = () => {
        const payBtn = document.getElementById('paymentBtn');
        if (payBtn) {
            payBtn.disabled = cart.length === 0;
        }
    };

    /**
     * Modal de paiement Mobile Money
     */
    const openPaymentModal = () => {
        if (!validateCart()) return;
        
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.add('show');
        }
    };

    const closePaymentModal = () => {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('show');
        }
    };

    /**
     * Traiter le paiement Mobile Money
     */
    const processPayment = (provider) => {
        if (!validateCart()) return;

        const providerConfig = CONFIG.PAYMENT_PROVIDERS[provider];
        if (!providerConfig) {
            showNotification('Fournisseur de paiement invalide', 'error');
            return;
        }

        const total = calculateTotal();

        // Validation sécurisée
        if (total <= 0) {
            showNotification('Montant invalide', 'error');
            return;
        }

        // Simuler validation sécurisée
        console.log(`🔐 Validation sécurisée: Paiement de ${total} FC via ${providerConfig.name}`);

        // Deep link vers l'application de paiement
        const deepLink = providerConfig.deepLink(total);
        
        try {
            // Tentative de redirection vers l'app de paiement
            closePaymentModal();
            showNotification(`Redirection vers ${providerConfig.name}...`, 'info');
            
            // Simuler la redirection (dans une vraie app, utiliser window.location.href)
            setTimeout(() => {
                console.log(`Redirection vers: ${deepLink}`);
                // window.location.href = deepLink; // Décommenter en production
                
                // Pour la démo, afficher un message de confirmation
                showNotification(`✅ Paiement de ${total.toLocaleString('fr-FR')} FC initié avec ${providerConfig.name}`, 'success');
                clearCart();
            }, 500);
        } catch (error) {
            console.error('Erreur lors du traitement du paiement:', error);
            showNotification('Erreur lors du paiement. Veuillez réessayer.', 'error');
        }
    };

    /**
     * Envoyer le panier via WhatsApp
     */
    const sendToWhatsApp = () => {
        if (!validateCart()) return;

        const subtotal = calculateSubtotal();
        const total = calculateTotal();
        
        let message = '🍽️ *Nouvelle Commande BENI BK*\n\n';
        message += '📋 *Détail de la commande:*\n';
        message += '━━━━━━━━━━━━━━━━━━━━━\n';

        cart.forEach((item, index) => {
            const itemTotal = (item.price * item.quantity);
            message += `${index + 1}. ${item.name}\n`;
            message += `   ${item.quantity} × ${item.price.toLocaleString('fr-FR')} FC = ${itemTotal.toLocaleString('fr-FR')} FC\n`;
        });

        message += '━━━━━━━━━━━━━━━━━━━━━\n';
        message += `📦 *Sous-total:* ${subtotal.toLocaleString('fr-FR')} FC\n`;
        message += `🚚 *Frais livraison:* ${CONFIG.DELIVERY_FEE.toLocaleString('fr-FR')} FC\n`;
        message += `💰 *Total:* ${total.toLocaleString('fr-FR')} FC\n\n`;
        message += '✅ Je souhaite passer cette commande par Mobile Money (M-Pesa/Airtel/Orange)';

        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        showNotification('Redirection vers WhatsApp...', 'info');
    };

    // Retourner l'API publique
    return {
        init,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCart,
        calculateSubtotal,
        calculateTotal,
        validateCart,
        updateUI,
        openPaymentModal,
        closePaymentModal,
        processPayment,
        sendToWhatsApp
    };
})();

// ======================== QR CODE MANAGER ========================
/**
 * Gestion du QR Code pour le menu
 */
const qrCodeManager = (() => {
    let qrCode = null;

    const generate = () => {
        const container = document.getElementById('qrCodeContainer');
        if (!container) return;

        // Nettoyer les anciens QR codes
        container.innerHTML = '';

        try {
            // Générer le QR code avec la bibliothèque qrcode.js
            qrCode = new QRCode(container, {
                text: CONFIG.SITE_URL,
                width: 200,
                height: 200,
                colorDark: '#d4af37',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            console.log('✓ QR Code généré avec succès');
        } catch (error) {
            console.error('Erreur génération QR Code:', error);
            container.innerHTML = '<p>Impossible de générer le QR Code</p>';
        }
    };

    return { generate };
})();

// ======================== PRODUCT MANAGER ========================
/**
 * Gestion de l'affichage des produits
 */
const productManager = (() => {
    /**
     * Charger et afficher les produits
     */
    const loadProducts = (category = 'entrees') => {
        const container = document.getElementById('productList');
        if (!container) return;

        const products = CONFIG.PRODUCTS[category] || [];

        if (products.length === 0) {
            container.innerHTML = '<p>Aucun produit dans cette catégorie.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.src='https://via.placeholder.com/300x250?text=Image+non+disponible'">
                <div class="product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description)}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="price">${product.price.toLocaleString('fr-FR')} FC</div>
                        <button class="btn-add" onclick="cartManager.addToCart(${product.id}, '${escapeHtml(product.name)}', ${product.price})">
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    return { loadProducts };
})();

// ======================== UTILITAIRES ========================

/**
 * Échapper les caractères HTML pour éviter les injections XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Afficher les notifications
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Créer une notification visuelle simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#25d366' : type === 'error' ? '#ff4444' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Bascule l'affichage du QR Code
 */
function toggleQRCode() {
    const container = document.getElementById('qrCodeContainer');
    if (container) {
        container.classList.toggle('hidden');
        if (!container.classList.contains('hidden') && !container.firstChild) {
            qrCodeManager.generate();
        }
    }
}

// ======================== GESTION DES MODALES ========================

/**
 * Fermer les modales au clic extérieur
 */
document.addEventListener('click', (event) => {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    if (event.target === modal) {
        cartManager.closePaymentModal();
    }
});

/**
 * Fermer les modales avec Échap
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('paymentModal');
        if (modal && modal.classList.contains('show')) {
            cartManager.closePaymentModal();
        }
    }
});

// ======================== NAVIGATION ========================

/**
 * Gestion des clics sur les boutons CTA
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le panier
    cartManager.init();

    // Charger les produits par défaut
    productManager.loadProducts('entrees');

    // Boutons CTA
    document.querySelectorAll('.btn-cta').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (target === 'menu.html') {
                window.location.href = target;
            } else {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Boutons de catégories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = btn.dataset.category;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Si c'est un lien vers une autre page, laisser le navigateur faire son travail
            if (!btn.href.includes('#')) {
                return; // Laisser le href agir normalement
            }
            
            e.preventDefault();
            productManager.loadProducts(category);
        });
    });

    // Bouton clear cart
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => cartManager.clearCart());
    }

    // WhatsApp Float Button
    const whatsappFloat = document.getElementById('whatsappFloat');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', (e) => {
            e.preventDefault();
            cartManager.sendToWhatsApp();
        });
    }

    console.log('✓ Application BENI BK initialisée avec succès');
});