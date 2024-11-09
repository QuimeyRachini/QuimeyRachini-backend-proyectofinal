import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";  // Importamos el plugin para la paginación

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  
  },
  description: {
    type: String,
    required: true,  
  },
  price: {
    type: Number,
    required: true,  
  },
  img: {
    type: String,  // URL de la imagen del producto (opcional)
  },
  code: {
    type: String,
    required: true,
    unique: true,  
  },
  stock: {
    type: Number,
    required: true,  
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,  
  },
  thumbnails: {
    type: [String],
  },
  availability: {
    type: Boolean,
    required: true, 
  }
});

// Habilitamos el plugin de paginación
productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;