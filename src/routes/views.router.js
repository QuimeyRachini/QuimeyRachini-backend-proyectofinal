import { Router } from "express";
import ProductManager from "../managers/product-manager.js";

const router = Router();
const manager = new ProductManager("./src/data/productos.json");

// Ruta para la vista "home" que contiene la lista de productos
router.get("/products", async (req, res) => {
    try {
        const productos = await manager.getProducts(); 
        res.render("home", { productos }); 
    } catch (error) {
        res.status(500).send("Error al recuperar los productos");
    }
});

// Ruta para la vista "realTimeProducts" que trabajará con WebSockets
router.get("/realtimeproducts", async (req, res) => {
    try {
        const productos = await manager.getProducts(); 
        res.render("realtimeproducts", { productos }); // Enviamos los productos iniciales a la vista
    } catch (error) {
        res.status(500).send("Error al recuperar los productos");
    }
});

export default router;
