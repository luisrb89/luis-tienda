// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCd5_9ubvw9ggRNfHa-NpviS43XRNEjp-M",
    authDomain: "://firebaseapp.com",
    databaseURL: "https://firebaseio.com",
    projectId: "tienda-1989",
    storageBucket: "://appspot.com",
    messagingSenderId: "819818779178",
    appId: "1:819818779178:web:d6c57a7eef59df3985e953",
    measurementId: "G-XRFEZLJCCS"
};

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función que manda datos hacia internet
function guardarEnLaNube(datosAActualizar) {
    if (!datosAActualizar) return;
    database.ref('tienda_productos').set(datosAActualizar)
        .then(() => console.log("☁️ Base de datos en la nube actualizada"))
        .catch(error => console.error("Error al guardar en la nube:", error));
}
// Escuchamos la base de datos en tiempo real
database.ref('tienda_productos').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Vaciamos el array actual de forma segura sin romper la variable global
    products.length = 0; 

    if (data) {
        // Si Firebase devuelve un objeto en vez de un array, lo convertimos automáticamente
        const arrProductos = Array.isArray(data) ? data : Object.values(data);
        
        // Inyectamos los elementos válidos uno por uno
        arrProductos.forEach(item => {
            if (item) products.push(item);
        });
        
        console.log("📦 Productos sincronizados desde Firebase con éxito");
    }
    
    // Si después de leer sigue vacío, le inyectamos la tarjeta de emergencia
    if (products.length === 0) {
        console.log("Base de datos vacía en internet. Inicializando tarjeta de prueba...");
        products.push({
            id: 1,
            title: "Producto Inicial",
            price: 1000,
            description: "¡Sincronización con Firebase exitosa! Ya puedes entrar como Admin y cargar tus productos.",
            images: Array(6).fill("").map(() => "https://placehold.co"),
            currentSeqIndex: 0
        });
        database.ref('tienda_productos').set(products);
    }
    
    // 🚀 LA CORRECCIÓN CLAVE AQUÍ:
    // Le avisamos a la función renderProducts que respete si ya estás logueado como Admin o no
    if (typeof renderProducts === "function") {
        // Ejecutamos tu render original manteniendo la variable isAdmin intacta
        renderProducts();
    }
});



