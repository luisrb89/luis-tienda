// Estado Global de la aplicación
let isAdmin = false;
let cart = [];

// El orden de navegación solicitado: 1, 2, 3, 4, 5, 6, 5, 4, 3, 2 (y vuelve a 1)
// Los números corresponden a los índices del Array de imágenes (0 a 5)
const navigationSequence = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];

// Productos Iniciales de Ejemplo
let products = [
    {
        id: 1,
        title: "Producto Ejemplo 1",
        price: 1500,
        description: "Descripción del producto de prueba con carrusel dinámico.",
        images: Array(6).fill("").map((_, i) => `https://placehold.co{i+1}`),
        currentSeqIndex: 0
    }
];

// Inicializar la tienda al cargar la página
window.onload = function() {
    renderProducts();
};

// Renderizar Tarjetas de Productos
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    products.forEach((product, pIndex) => {
        const activeImageIndex = navigationSequence[product.currentSeqIndex];
        const currentImgSrc = product.images[activeImageIndex] || "https://placehold.co";

        const card = document.createElement('div');
        card.className = `card ${isAdmin ? 'edit-mode' : ''}`;

        card.innerHTML = `
            <button class="btn-delete" style="display: ${isAdmin ? 'block' : 'none'}" onclick="deleteProduct(${product.id})">&times;</button>
            
            <div class="carousel">
                <button class="carousel-btn btn-prev" onclick="navigateCarousel(${pIndex}, -1)">&lsaquo;</button>
                <img class="carousel-img" src="${currentImgSrc}" onclick="openZoom('${currentImgSrc}')" alt="Producto">
                <button class="carousel-btn btn-next" onclick="navigateCarousel(${pIndex}, 1)">&rsaquo;</button>
            </div>

            <div class="file-upload-container" style="display: ${isAdmin ? 'block' : 'none'}">
                <label>Cambiar foto ${activeImageIndex + 1}:</label>
                <input type="file" accept="image/*" onchange="uploadImage(event, ${pIndex}, ${activeImageIndex})">
            </div>

            <div class="card-body">
                <input type="text" class="prod-title" value="${product.title}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField(${pIndex}, 'title', this.value)">
                
                <div class="prod-price-wrapper">
                    <input type="number" class="prod-price" value="${product.price}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField(${pIndex}, 'price', this.value)">
                </div>
                
                <textarea class="prod-desc" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField(${pIndex}, 'description', this.value)">${product.description}</textarea>
                <button class="btn-buy" style="display: ${isAdmin ? 'none' : 'block'}" onclick="addToCart(${pIndex})">Comprar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}



// Navegación del Carrusel en Secuencia
function navigateCarousel(productIndex, direction) {
    let seqIndex = products[productIndex].currentSeqIndex;
    seqIndex += direction;

    if (seqIndex >= navigationSequence.length) seqIndex = 0;
    if (seqIndex < 0) seqIndex = navigationSequence.length - 1;

    products[productIndex].currentSeqIndex = seqIndex;
    renderProducts();
}

// Subir Imagen desde la Computadora
function uploadImage(event, productIndex, imageIndex) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            products[productIndex].images[imageIndex] = e.target.result;
            renderProducts();
        };
        reader.readAsDataURL(file);
    }
}

// Actualizar campos de texto en tiempo real (Modo Admin)
function updateProductField(index, field, value) {
    products[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
}

// Sistema de Login de Administrador
function loginAdmin() {
    const password = prompt("Ingrese la contraseña de administrador:");
    if (password === "admin123") {
        isAdmin = true;
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('btn-login').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'block';
        renderProducts();
    } else {
        alert("Contraseña incorrecta.");
    }
}

function logoutAdmin() {
    isAdmin = false;
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('btn-login').style.display = 'block';
    document.getElementById('btn-logout').style.display = 'none';
    renderProducts();
}

// Agregar Nueva Tarjeta
function addNewProduct() {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({
        id: newId,
        title: "Nuevo Producto",
        price: 0,
        description: "Escribe una descripción aquí.",
        images: Array(6).fill("").map((_, i) => `https://placehold.co{i+1}`),
        currentSeqIndex: 0
    });
    renderProducts();
}

// Eliminar Tarjeta
function deleteProduct(id) {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
}

// Funciones de Zoom
function openZoom(src) {
    document.getElementById('zoomed-img').src = src;
    document.getElementById('zoom-modal').style.display = 'flex';
}
function closeZoom() {
    document.getElementById('zoom-modal').style.display = 'none';
}

// Funciones del Carrito de Compras
function addToCart(index) {
    const prod = products[index];
    cart.push({ title: prod.title, price: prod.price });
    document.getElementById('cart-count').innerText = cart.length;
    alert(`"${prod.title}" ha sido agregado a tus compras.`);
}
function openCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
        container.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const row = document.createElement('div');
            row.className = 'cart-item';
            
            // Aquí está el signo pesos ($) agregado directamente al texto dinámico
            row.innerHTML = `
                <span>${item.title}</span> 
                <div>
                    <strong>$${item.price}</strong>
                    <button onclick="removeFromCart(${index})" style="background:#dc3545; color:white; margin-left:10px; padding:2px 8px; border-radius:3px; border:none; cursor:pointer;">X</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('cart-modal').style.display = 'flex';
}


function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function removeFromCart(index) {
    cart.splice(index, 1); 
    document.getElementById('cart-count').innerText = cart.length; 
    openCart(); 
}

// Mandar lista por Mail
function sendCartByEmail() {
    if(cart.length === 0) {
        alert("No tienes productos en tu carrito.");
        return;
    }
    const correoDestino = "bralemsa@gmail.com";
    let bodyText = "Hola, quiero realizar este pedido:\n\n";
    let total = 0;

    cart.forEach((item, idx) => {
        bodyText += `- ${idx + 1}. ${item.title} - $${item.price}\n`;
        total += item.price;
    });
    
    bodyText += `\nTotal: $${total.toLocaleString('es-ar')}`;

    const asunto = encodeURIComponent("Quiero realizar este pedido");
    const cuerpo = encodeURIComponent(bodyText);

    window.location.href = `mailto:${correoDestino}?subject=${asunto}&body=${cuerpo}`;
}

// Mandar lista por WhatsApp
function sendWhatsapp() {
    if (cart.length === 0) {
        alert("No tienes productos en tu carrito.");
        return;
    }
    const telefono = "5491100000000"; // Reemplaza por tu número de teléfono real
    let bodyText = "Hola, quiero realizar este pedido:\n\n";
    let total = 0;

    cart.forEach((item, idx) => {
        bodyText += `* ${idx + 1}. ${item.title} - $${item.price}\n`;
        total += item.price;
    });
    
    bodyText += `\n*Total: $${total.toLocaleString('es-ar')}*`;
    
    const url = `https://wa.me{telefono}?text=${encodeURIComponent(bodyText)}`;
    window.open(url, "_blank");
}


