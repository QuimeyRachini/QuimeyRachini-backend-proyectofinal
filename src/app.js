import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path"; 
import productsRouter from './routes/products.routes.js';
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import CartManager from './managers/cart-manager.js';
import ProductManager from './managers/product-manager.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const cartManager = new CartManager(path.join(__dirname, 'data', 'carts.json'));
const manager = new ProductManager(path.join(__dirname, "data", "productos.json"));

// Usar el cartManager para interactuar con los carritos
(async () => {
    const nuevoCarrito = await cartManager.crearCarrito();
    console.log('Carrito creado:', nuevoCarrito);
})();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/", viewsRouter);

const PUERTO = 8080;
const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en http://localhost:${PUERTO}`);
});

const io = new Server(httpServer);

// Función para actualizar productos en todos los clientes conectados
const updateProducts = async () => {
    const productos = await manager.getProducts();
    io.emit("productos", productos); // Emitir la lista de productos a todos los clientes
};

// Conexión de WebSocket
io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    // Enviar la lista de productos actuales al nuevo cliente
    socket.emit("productos", await manager.getProducts());

    // Manejar el evento de agregar producto
    socket.on('addProduct', async (newProduct) => {
        await manager.addProduct(newProduct);
        await updateProducts(); // Actualizar productos para todos los clientes
    });

    // Manejar el evento de eliminar producto
    socket.on('deleteProduct', async (id) => {
        await manager.deleteProduct(id);
        await updateProducts(); // Actualizar productos para todos los clientes
    });
});

// Crear nuevo producto (POST)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = req.body;
        await manager.addProduct(newProduct);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(400).json({ error: 'Error al agregar el producto', details: error.message });
    }
});

// Actualizar producto (PUT)
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedData = req.body;

        await manager.updateProduct(productId, updatedData);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(400).json({ error: 'Error al actualizar el producto', details: error.message });
    }
});

// Eliminar producto (DELETE)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        await manager.deleteProduct(productId);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(400).json({ error: 'Error al eliminar el producto', details: error.message });
    }
});
