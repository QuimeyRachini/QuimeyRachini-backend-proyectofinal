import express from "express";
import productRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.router.js";
const app = express();

app.use(express.json());
// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Escuchar en el puerto 8080
const PUERTO = 8080;
app.listen(PUERTO, () => {
  console.log(`Escuchando en el http://localhost:${PUERTO}`);
});