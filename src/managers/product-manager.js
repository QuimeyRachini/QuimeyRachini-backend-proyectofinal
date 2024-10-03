import fs from "fs"; 



class ProductManager {
    static ultId = 0;

    constructor(path) {
        this.products = [];
        this.path = path;

        this.cargarArray(); 
    }

    async cargarArray() {
        try {
            this.products = await this.leerArchivo();
        } catch (error) {
            console.log("Error del sistema al inicializar ProductManager");
        }
    }

    async addProduct({ title, description, price, img, code, stock }) {

        if (!title || !description || !price || !img || !code || !stock) {
            console.log("Es necesario completar todos los campos");
            return;
        }


        if (this.products.some(item => item.code === code)) {
            console.log("El codigo debe ser unico");
            return;
        }

        const lastProductId = this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
        const nuevoProducto = {
            id: lastProductId + 1,
            title,
            description,
            price,
            img,
            code,
            stock
        };
 
        this.products.push(nuevoProducto);

        await this.guardarArchivo(this.products);
    }

    async getProducts() {
        try {
            const arrayProductos = await this.leerArchivo(); 
            return arrayProductos;
        } catch (error) {
            console.log("Error al leer el archivo", error); 
        }

    }

    async getProductById(id) {
        try {
            const arrayProductos = await this.leerArchivo();
            const buscado = arrayProductos.find(item => item.id === id); 

            if (!buscado) {
                console.log("Producto no encontrado en el sistema"); 
                return null; 
            } else {
                console.log("Producto encontrado en el sistema"); 
                return buscado; 
            }
        } catch (error) {
            console.log("Error al buscar por id", error); 
        }
    }
 
    async leerArchivo() {
        try {
            const respuesta = await fs.promises.readFile(this.path, "utf-8");
            return JSON.parse(respuesta);
        } catch (error) {
            console.log("Error al leer el archivo", error);
        return arrayProductos;
    }
  }
    async guardarArchivo(arrayProductos) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
        } catch (error) {
            console.log("Error al guardar el archivo", error);
        }
    }


    async updateProduct(id, productoActualizado) {
        try {
            const arrayProductos = await this.leerArchivo(); 

            const index = arrayProductos.findIndex( item => item.id === id); 

            if(index !== -1) {
                arrayProductos[index] = {...arrayProductos[index], ...productoActualizado} ; 
                await this.guardarArchivo(arrayProductos); 
                console.log("Producto actualizado en el sistema"); 
            } else {
                console.log("Producto no encontrado en el sistema"); 
            }
        } catch (error) {
            console.log("Error al actualizar el producto en el sistema"); 
        }
    }

    async deleteProduct(id) {
        try {
            const arrayProductos = await this.leerArchivo(); 

            const index = arrayProductos.findIndex( item => item.id === id); 

            if(index !== -1) {
                arrayProductos.splice(index, 1); 
                await this.guardarArchivo(arrayProductos); 
                console.log("Producto eliminado del sistema"); 
            } else {
                console.log("No se encuentra el producto en el sistema"); 
            }
        } catch (error) {
            console.log("Error al actualizar el producto en el sistema"); 
        }
    }

}

export default ProductManager; 