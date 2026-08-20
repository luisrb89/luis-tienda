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

// 🚀 CANDADO DE TIEMPO: Al arrancar la página, el guardado está BLOQUEADO por defecto
let bloqueoArranqueActivo = true;

// Habilitamos el guardado automático recién a los 3 segundos de cargar la web
// tiempo más que suficiente para que Firebase ya haya descargado todo
setTimeout(() => {
    bloqueoArranqueActivo = false;
    console.log("🔓 Sistema de guardado automático en Firebase activado de forma segura.");
}, 3000);

// Función que manda datos hacia internet
function guardarEnLaNube(datosAActualizar) {
    // Si el candado de arranque está activo, ignoramos la orden de guardar para no borrar la nube
    if (bloqueoArranqueActivo) {
        console.log("⚠️ Intento de guardado bloqueado por seguridad durante el arranque.");
        return;
    }

    if (!datosAActualizar || datosAActualizar.length === 0) return;

    database.ref('tienda_productos').set(datosAActualizar)
        .then(() => console.log("☁️ Base de datos en la nube actualizada con éxito"))
        .catch(error => console.error("Error al guardar en la nube:", error));
}

// Escuchamos la base de datos en tiempo real
database.ref('tienda_productos').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Vaciamos el array actual de forma segura sin romper la variable global
    products.length = 0; 

    if (data) {
        // Convertimos a formato array si viene como objeto
        const arrProductos = Array.isArray(data) ? data : Object.values(data);
        
        arrProductos.forEach(item => {
            if (item) products.push(item);
        });
        
        console.log("📦 Productos sincronizados desde Firebase con éxito");
    } else {
        // Si la base de datos en internet está totalmente vacía, le inyectamos una muestra inicial
        console.log("Base de datos vacía en internet. Creando producto inicial...");
        products.push({
            id: 1,
            title: "Producto Inicial",
            price: 1000,
            description: "¡Sincronización exitosa! Entra como Admin para cargar tus productos reales.",
            images: Array(6).fill("").map(() => "https://placehold.co"),
            currentSeqIndex: 0
        });
        // Permitimos escribir solo para inicializar el nodo por única vez
        database.ref('tienda_productos').set(products);
    }
    
    // Forzamos al archivo original a dibujar la pantalla con los datos reales
    if (typeof renderProducts === "function") {
        renderProducts();
    }
});
