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
    
    // Vaciamos el array actual sin romper su referencia en memoria
    products.length = 0; 

    if (data && data.length > 0) {
        // 🚀 SOLUCIÓN: Inyectamos los elementos uno por uno de forma segura
        data.forEach(item => {
            if(item) products.push(item);
        });
        console.log("📦 Productos sincronizados desde Firebase con éxito");
    } else {
        // Si el servidor de Firebase está totalmente vacío, le metemos una tarjeta inicial
        console.log("Base de datos vacía en internet. Inicializando...");
        const initialProducts = [
            {
                id: 1,
                title: "Producto Inicial",
                price: 1000,
                description: "¡Sincronización con Firebase exitosa! Ya puedes usar tu Modo Admin.",
                images: Array(6).fill("").map(() => "https://placehold.co"),
                currentSeqIndex: 0
            }
        ];
        // Lo mandamos a la nube
        database.ref('tienda_productos').set(initialProducts);
    }
    
    // Forzamos al archivo original a dibujar las tarjetas en la pantalla
    if (typeof renderProducts === "function") {
        renderProducts();
    }
});
