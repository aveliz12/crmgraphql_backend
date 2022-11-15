const moongose = require("mongoose");

const OrderSchema = moongose.Schema({
  order: {
    type: Array,
    require: true,
  },
  total: {
    type: Number,
    require: true,
  },
  client: {
    type: moongose.Schema.Types.ObjectId,
    require: true,
    ref: "Client",
  },
  seller: {
    type: moongose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  status:{//si es pedido nuevo, si ya se completo
    type: String,
    default: "PENDIENTE"
  },
  created:{
    type:Date,
    default: Date.now()
  }
});

module.exports = moongose.model("Order", OrderSchema);
