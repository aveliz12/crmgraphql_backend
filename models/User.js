const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, //Si se llena el formulario y hay espacios, los elimina
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(), //agregar la fecha de ese momento
  },
});

module.exports = mongoose.model("User", UserSchema);
