// =========================================================================
// 🔥 CONFIGURACIÓN DE APIS (Firebase de Luis + Nube Gratuita de ImgBB)
// =========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyCd5_9Ubvw9ggRNfHa-NpVs43XRNEjp-M",
    authDomain: "tienda-1989.firebaseapp.com",
    projectId: "tienda-1989",
    storageBucket: "tienda-1989.firebasestorage.app",
    messagingSenderId: "819818779178",
    appId: "1:819818779178:web:d6c57a7eef59df3905e953",
    measurementId: "G-XRFEZLJCCS"
};

// Inicializar Firebase Firestore (Base de datos en la nube)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔑 TU CLAVE REAL DE IMGBB YA INTEGRADA:
const IMGBB_API_KEY = "9c49c9b30f92b50ab36b6b0eae52152c";

// 📱 CONFIGURÁ AQUÍ TU TELÉFONO REAL DE WHATSAPP (Solo números, con tu código de país)
const TELEFONO_WHATSAPP = "5491100000000"; 

// =========================================================================
// 🛒 ESTADO GLOBAL DE LA APLICACIÓN
// =========================================================================
let isAdmin = false;
let cart = [];
let products = []; 

// Tu secuencia exacta de navegación de imágenes corregida y completada
const navigationSequence = [0,1,2,3,4,5,6,5,4,3,2,1,0]; // 👈 Reparado aquí

// Al cargar la página, escuchar la Base de Datos en tiempo real
window.onload = function() {
    escucharProductos();
};

// Escuchar productos en tiempo real desde la nube
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
        console.error("Error en Firestore (reglas bloqueadas):", error);
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

            <!-- 📸 BOTÓN DE SUBIDA DIRECTA DESDE LA COMPUTADORA -->
            <div class="file-upload-container" style="display: ${isAdmin ? 'block' : 'none'}; margin-top: 10px; padding: 0 10px;">
                <label style="font-weight: bold; display: block; margin-bottom: 4px; font-size: 13px;">Cambiar foto ${activeImageIndex + 1}:</label>
                <input type="file" accept="image/*" onchange="uploadImageDirect(event, ${pIndex}, ${activeImageIndex})" style="font-size: 12px; width: 100%;">
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

// 🔥 FUNCIÓN DE SUBIDA AUTOMÁTICA A IMGBB Y GUARDADO EN FIREBASE
function uploadImageDirect(event, productIndex, imageIndex) {
    const file = event.target.files[0];
    if (!file) return;

    alert("Subiendo imagen a internet de forma segura... Por favor espera.");

    const formData = new FormData();
    formData.append("image", file);

    fetch(`https://imgbb.com{IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const urlSubida = result.data.url; 
            const product = products[productIndex];
            let nuevasImagenes = [...product.images];
            nuevasImagenes[imageIndex] = urlSubida;

            db.collection("productos").doc(product.docId).update({
                images: nuevasImagenes
            }).then(() => {
                alert("¡Imagen guardada en internet con éxito!");
            });
        } else {
            alert("Error de ImgBB: " + result.error.message);
        }
    })
    .catch(error => {
        alert("Error de conexión: " + error.message);
    });
}

// Actualizar textos o precios en la nube
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

// Eliminar Tarjeta de la Nube
function deleteProduct(docId) {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
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
    }).then(() => {
        console.log("¡Producto base creado con éxito!");
    }).catch((error) => {
        console.error("Error al crear producto de prueba: ", error);
    });
}

// Funciones añadidas para abrir/cerrar carrito y zoom modales
function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'block';
}
function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}
function openZoom(imgSrc) {
    const modal = document.getElementById('zoom-modal');
    const zoomedImg = document.getElementById('zoomed-img');
    if (modal && zoomedImg) {
        zoomedImg.src = imgSrc;
        modal.style.display = 'block';
    }
}
function closeZoom() {
    const modal = document.getElementById('zoom-modal');
    if (modal) modal.style.display = 'none';
}
