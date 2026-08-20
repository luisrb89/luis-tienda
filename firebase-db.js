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

