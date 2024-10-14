const socket = io();

// Función para renderizar los productos en el DOM
function renderProducts(productos) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Limpiar la lista actual

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card'; // Asignar clase para estilos
        card.innerHTML = `
            <strong>${producto.title}</strong>
            <p>Precio: ${parseFloat(producto.price).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p> <!-- Formatear precio aquí -->
            <p>Stock: ${producto.stock}</p>
             <p>Descripción: ${producto.description}</p> <!-- Agregar descripción -->
            <p>Código: ${producto.code}</p> <!-- Agregar código -->
            <button onclick="deleteProduct('${producto.id}')">Eliminar</button>
            <button onclick="editProduct('${producto.id}')">Editar</button>
        `;
        productList.appendChild(card);
    });
}

// Función para eliminar productos
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Producto eliminado:', data);
            // La actualización en tiempo real es manejada por WebSockets
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
            alert('No se pudo eliminar el producto. Intenta nuevamente.');
        });
    }
}

// Función para manejar el envío del formulario y crear un nuevo producto
const form = document.getElementById('product-form');
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    const newProduct = { title: name, price: parseFloat(price), stock: parseInt(stock) };

    // Enviar el nuevo producto al servidor mediante POST
    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Producto creado:', data);
        form.reset(); // Limpiar el formulario
        // La actualización en tiempo real es manejada por WebSockets
    })
    .catch(error => {
        console.error('Error al crear el producto:', error);
        alert('No se pudo crear el producto. Intenta nuevamente.');
    });
});

// Función para mostrar el formulario de edición
function editProduct(productId) {
    // Obtener los detalles del producto por su ID
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            // Mostrar los valores actuales del producto en el formulario de edición
            document.getElementById('edit-title').value = product.title;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-stock').value = product.stock;

            document.getElementById('product-id').value = productId; // Guardar el ID del producto que se está editando
            document.getElementById('edit-form').style.display = 'block'; // Mostrar el formulario de edición
        })
        .catch(error => {
            console.error('Error al obtener el producto:', error);
            alert('No se pudo cargar el producto para editar. Intenta nuevamente.');
        });
}

// Función para manejar la edición del producto
document.getElementById('save-button').addEventListener('click', async () => {
    const productId = document.getElementById('product-id').value;
    const updatedProduct = {
        title: document.getElementById('edit-title').value,
        price: parseFloat(document.getElementById('edit-price').value),
        stock: parseInt(document.getElementById('edit-stock').value)
    };

    try {
        // Enviar la solicitud PUT para actualizar el producto
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            alert('Producto actualizado exitosamente');
            document.getElementById('edit-form').style.display = 'none'; // Ocultar el formulario de edición
        } else {
            alert('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        alert('No se pudo actualizar el producto. Intenta nuevamente.');
    }
});

// Escuchar eventos de productos desde el servidor (actualización en tiempo real)
socket.on('productos', (productos) => {
    renderProducts(productos); // Renderizar productos en el DOM
});

