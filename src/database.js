import mongoose from "mongoose";

const uri = 'mongodb+srv://quimey:quimey@cluster0.tyiw6.mongodb.net/E-commerce?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error.message));


