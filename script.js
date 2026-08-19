// =========================================================================
// CONFIGURACIÓN DE APIS
// =========================================================================
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tienda-1989.firebaseapp.com",
    projectId: "tienda-1989",
    storageBucket: "tienda-1989.firebasestorage.app",
    messagingSenderId: "819818779178",
    appId: "1:819818779178:web:d6c57a7eef59df3905e953",
    measurementId: "G-XRFEZLJCCS"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const IMGBB_API_KEY = "TU_IMGBB_API_KEY";
const TELEFONO_WHATSAPP = "5491100000000";

// =========================================================================
// ESTADO GLOBAL
// =========================================================================
let isAdmin = false;
let products = [];

const navigationSequence = [0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 0];

window.onload = function () {
    escucharProductos();
};

function escucharProductos() {
    db.collection("productos").onSnapshot((snapshot) => {
        products = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.docId = doc.id;
            products.push(data);
        });

        if (products.length === 0) {
            crearProductoInicialDePrueba();
        } else {
            renderProducts();
        }
    }, (error) => {
        console.error("Error en Firestore:", error);
    });
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach((product, pIndex) => {
        const activeImageIndex = navigationSequence[product.currentSeqIndex || 0];
        const currentImgSrc = (product.images && product.images[activeImageIndex]) || "https://placehold.co/600x400?text=Sin+imagen";

        const card = document.createElement('div');
        card.className = `card ${isAdmin ? 'edit-mode' : ''}`;

        card.innerHTML = `
            <button class="btn-delete" style="display: ${isAdmin ? 'block' : 'none'}" onclick="deleteProduct('${product.docId}')">&times;</button>
            
            <div class="carousel">
                <button class="carousel-btn btn-prev" onclick="navigateCarousel(${pIndex}, -1)">&lsaquo;</button>
                <img class="carousel-img" src="${currentImgSrc}" onclick="openZoom('${currentImgSrc}')" alt="Producto" style="cursor: pointer;">
                <button class="carousel-btn btn-next" onclick="navigateCarousel(${pIndex}, 1)">&rsaquo;</button>
            </div>

            <div class="file-upload-container" style="display: ${isAdmin ? 'block' : 'none'}; margin-top: 10px; padding: 0 10px;">
                <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 13px;">Cambiar foto ${activeImageIndex + 1}:</label>
                <input type="file" accept="image/*" onchange="uploadImageDirect(event, ${pIndex}, ${activeImageIndex})" style="font-size: 12px; width: 100%;">
            </div>

            <div class="card-body">
                <input type="text" class="prod-title" value="${product.title || ''}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'title', this.value)">
                
                <div class="prod-price-wrapper">
                    <input type="number" class="prod-price" value="${product.price || 0}" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'price', this.value)">
                </div>
                
                <textarea class="prod-desc" ${!isAdmin ? 'disabled' : ''} onchange="updateProductField('${product.docId}', 'description', this.value)">${product.description || ''}</textarea>
                <button class="btn-buy" style="display: ${isAdmin ? 'none' : 'block'}" onclick="addToCart(${pIndex})">Comprar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function navigateCarousel(productIndex, direction) {
    let seqIndex = products[productIndex].currentSeqIndex || 0;
    seqIndex += direction;

    if (seqIndex >= navigationSequence.length) seqIndex = 0;
    if (seqIndex < 0) seqIndex = navigationSequence.length - 1;

    products[productIndex].currentSeqIndex = seqIndex;
    renderProducts();
}

function uploadImageDirect(event, productIndex, imageIndex) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo imagen... Por favor espera.");

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const urlSubida = result.data.url;
            const product = products[productIndex];
            let nuevasImagenes = product.images ? [...product.images] : [];

            while (nuevasImagenes.length < 7) {
                nuevasImagenes.push("https://placehold.co/600x400?text=Sin+imagen");
            }

            nuevasImagenes[imageIndex] = urlSubida;

            db.collection("productos").doc(product.docId).update({
                images: nuevasImagenes
            }).then(() => {
                alert("¡Imagen guardada con éxito!");
            });
        } else {
            alert("Error de ImgBB: " + (result.error ? result.error.message : "Fallo en la carga"));
        }
    })
    .catch(error => {
        alert("Error de conexión: " + error.message);
    });
}

function updateProductField(docId, field, value) {
    let finalValue = field === 'price' ? parseFloat(value) || 0 : value;
    db.collection("productos").doc(docId).update({
        [field]: finalValue
    });
}

function addToCart(productIndex) {
    const product = products[productIndex];
    if (!product) return;

    const mensaje = `¡Hola! Me interesa comprar el siguiente producto:\n\n` +
                    `🛍️ *Producto:* ${product.title}\n` +
                    `💰 *Precio:* $${product.price}\n` +
                    `📝 *Detalles:* ${product.description}\n\n` +
                    `¿Tienen stock disponible?`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');
}

function openZoom(imgSrc) {
    const zoomWindow = window.open();
    if (zoomWindow) {
        zoomWindow.document.write(`
            <body style="background-color: #111; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
                <img src="${imgSrc}" style="max-width: 90%; max-height: 90vh; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            </body>
        `);
        zoomWindow.document.title = "Vista ampliada del producto";
    }
}

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

function addNewProduct() {
    const nextId = products.length ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    db.collection("productos").add({
        id: nextId,
        title: "Nuevo Producto",
        price: 0,
        description: "Escribe una descripción aquí.",
        images: Array(7).fill("https://placehold.co/600x400?text=Sin+imagen"),
        currentSeqIndex: 0
    });
}

function deleteProduct(docId) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        db.collection("productos").doc(docId).delete();
    }
}

function crearProductoInicialDePrueba() {
    db.collection("productos").add({
        id: 1,
        title: "Producto Ejemplo 1",
        price: 1500,
        description: "Descripción del producto de prueba con carrusel dinámico.",
        images: Array(7).fill("").map((_, i) => `https://placehold.co/600x400?text=Foto+${i + 1}`),
        currentSeqIndex: 0
    });
}
