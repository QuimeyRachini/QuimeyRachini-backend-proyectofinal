import { Router } from "express";
import ProductModel from "../models/product.model.js";
import CartManager from "../managers/cart-manager.js"; 

const router = Router();
const manager = new CartManager(); 

// Ruta para la vista de todos los productos con paginación
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 10, query = "" } = req.query; 
        const productos = await ProductModel.paginate(
            {
                title: { $regex: query, $options: "i" }, // Filtrado por nombre del producto
            },
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { price: 1 }, // Ordenar por precio de forma ascendente
            }
        );

        res.render("home", {
            productos: productos.docs,
            currentPage: productos.page,
            totalPages: productos.totalPages,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            limit: productos.limit,
            query,
        });
    } catch (error) {
        res.status(500).send("Error al recuperar los productos");
    }
});

// Ruta para la vista "realtimeproducts" que trabaja con WebSockets
router.get("/realtimeproducts", async (req, res) => {
    try {
        const productos = await ProductModel.find().lean(); // Traemos todos los productos
        res.render("realtimeproducts", { productos }); // Enviamos los productos a la vista
    } catch (error) {
        res.status(500).send("Error al recuperar los productos");
    }
});

// Ruta para ver un producto específico
router.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    try {
        const producto = await ProductModel.findById(pid).lean();
        if (!producto) {
            return res.status(404).send("Producto no encontrado");
        }
        res.render("productDetail", { producto });
    } catch (error) {
        res.status(500).send("Error al obtener el producto");
    }
});

// Ruta para ver los productos de un carrito específico
router.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const carrito = await manager.getCarritoById(parseInt(cid));
        if (!carrito) {
            return res.status(404).send("Carrito no encontrado");
        }
        res.render("cartDetail", { carrito });
    } catch (error) {
        res.status(500).send("Error al obtener el carrito");
    }
});

export default router;
