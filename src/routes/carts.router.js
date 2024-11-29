import express from "express";
import CartManager from "../managers/cart-manager.js";
const router = express.Router();
const manager = new CartManager();

// Crear un nuevo carrito
router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await manager.crearCarrito();
        res.json(nuevoCarrito);
    } catch (error) {
        res.status(500).send("Error del sistema al crear carrito");
    }
});

// Obtener los productos de un carrito
router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    
    try {
        const carrito = await manager.getCarritoById(cartId);
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        res.json(carrito);
    } catch (error) {
        res.status(500).send("Error del sistema al obtener productos del carrito");
    }
});

// Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const quantity = req.body.quantity || 1;

    try {
        const carritoActualizado = await manager.agregarProductoAlCarrito(cartId, productId, quantity);
        res.json(carritoActualizado);  // Retorna el carrito actualizado con los productos completos
    } catch (error) {
        res.status(500).send("Error del sistema al agregar productos al carrito");
    }
});

// Eliminar un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    try {
        const carritoActualizado = await manager.eliminarProductoDelCarrito(cartId, productId);
        res.json({ message: 'Producto eliminado correctamente del carrito' });
    } catch (error) {
        res.status(500).send("Error del sistema al eliminar producto del carrito");
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/product/:pid", async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const quantity = req.body.quantity;

    if (quantity <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    try {
        const carritoActualizado = await manager.actualizarCantidadProducto(cartId, productId, quantity);
        res.json({ message: 'Cantidad actualizada correctamente', carrito: carritoActualizado });
    } catch (error) {
        res.status(500).send("Error del sistema al actualizar cantidad del producto");
    }
});

// Eliminar todos los productos de un carrito
router.delete("/:cid", async (req, res) => {
    const cartId = parseInt(req.params.cid);

    try {
        const carritoVacio = await manager.eliminarTodosLosProductos(cartId);
        res.json({ message: 'Todos los productos fueron eliminados del carrito', carrito: carritoVacio });
    } catch (error) {
        res.status(500).send("Error del sistema al eliminar todos los productos del carrito");
    }
});

export default router;

