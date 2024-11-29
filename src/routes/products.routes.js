import express from "express";
import ProductManager from "../managers/ProductManager.js";

const manager = new ProductManager("./src/data/productos.json");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; 
        const page = parseInt(req.query.page) || 1;     // Página actual
        const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'desc' ? -1 : null;  // Orden por precio
        const query = req.query.query; 

        // Obtener todos los productos
        const productos = await manager.getProducts();

        // Filtrar por categoría o disponibilidad
        let filteredProducts = productos;
        if (query) {
            filteredProducts = productos.filter(product => 
                product.category === query || 
                (query === 'disponible' && product.stock > 0)
            );
        }

        // Ordenar productos
        if (sort) {
            filteredProducts.sort((a, b) => (a.price - b.price) * sort);
        }

        // Paginación
        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

        // Respuesta con datos estructurados
        res.json({
            status: "success",
            payload: paginatedProducts,
            totalPages: totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page: page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${req.query.sort}&query=${query}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${req.query.sort}&query=${query}` : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error interno del sistema" });
    }
});

// GET: Obtener producto por ID
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
        res.status(500).json({ message: "Error interno del sistema", error: error.message });
    }
});

// POST: Agregar un nuevo producto
router.post("/", async (req, res) => {
    const nuevoProducto = req.body;

    if (!nuevoProducto.title || !nuevoProducto.price) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    try {
        await manager.addProduct(nuevoProducto);
        res.status(201).json({ message: "Producto agregado con éxito", product: nuevoProducto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del sistema", error: error.message });
    }
});

// PUT: Actualizar un producto
router.put("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const productoActualizado = req.body;

    try {
        const productoExistente = await manager.getProductById(id);

        if (!productoExistente) {
            return res.status(404).json({ message: "Producto no encontrado en el sistema" });
        }
        
        await manager.updateProduct(id, productoActualizado);
        res.json({ message: "Producto actualizado con éxito", product: productoActualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del sistema", error: error.message });
    }
});

// DELETE: Eliminar un producto
router.delete("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);

    try {
        const productoEliminado = await manager.getProductById(id);
        
        if (!productoEliminado) {
            return res.status(404).json({ message: "Producto no encontrado en el sistema" });
        }
        
        await manager.deleteProduct(id);
        res.json({ message: "Producto eliminado del sistema" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del sistema", error: error.message });
    }
});

export default router;


