const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
  },
  lastName: {
    type: String,
    require: true,
    trim: true,
  },
  business: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  //Clientes que dio de alta un vendedor en específico
  seller: {
    type: mongoose.Schema.Types.ObjectId, //Guarda el tipo de dato como objeto
    require: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Client", ClientSchema);
