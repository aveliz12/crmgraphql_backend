const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      //Evitar advertenciasno necesarias
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    });
    console.log("Connect Success");
  } catch (error) {
    console.log("Hubo un error");
    console.log(error);
    process.exit(1); //detener la app
  }
};

module.exports = connectDB;
