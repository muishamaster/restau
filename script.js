let cart = [];
let total = 0;

function addToCart(name, price) {
    cart.push({name, price});
    total += price;
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('total-price');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Votre panier est vide.</p>';
    } else {
        cartContainer.innerHTML = cart.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.name}</span>
                <span>${item.price.toLocaleString()} FC</span>
            </div>
        `).join('');
    }
    
    totalDisplay.innerText = total.toLocaleString() + " FC";
}

function sendToWhatsApp() {
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }
    
    let message = "Bonjour Elengi Premium, je souhaite commander :\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (${item.price} FC)\n`;
    });
    message += `\n*Total : ${total} FC*`;
    message += "\n\nJe souhaite payer par Mobile Money.";
    
    const whatsappUrl = `https://wa.me/243XXXXXXXXX?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
