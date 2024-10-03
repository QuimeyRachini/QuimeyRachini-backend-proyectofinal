import express from "express"; 
import ProductManager from "../managers/product-manager.js";
const manager = new ProductManager("./src/data/productos.json");
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit; 
        const productos = await manager.getProducts(); 

        if(limit) {
            res.json(productos.slice(0, limit)); 
        } else {
            res.json(productos); 
        }
    } catch (error) {
        res.status(500).send("Error interno del sistema");
    }
})

/
router.get("/:pid", async (req, res) => {
    let id = req.params.pid; 

    try {
        const productoBuscado = await manager.getProductById(parseInt(id));

        if(!productoBuscado) {
            res.status(404).json({ message: "Producto no se encuentra en el sistema"});
        } else {
            res.json(productoBuscado); 
        }
    } catch (error) {
        res.status(500).send("Error interno del sistema"); 
    }
})


router.post("/", async (req, res) => {
    const nuevoProducto = req.body; 

    try {
        await manager.addProduct(nuevoProducto); 
        res.status(201).send("Producto agregado con exito");
    } catch (error) {
        res.status(500).send("Error interno del sistema"); 
    }

})
router.put("/:pid", async (req, res) => {
    let id = req.params.pid;
    const productoActualizado = req.body;

    try {
        const productoExistente = await manager.getProductById(parseInt(id));

        if (!productoExistente) {
            res.status(404).send("Producto no encontrado en el sistema");
        } else {
            await manager.updateProduct(parseInt(id), productoActualizado);
            res.status(200).send("Producto actualizado con éxito en el sistema");
        }
    } catch (error) {
        res.status(500).send("Error interno del sistema");
    }
});
router.delete("/:pid", async (req, res) => {
    let id = req.params.pid; 

    try {
        await manager.deleteProduct(parseInt(id)); 
        res.send("Producto eliminado del sistema")
    } catch (error) {
        res.status(500).send("Error interno del servicio"); 
    }
})


export default router; 