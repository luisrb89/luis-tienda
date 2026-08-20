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

// Bandera de seguridad para evitar bucles de borrado al recargar la página
let firebaseCargadoInicialmente = false;

// Función que manda datos hacia internet (Solo guarda si hay datos reales)
function guardarEnLaNube(datosAActualizar) {
    // 🚀 BLOQUEO DE SEGURIDAD ANTIBORRADO: 
    // Si la página se está recargando y Firebase no terminó de entregar los datos,
    // o si el array está totalmente vacío por el arranque, PROHIBIMOS pisar la nube.
    if (!firebaseCargadoInicialmente || !datosAActualizar || datosAActualizar.length === 0) {
        console.log("⚠️ Guardado automático bloqueado para evitar borrar la base de datos.");
        return; 
    }

    database.ref('tienda_productos').set(datosAActualizar)
        .then(() => console.log("☁️ Base de datos en la nube actualizada con éxito"))
        .catch(error => console.error("Error al guardar en la nube:", error));
}

// Escuchamos la base de datos en tiempo real de forma segura
database.ref('tienda_productos').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Desactivamos temporalmente el guardado para que el push no genere cortocircuitos
    const estadoPrevio = firebaseCargadoInicialmente;
    firebaseCargadoInicialmente = false;

    // Vaciamos el array actual sin romper su referencia global
    products.length = 0; 

    if (data) {
        // Convertimos a formato array si viene como objeto
        const arrProductos = Array.isArray(data) ? data : Object.values(data);
        
        arrProductos.forEach(item => {
            if (item) products.push(item);
        });
        
        console.log("📦 Productos sincronizados desde Firebase con éxito");
        firebaseCargadoInicialmente = true; // Sincronización exitosa, habilitamos el guardado real
    } else {
        // Si la base de datos en internet está virgen de verdad, creamos la primera tarjeta de muestra
        console.log("Base de datos vacía en internet. Creando producto inicial...");
        products.push({
            id: 1,
            title: "Producto Inicial",
            price: 1000,
            description: "¡Sincronización con Firebase exitosa! Entra como Admin para cargar tus productos.",
            images: Array(6).fill("").map(() => "https://placehold.co"),
            currentSeqIndex: 0
        });
        firebaseCargadoInicialmente = true;
        database.ref('tienda_productos').set(products);
    }
    
    // Forzamos al archivo original a dibujar la pantalla con los datos reales de internet
    if (typeof renderProducts === "function") {
        renderProducts();
    }
});



