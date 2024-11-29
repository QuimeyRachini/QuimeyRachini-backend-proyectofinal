import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import productsRouter from './routes/products.routes.js';
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import CartManager from './managers/cart-manager.js';
import ProductManager from './managers/ProductManager.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Express
const app = express();
const PORT = 8080;
const cartManager = new CartManager(path.join(__dirname, 'data', 'carts.json'));
const productManager = new ProductManager(path.join(__dirname, "data", "productos.json"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/", viewsRouter);

// Datos iniciales de productos
const initialProducts = [
    { title: "Fideos", description: "Marolio", code: "abc444", price: 1.5, img: "sin imagen", stock: 85 },
    { title: "Pure de Tomate", description: "Arcor", code: "pmr333", price: 800, img: "sin imagen", stock: 50 },
    { title: "Dulce de Leche", description: "Ilolay", code: "ouf678", price: 2.5, img: "sin imagen", stock: 100 },
    { title: "Gaseosa", description: "Pepsi", code: "jkl898", price: 1.2, img: "sin imagen", stock: 59 },
    { title: "Cafe", description: "Nestle", code: "loi243", price: 950, img: "sin imagen", stock: 8 },
    { title: "Alfajor", description: "Aguila", code: "kah978", price: 1000, img: "sin imagen", stock: 32 },
    { title: "Mayonesa", description: "Fiesta", code: "prn991", price: 700, img: "sin imagen", stock: 100 },
    { title: "Manteca", description: "La serenisima", code: "kjl992", price: 3800, img: "sin imagen", stock: 190 }
  
];

// Endpoint para renderizar la vista "home" con productos iniciales
app.get('/products', (req, res) => {
    res.render('home', { layout: 'main', productos: initialProducts });
});

// Iniciar servidor HTTP y WebSocket
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const io = new Server(httpServer);

// Función para actualizar productos en todos los clientes conectados
const updateProducts = async () => {
    const productos = await productManager.getProducts();
    io.emit("productos", productos); // Emitir la lista de productos a todos los clientes
};

// Conexión de WebSocket
io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    // Enviar la lista de productos actuales al nuevo cliente
    socket.emit("productos", await productManager.getProducts());

    // Manejar el evento de agregar producto
    socket.on("addProduct", async (newProduct) => {
        await productManager.addProduct(newProduct);
        await updateProducts(); // Actualizar productos para todos los clientes
    });

    // Manejar el evento de eliminar producto
    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);
        await updateProducts(); // Actualizar productos para todos los clientes
    });
});

// Crear nuevo producto (POST)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = req.body;
        await productManager.addProduct(newProduct);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: 'Error al agregar el producto', details: error.message });
    }
});

// Actualizar producto (PUT)
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedData = req.body;

        await productManager.updateProduct(productId, updatedData);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
    }
});

// Eliminar producto (DELETE)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        await productManager.deleteProduct(productId);
        await updateProducts(); // Actualiza la lista de productos en todos los clientes conectados
        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
    }
});

