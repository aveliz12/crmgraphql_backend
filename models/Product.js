const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
  },
  stock: {
    type: Number,
    require: true,
  },
  cost: {
    type: Number,
    require: true,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", ProductSchema);
