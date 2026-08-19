// === ASISTENTE AUTOMÁTICO DE BASE DE DATOS LOCAL ===

// Inyecta botones de respaldo de datos de forma automática en el Panel de Administración
window.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        // Contenedor para que los botones queden estéticos y ordenados
        const backupContainer = document.createElement('div');
        backupContainer.style.marginTop = "15px";
        backupContainer.style.display = "flex";
        backupContainer.style.gap = "10px";
        backupContainer.style.flexWrap = "wrap";

        // Botón para Descargar Catálogo
        const btnExportar = document.createElement('button');
        btnExportar.innerHTML = "📥 Descargar productos.json";
        btnExportar.style.backgroundColor = "#28a745";
        btnExportar.style.color = "white";
        btnExportar.onclick = exportarCatalogoTienda;

        // Botón para Cargar Catálogo desde un archivo
        const btnImportar = document.createElement('button');
        btnImportar.innerHTML = "📤 Cargar productos.json";
        btnImportar.style.backgroundColor = "#6c757d";
        btnImportar.style.color = "white";
        btnImportar.onclick = () => document.getElementById('db-file-input').click();

        // Input oculto para procesar la subida del archivo
        const fileInput = document.createElement('input');
        fileInput.type = "file";
        fileInput.id = "db-file-input";
        fileInput.accept = ".json";
        fileInput.style.display = "none";
        fileInput.onchange = importarCatalogoTienda;

        // Armamos el bloque visual dentro del panel
        backupContainer.appendChild(btnExportar);
        backupContainer.appendChild(btnImportar);
        backupContainer.appendChild(fileInput);
        adminPanel.appendChild(backupContainer);
    }
});

// Función para descargar tus productos actuales en un archivo real
function exportarCatalogoTienda() {
    if (typeof products === 'undefined' || products.length === 0) {
        alert("No hay productos disponibles para exportar.");
        return;
    }
    // Convertimos la lista de tu JS original en un archivo de texto JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products));
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute("href", dataStr);
    downloadLink.setAttribute("download", "productos.json");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

// Función para leer el archivo subido y actualizar las tarjetas en pantalla
function importarCatalogoTienda(event) {
    const file = event.target.files[0];
    if (!file) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const jsonParseado = JSON.parse(e.target.result);
            if (Array.isArray(jsonParseado)) {
                // Reemplazamos los productos del script.js original con los del archivo
                products = jsonParseado;
                
                // Si tu script original usa localstorage para recordar cambios temporales, lo actualizamos
                localStorage.setItem('tienda_productos', JSON.stringify(products));
                
                // Refrescamos la pantalla usando la función nativa de tu script.js
                if (typeof renderProducts === 'function') {
                    renderProducts();
                }
                alert("¡Catálogo cargado con éxito en este dispositivo!");
            } else {
                alert("El archivo no tiene el formato de catálogo correcto.");
            }
        } catch (err) {
            alert("Error al procesar el archivo .json");
        }
    };
    lector.readAsText(file);
}
