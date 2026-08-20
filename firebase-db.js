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

// Inicializamos Firebase de forma clásica
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función que usará tu archivo original para mandar los datos actualizados a internet
function guardarEnLaNube(datosAActualizar) {
    database.ref('tienda_productos').set(datosAActualizar)
        .then(() => console.log("☁️ Base de datos en la nube actualizada"))
        .catch(error => console.error("Error al subir a la nube:", error));
}

// Escuchamos la nube en tiempo real. 
database.ref('tienda_productos').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Actualizamos de forma segura la variable global de tu archivo original
        products = data; 
        
        // Redibujamos la pantalla con las tarjetas nuevas
        if (typeof renderProducts === "function") {
            renderProducts();
        }
    }
});

