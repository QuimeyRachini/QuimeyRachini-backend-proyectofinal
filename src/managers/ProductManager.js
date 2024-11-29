import fs from "fs";
import { fileURLToPath } from "url"; 
import { dirname, join } from "path"; 

class ProductManager {
    static ultId = 0; // ID de último producto generado

    constructor(filePath) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        this.path = join(__dirname, '../data/productos.json'); // Ruta del archivo JSON
        this.products = []; // Array de productos
        this.cargarArray(); // Cargar productos desde el archivo
    }

    async cargarArray() {
        try {
            // Si no existe el archivo, lo crea vacío
            if (!fs.existsSync(this.path)) {
                await this.guardarArchivo([]);
            }
            // Leer el archivo y cargar productos
            this.products = await this.leerArchivo(); 
            ProductManager.ultId = this.products.length > 0 
                ? Math.max(...this.products.map(product => product.id)) 
                : 0;
        } catch (error) {
            console.log("Error del sistema al inicializar ProductManager", error);
        }
    }

    // Método para obtener productos
    async getProducts({ limit = 10, page = 1, sort = '', query = '', category = '', available = '' }) {
        try {
            // Obtener todos los productos
            const allProducts = await this.leerArchivo();

            // Filtrado por nombre
            const filteredProducts = allProducts.filter(product => {
                let matchesQuery = query ? product.title.toLowerCase().includes(query.toLowerCase()) : true;
                let matchesCategory = category ? product.category && product.category.toLowerCase() === category.toLowerCase() : true;
                let matchesAvailability = available ? product.stock > 0 : true;
                return matchesQuery && matchesCategory && matchesAvailability;
            });

            // Ordenamiento por precio
            const sortedProducts = sort.toLowerCase() === 'desc'
                ? filteredProducts.sort((a, b) => b.price - a.price)
                : filteredProducts.sort((a, b) => a.price - b.price);

            // Paginación
            const startIndex = (page - 1) * limit;
            const paginatedProducts = sortedProducts.slice(startIndex, startIndex + limit);

            // Resultado de paginación
            return {
                status: 'success',
                payload: paginatedProducts, // Productos de la página actual
                totalPages: Math.ceil(filteredProducts.length / limit), // Total de páginas
                prevPage: page > 1 ? page - 1 : null, // Página anterior (si existe)
                nextPage: page < Math.ceil(filteredProducts.length / limit) ? page + 1 : null, // Página siguiente (si existe)
                page: page, // Página actual
                hasPrevPage: page > 1, // Indicador de si hay página anterior
                hasNextPage: page < Math.ceil(filteredProducts.length / limit), // Indicador de si hay página siguiente
                prevLink: page > 1 ? `/api/products?page=${page - 1}&limit=${limit}&sort=${sort}&query=${query}&category=${category}&available=${available}` : null,
                nextLink: page < Math.ceil(filteredProducts.length / limit) ? `/api/products?page=${page + 1}&limit=${limit}&sort=${sort}&query=${query}&category=${category}&available=${available}` : null,
            };
        } catch (error) {
            console.log("Error al obtener productos", error);
            return {
                status: 'error',
                message: "Error al obtener productos"
            };
        }
    }

    // Leer el archivo JSON
    async leerArchivo() {
        try {
            const respuesta = await fs.promises.readFile(this.path, "utf-8"); 
            return JSON.parse(respuesta); // Parsear el contenido del archivo JSON
        } catch (error) {
            console.log("Error al leer el archivo", error);
            return []; // Devuelve un array vacío en caso de error
        }
    }

    // Guardar el archivo JSON
    async guardarArchivo(arrayProductos) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(arrayProductos, null, 2)); // Guardar productos en el archivo
        } catch (error) {
            console.log("Error al guardar el archivo", error);
        }
    }
}

export default ProductManager;




