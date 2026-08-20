// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCd5_9ubvw9ggRNfHa-NpviS43XRNEjp-M",
    authDomain: "tienda-1989.firebaseapp.com",
    databaseURL: "https://tienda-1989-default-rtdb.firebaseio.com",
    projectId: "tienda-1989",
    storageBucket: "tienda-1989.appspot.com",
    messagingSenderId: "819818779178",
    appId: "1:819818779178:web:d6c57a7eef59df3985e953",
    measurementId: "G-XRFEZLJCCS"
};

// Inicializamos la base de datos de Google con sus datos completos
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función que manda datos hacia internet
function guardarEnLaNube(datosAActualizar) {
    if (!datosAActualizar || datosAActualizar.length === 0) {
        console.log("⚠️ Intento de guardado ignorado: Array vacío.");
        return;
    }
    database.ref('tienda_productos').set(datosAActualizar)
        .then(() => console.log("☁️ Base de datos en la nube actualizada con éxito"))
        .catch(error => console.error("Error al guardar en la nube:", error));
}

// Escuchamos la base de datos en tiempo real de forma segura sin congelar el inicio de sesión
database.ref('tienda_productos').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // Si por alguna razón la variable global no existe todavía, la creamos vacía
    if (typeof products === 'undefined') {
        window.products = [];
    }

    if (data) {
        // Convertimos a formato array si viene como objeto desde Firebase
        const arrProductos = Array.isArray(data) ? data : Object.values(data);
        
        // 🚀 CORRECCIÓN CLAVE: Sobrescribimos el contenido usando reasignación directa limpia
        // Esto evita que JavaScript tire error matemático si el archivo largo arranca lento
        products = arrProductos.filter(item => item !== null);
        console.log("📦 Productos sincronizados desde Firebase con éxito");
    } else {
        // Si la base de datos en internet está totalmente vacía, creamos la primera tarjeta de muestra
        console.log("Base de datos vacía en internet. Inicializando tarjeta de prueba...");
        products = [
            {
                id: 1,
                title: "Producto Inicial",
                price: 1000,
                description: "¡Sincronización con Firebase exitosa! Ya puedes entrar como Admin y cargar tus productos.",
                images: Array(6).fill("").map(() => "https://placehold.co"),
                currentSeqIndex: 0
            }
        ];
        // Seteamos el nodo inicial en la nube
        database.ref('tienda_productos').set(products);
    }
    
    // Forzamos al archivo original a dibujar la pantalla con los datos frescos
    if (typeof renderProducts === "function") {
        renderProducts();
    }
});

