
// ============================================
// LA BAHÍA MARISQUERÍA - SCRIPT ACTUALIZADO
// ============================================

const products = [
    {id:1,name:'Camarón Mediano',category:'camarones',desc:'Ideal para cócteles y ceviches.',price:180,unit:'kg',emoji:'🦐',badge:'Popular',featured:true},
    {id:2,name:'Pulpo Baby',category:'pulpo',desc:'Tierno y listo para la brasa.',price:250,unit:'kg',emoji:'🐙',badge:'Especial',featured:true},
    {id:3,name:'Filete de Robalo',category:'pescado',desc:'Corte premium sin espinas.',price:220,unit:'kg',emoji:'🐟',badge:'Premium',featured:true},
    {id:4,name:'Cangrejo Moro',category:'cangrejo',desc:'Pinzas grandes y frescas.',price:350,unit:'kg',emoji:'🦀',badge:'Deluxe',featured:true},
    {id:5,name:'Camarón Grande',category:'camarones',desc:'Perfecto para parrilla.',price:280,unit:'kg',emoji:'🦐'},
    {id:6,name:'Filete de Trucha',category:'pescado',desc:'Fresca del día.',price:190,unit:'kg',emoji:'🐠'},
    {id:7,name:'Calamar Entero',category:'calamar',desc:'Listo para cocinar.',price:200,unit:'kg',emoji:'🦑'},
    {id:8,name:'Ostras Frescas',category:'mariscos',desc:'Sabor puro del mar.',price:320,unit:'docena',emoji:'🦪',badge:'Gourmet'}
];

let cart = [];
let currentFilter = 'todos';
let paymentMethod = 'whatsapp';

document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderProducts();

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sec = btn.dataset.section;
            if(sec) showSection(sec);
            document.getElementById('mainNav').classList.remove('open');
        });
    });

    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('mainNav').classList.toggle('open');
    });

    document.getElementById('checkoutBtn').addEventListener('click', sendWhatsApp);

    document.getElementById('clearCartBtn').addEventListener('click', () => {
        cart = [];
        renderCart();
        updateCartBadge();
    });

    const locationBtn = document.getElementById('locationBtn');
    if(locationBtn){
        locationBtn.addEventListener('click', () => {
            showToast('📍','Ubicación abierta','Google Maps abierto correctamente');
        });
    }
});

function showSection(id){
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if(id === 'cart') renderCart();
    if(id === 'products') renderProducts();

    window.scrollTo({top:0,behavior:'smooth'});
}

function renderFeatured(){
    const featured = products.filter(p => p.featured);
    document.getElementById('featuredGrid').innerHTML = featured.map(productCardHTML).join('');
}

function renderProducts(){
    const categories = ['todos', ...new Set(products.map(p => p.category))];

    document.getElementById('filterBar').innerHTML = categories.map(cat => `
        <button class="filter-btn ${currentFilter===cat?'active':''}" onclick="filterProducts('${cat}')">
            ${cat}
        </button>
    `).join('');

    const filtered = currentFilter === 'todos'
        ? products
        : products.filter(p => p.category === currentFilter);

    document.getElementById('productsList').innerHTML = filtered.map(productCardHTML).join('');
}

function filterProducts(cat){
    currentFilter = cat;
    renderProducts();
}

function productCardHTML(p){
    return `
        <div class="product-card">
            <div class="product-img-wrap">
                <div class="product-emoji">${p.emoji}</div>
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
            </div>

            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.desc}</div>

                <div class="product-footer">
                    <div>
                        <div class="product-price">Bs. ${p.price.toFixed(2)}</div>
                        <small>por kg</small>
                    </div>

                    <button class="btn-add" onclick="addToCart(${p.id},0.5)">
                        + 0.5 kg
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addToCart(id, quantity){
    const product = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);

    if(existing){
        existing.quantity += quantity;
    } else {
        cart.push({...product, quantity});
    }

    updateCartBadge();
    showToast(product.emoji, 'Producto agregado', `${quantity} kg de ${product.name}`);
}

function updateCartBadge(){
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').textContent = total.toFixed(1);
}

function renderCart(){
    const content = document.getElementById('cartContent');
    const empty = document.getElementById('emptyCart');

    if(cart.length === 0){
        content.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    content.style.display = 'block';
    empty.style.display = 'none';

    const tbody = document.getElementById('cartItems');
    const mobile = document.getElementById('cartCardsMobile');
    const summary = document.getElementById('summaryRows');

    tbody.innerHTML = '';
    mobile.innerHTML = '';
    summary.innerHTML = '';

    let total = 0;
    let totalKg = 0;

    cart.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        totalKg += item.quantity;

        tbody.innerHTML += `
            <tr>
                <td>${item.emoji} ${item.name}</td>
                <td>Bs. ${item.price}</td>
                <td>
                    <input type="number" step="0.5" min="0.5" class="cart-qty"
                    value="${item.quantity}" onchange="updateQty(${idx}, this.value)">
                </td>
                <td>Bs. ${subtotal.toFixed(2)}</td>
                <td><button class="btn-remove" onclick="removeItem(${idx})">✕</button></td>
            </tr>
        `;

        mobile.innerHTML += `
            <div class="mobile-cart-card">
                <strong>${item.emoji} ${item.name}</strong>
                <p>Bs. ${subtotal.toFixed(2)}</p>
                <input type="number" step="0.5" min="0.5"
                value="${item.quantity}" onchange="updateQty(${idx}, this.value)">
            </div>
        `;

        summary.innerHTML += `
            <div class="summary-row">
                <span>${item.name} (${item.quantity}kg)</span>
                <span>Bs. ${subtotal.toFixed(2)}</span>
            </div>
        `;
    });

    document.getElementById('cartTotal').textContent = `Bs. ${total.toFixed(2)}`;
    document.getElementById('qrTotal').textContent = total.toFixed(2);

    const checkout = document.getElementById('checkoutBtn');

    if(totalKg < 1){
        checkout.disabled = true;
        checkout.innerHTML = '⚠️ Debes agregar mínimo 1 kg';
    } else {
        checkout.disabled = false;
        checkout.innerHTML = paymentMethod === 'qr'
            ? '📷 Confirmar pago por QR'
            : '💬 Enviar Pedido por WhatsApp';
    }
}

function updateQty(idx, value){
    const qty = parseFloat(value);

    if(qty < 0.5){
        cart[idx].quantity = 0.5;
    } else {
        cart[idx].quantity = qty;
    }

    renderCart();
    updateCartBadge();
}

function removeItem(idx){
    cart.splice(idx,1);
    renderCart();
    updateCartBadge();
}

function selectPayment(method){
    paymentMethod = method;

    document.getElementById('payWA').classList.remove('active');
    document.getElementById('payQR').classList.remove('active');

    if(method === 'whatsapp'){
        document.getElementById('payWA').classList.add('active');
        document.getElementById('qrSection').style.display = 'none';
    } else {
        document.getElementById('payQR').classList.add('active');
        document.getElementById('qrSection').style.display = 'block';
    }

    renderCart();
}

function sendWhatsApp(){
    const totalKg = cart.reduce((acc, item) => acc + item.quantity, 0);

    if(totalKg < 1){
        alert('Debes comprar mínimo 1 kg en total.');
        return;
    }

    let total = 0;

    let msg = '🌊 *Pedido La Bahía Marisquería* 🌊\n\n';

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        msg += `• ${item.name} - ${item.quantity}kg = Bs. ${subtotal.toFixed(2)}\n`;
    });

    msg += `\n💰 *Total: Bs. ${total.toFixed(2)}*\n`;

    if(paymentMethod === 'qr'){
        msg += '\n📷 Ya realicé el pago por QR. Enseguida enviaré una FOTO o CAPTURA del comprobante para confirmar mi pedido.';
    } else {
        msg += '\nQuiero confirmar disponibilidad y coordinar mi pedido.';
    }

    window.open(`https://wa.me/59167823905?text=${encodeURIComponent(msg)}`, '_blank');
}

function showToast(emoji,title,message){
    const toast = document.getElementById('toast');

    document.getElementById('toastEmoji').textContent = emoji;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    },3000);
}

function closeToast(){
    document.getElementById('toast').classList.remove('show');
}
