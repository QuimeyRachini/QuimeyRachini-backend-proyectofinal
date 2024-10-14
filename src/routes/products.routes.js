import express from "express"; 
import ProductManager from "../managers/product-manager.js";

const manager = new ProductManager("./src/data/productos.json");
const router = express.Router();

// Obtener productos con límite opcional
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit; 
        const productos = await manager.getProducts(); 

        const numericLimit = limit ? parseInt(limit) : productos.length;
        res.json(productos.slice(0, numericLimit)); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del sistema");
    }
});

// Obtener producto por ID
router.get("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid); 

    try {
        const productoBuscado = await manager.getProductById(id);

        if (!productoBuscado) {
            return res.status(404).json({ message: "Producto no se encuentra en el sistema" });
        }
        res.json(productoBuscado); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del sistema: " + error.message); 
    }
});

// Agregar nuevo producto
router.post("/", async (req, res) => {
    const nuevoProducto = req.body; 

    if (!nuevoProducto.title || !nuevoProducto.price) {
        return res.status(400).send("Faltan campos requeridos");
    }

    try {
        await manager.addProduct(nuevoProducto); 
        res.status(201).send("Producto agregado con éxito");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del sistema: " + error.message); 
    }
});

// Actualizar producto
router.put("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const productoActualizado = req.body;

    try {
        const productoExistente = await manager.getProductById(id);

        if (!productoExistente) {
            return res.status(404).send("Producto no encontrado en el sistema");
        } else {
            await manager.updateProduct(id, productoActualizado);
            res.status(200).send("Producto actualizado con éxito en el sistema");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del sistema: " + error.message);
    }
});

// Eliminar producto
router.delete("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid); 

    try {
        await manager.deleteProduct(id); 
        res.send("Producto eliminado del sistema");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servicio: " + error.message); 
    }
});

export default router; 
