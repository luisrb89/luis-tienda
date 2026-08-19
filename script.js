// =========================================================================
// 🔥 CONFIGURACIÓN DE APIS DE GOOGLE FIREBASE (Datos reales de Luis)
// =========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyCd5_9Ubvw9ggRNfHa-NpVIs43XRNEjp-M",
    authDomain: "://firebaseapp.com",
    projectId: "tienda-1989",
    storageBucket: "tienda-1989.firebasestorage.app",
    messagingSenderId: "819818779178",
    appId: "1:819818779178:web:d6c57a7eef59df3905e953",
    measurementId: "G-XRFEZLJCCS"
};

// Inicializar la conexión con la base de datos en la nube
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =========================================================================
// 🛒 ESTADO GLOBAL DE LA APLICACIÓN
// =========================================================================
let isAdmin = false;
let cart = [];
let products = []; // Se cargará automáticamente desde internet

// Tu secuencia exacta de navegación de imágenes corregida y completada
const navigationSequence =[0,1,2,3,4,4,3,2,1,0];

// 📱 CONFIGURÁ AQUÍ TU TELÉFONO REAL DE WHATSAPP (Solo números, con tu código de país)
const TELEFONO_WHATSAPP = "5491100000000"; 

// Al cargar la página, escuchar la Base de Datos en tiempo real
window.onload = function() {
    escucharProductos();
};

// Trae los productos desde Firebase. Si alguien edita algo, se actualiza solo en todos los celulares
function escucharProductos() {
    db.collection("productos").onSnapshot((snapshot) => {
        products = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.docId = doc.id; // Guardamos el ID interno de Firebase para poder editarlo después
            products.push(data);
        });
        
        // Si la base de datos está completamente vacía (primera vez), creamos uno de prueba automáticamente
        if (products.length === 0) {
            crearProductoInicialDePrueba();
        } else {
            renderProducts();
        }
    });
}

// ====== RENDERIZADO DE PRODUCTOS ======
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    products.forEach((product, pIndex) => {
        const activeImageIndex = navigationSequence[product.currentSeqIndex || 0];
        const currentImgSrc = product.images[activeImageIndex] || "https://placehold.co";

        const card = document.createElement('div');
        card.className = `card ${isAdmin ? 'edit-mode' : ''}`;

        card.innerHTML = `
            <button class="btn-delete" style="display: ${isAdmin ? 'block' : 'none'}" onclick="deleteProduct('${product.docId}')">&times;</button>
            
            <div class="carousel">
                <button class="carousel-btn btn-prev" onclick="navigateCarousel(${pIndex}, -1)">&lsaquo;</button>
                <img class="carousel-img" src="${currentImgSrc}" onclick="openZoom('${currentImgSrc}')" alt="Producto">
                <button class="carousel-btn btn-next" onclick="navigateCarousel(${pIndex}, 1)">&rsaquo;</button>
            </div>

            <!-- Panel de cambio de foto gratuito para Administrador -->
            <div class="file-upload-container" style="display: ${isAdmin ? 'block' : 'none'}; margin-top: 10px;">
                <label style="font-weight: bold; display: block; margin-bottom: 4px;">Pegar enlace para foto ${activeImageIndex + 1}:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="url-img-${pIndex}" placeholder="https://ejemplo.com" style="flex: 1; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
                    <button onclick="saveImageUrl(${pIndex}, ${activeImageIndex})" style="background: #17a2b8; color: white; padding: 4px 8px; font-size: 12px;">Guardar Foto</button>
                </div>
            </div>

            <div class="card-body">
                <input type="text" class="prod-title" value="${product.title}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'title', this.value)">
                
                <div class="prod-price-wrapper">
                    <input type="number" class="prod-price" value="${product.price}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'price', this.value)">
                </div>
                
                <textarea class="prod-desc" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'description', this.value)">${product.description}</textarea>
                <button class="btn-buy" style="display: ${isAdmin ? 'none' : 'block'}" onclick="addToCart(${pIndex})">Comprar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Navegación del Carrusel
function navigateCarousel(productIndex, direction) {
    let seqIndex = products[productIndex].currentSeqIndex || 0;
    seqIndex += direction;

    if (seqIndex >= navigationSequence.length) seqIndex = 0;
    if (seqIndex < 0) seqIndex = navigationSequence.length - 1;

    products[productIndex].currentSeqIndex = seqIndex;
    renderProducts();
}

// Guardar enlace de imagen en la nube (Modo Admin Gratis)
function saveImageUrl(productIndex, imageIndex) {
    const inputUrl = document.getElementById(`url-img-${productIndex}`);
    if (!inputUrl || !inputUrl.value.trim()) {
        alert("Por favor, ingresa o pega un enlace de imagen válido.");
        return;
    }

    const product = products[productIndex];
    let nuevasImagenes = [...product.images];
    nuevasImagenes[imageIndex] = inputUrl.value.trim();

    db.collection("productos").doc(product.docId).update({
        images: nuevasImagenes
    }).then(() => {
        alert("¡Enlace de imagen actualizado con éxito en la nube!");
    }).catch((error) => {
        alert("Error al guardar la imagen: " + error.message);
    });
}

// Actualizar textos o precios en tiempo real en la nube
function updateProductField(docId, field, value) {
    let finalValue = field === 'price' ? parseFloat(value) || 0 : value;
    db.collection("productos").doc(docId).update({
        [field]: finalValue
    });
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

// Salir Admin
function logoutAdmin() {
    isAdmin = false;
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('btn-login').style.display = 'block';
    document.getElementById('btn-logout').style.display = 'none';
    renderProducts();
}

// Agregar Tarjeta Nueva en la Nube
function addNewProduct() {
    const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    db.collection("productos").add({
        id: nextId,
        title: "Nuevo Producto",
        price: 0,
        description: "Escribe una descripción aquí.",
        images: Array(7).fill("https://placehold.co"),
        currentSeqIndex: 0
    });
}

// Eliminar Tarjeta de la Nube para siempre
function deleteProduct(docId) {
    if(confirm("¿Estás seguro de eliminar este producto de la tienda de forma permanente?")) {
        db.collection("productos").doc(docId).delete();
    }
}

// Crear un producto base si la base de datos de Google inicia en blanco
function crearProductoInicialDePrueba() {
    db.collection("productos").add({
        id: 1,
        title: "Producto Ejemplo 1",
        price: 1500,
        description: "Descripción del producto de prueba con carrusel dinámico.",
        images: Array(7).fill("").map((_, i) => `https://placehold.co{i+1}`),
        currentSeqIndex: 0
    });
}

// Lógica de Carrito de Compras
function addToCart(index) {
    const prod = products[index];
    cart.push({ title: prod.title, price: prod.price });
    document.getElementById('cart-count').innerText = cart.length;
    alert(`"${prod.title}" ha sido agregado a tus compras.`);
}

// Abrir Carrito
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

// Enviar por WhatsApp
function sendWhatsapp() {
    if (cart.length === 0) {
        alert("No tienes productos en tu carrito.");
        return;
    }
    let bodyText = "Hola, quiero realizar este pedido:\n\n";
    let total = 0;
cart.forEach((item, idx) => {
    bodyText += `* ${idx + 1}. ${item.title} - $${item.price}\n`;
    total += item.price;
});
bodyText += `\n*Total: $${total.toLocaleString('es-ar')}*`;
const url = `https://wa.me{TELEFONO_WHATSAPP}?text=${encodeURIComponent(bodyText)}`;
window.open(url, "_blank");
}

// Enviar por Mail
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
};
