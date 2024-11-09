import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ProductManager from "./ProductManager.js";  // Asegúrate de importar el ProductManager para obtener productos completos

class CartManager {
    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        this.path = join(__dirname, "../data/carts.json");
        this.carts = [];
        this.ultId = 0;
        this.productManager = new ProductManager();  // Instancia de ProductManager
        this.cargarCarritos(); // Carga los carritos al iniciar el manager
    }

    // Cargar carritos desde el archivo
    async cargarCarritos() {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            this.carts = JSON.parse(data);
            if (this.carts.length > 0) {
                this.ultId = Math.max(...this.carts.map(cart => cart.id)); // Establece el último ID
            }
        } catch (error) {
            console.log("Error al cargar los carritos:", error);
            await this.guardarCarritos(); // Si no existe el archivo, crea uno nuevo
        }
    }

    // Guardar los carritos en el archivo JSON
    async guardarCarritos() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.log("Error al guardar los carritos:", error);
        }
    }

    // Crear un nuevo carrito
    async crearCarrito() {
        const nuevoCarrito = {
            id: ++this.ultId,
            products: []
        };

        this.carts.push(nuevoCarrito);
        await this.guardarCarritos(); // Guardar el carrito creado en el archivo
        return nuevoCarrito;
    }

    // Obtener un carrito por su ID
    async getCarritoById(carritoId) {
        try {
            const carritoBuscado = this.carts.find(carrito => carrito.id === carritoId);
            if (!carritoBuscado) {
                throw new Error("Carrito no encontrado");
            }

            // Obtener productos completos utilizando populate
            const carritoConProductos = await this.populateProducts(carritoBuscado);
            return carritoConProductos;

        } catch (error) {
            console.log("Error al obtener el carrito:", error);
            throw error;
        }
    }

    // Poblar los productos del carrito
    async populateProducts(carrito) {
        const productosCompletos = await Promise.all(
            carrito.products.map(async (item) => {
                const product = await this.productManager.getProductById(item.product);
                return { ...item, product };  // Retorna el producto completo junto con la cantidad
            })
        );
        return { ...carrito, products: productosCompletos };
    }

    // Agregar un producto a un carrito
    async agregarProductoAlCarrito(carritoId, productoId, quantity = 1) {
        try {
            const carrito = await this.getCarritoById(carritoId);

            // Verifica si el producto ya está en el carrito
            const existeProducto = carrito.products.find(p => p.product.id === productoId);
            if (existeProducto) {
                // Si el producto ya existe, solo incrementa la cantidad
                existeProducto.quantity += quantity;
            } else {
                // Si no existe, agrega el producto con la cantidad
                carrito.products.push({ product: productoId, quantity });
            }

            await this.guardarCarritos(); // Guarda los cambios en el archivo
            return carrito;
        } catch (error) {
            console.log("Error al agregar producto al carrito:", error);
            throw error;
        }
    }

    // Eliminar un producto de un carrito
    async eliminarProductoDelCarrito(carritoId, productoId) {
        try {
            const carrito = await this.getCarritoById(carritoId);

            // Filtra el producto a eliminar
            const productosRestantes = carrito.products.filter(p => p.product.id !== productoId);

            if (productosRestantes.length === carrito.products.length) {
                throw new Error("Producto no encontrado en el carrito");
            }

            carrito.products = productosRestantes; // Actualiza los productos en el carrito
            await this.guardarCarritos(); // Guarda los cambios
            return carrito;
        } catch (error) {
            console.log("Error al eliminar producto del carrito:", error);
            throw error;
        }
    }

    // Actualizar la cantidad de un producto en el carrito
    async actualizarCantidadProducto(carritoId, productoId, quantity) {
        try {
            if (quantity <= 0) {
                throw new Error("La cantidad debe ser mayor que 0");
            }

            const carrito = await this.getCarritoById(carritoId);

            const producto = carrito.products.find(p => p.product.id === productoId);
            if (!producto) {
                throw new Error("Producto no encontrado en el carrito");
            }

            producto.quantity = quantity; // Actualiza la cantidad del producto
            await this.guardarCarritos(); // Guarda los cambios
            return carrito;
        } catch (error) {
            console.log("Error al actualizar la cantidad del producto:", error);
            throw error;
        }
    }

    // Eliminar todos los productos de un carrito
    async eliminarTodosLosProductos(carritoId) {
        try {
            const carrito = await this.getCarritoById(carritoId);
            carrito.products = []; // Elimina todos los productos
            await this.guardarCarritos(); // Guarda los cambios
            return carrito;
        } catch (error) {
            console.log("Error al eliminar todos los productos del carrito:", error);
            throw error;
        }
    }
}

export default CartManager;


