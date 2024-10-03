import express from "express"; 
const router = express.Router();
import CartManager from "../managers/cart-manager.js";
const manager = new CartManager("./src/data/carts.json");

router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await manager.crearCarrito(); 
        res.json(nuevoCarrito);
    } catch (error) {
        res.status(500).send("Error del sistema al crear carrito");
    }
});


router.get('/:cid', async (req, res) => {
    let cartId = req.params.cid;
    
    try {
        const carrito = await manager.getById(parseInt(cartId)); 
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        res.json(carrito.products);  
    } catch (error) {
        res.status(500).send("Error del sistema al obtener productos del carrito");
    }
});


router.post("/:cid/product/:pid", async (req, res) => {
    let cartId = req.params.cid;
    let productId = req.params.pid;
    let quantity = req.body.quantity || 1;  

    try {
        const carritoActualizado = await manager.agregarProductoAlCarrito(parseInt(cartId), parseInt(productId), quantity);
        res.json(carritoActualizado.products);  
    } catch (error) {
        res.status(500).send("Error del sistema al agregar productos al carrito");
    }
});



export default router;