import mongoose from "mongoose";

mongoose.connect("mongodb+srv://quimey:morena2003@cluster0.tyiw6.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conectados a la BD"))
    .catch( (error) => console.log("Tenemos un error ", error ))