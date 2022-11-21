const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
require("dotenv").config({ path: "../variables.env" });

const createToken = (user, wordSecret, expiresIn) => {
  console.log(user);
  const { id, email, name, lastName } = user;
  return jwt.sign({ id, email, name, lastName }, wordSecret, { expiresIn }); //para relizar un nuevo jwt
};

//Resolvers
const resolvers = {
  Query: {
    //USERS
    getUser: async (_, { token }) => {
      const userId = await jwt.verify(token, process.env.SECRETWORD); //toma el token y verifica

      return userId;
    },

    //PRODUCTS
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProductsById: async (_, { id }) => {
      //Revisar si el producto existe
      const product = await Product.findById(id);

      if (!product) {
        console.log("Prodcuto no encontrado!!");
      }

      return product;
    },

    //CLIENTS
    getAllClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsSeller: async (_, {}, ctx) => {
      try {
        const client = await Client.find({ seller: ctx.user.id.toString() });
        return client;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsById: async (_, { id }, ctx) => {
      //Revisar si el cliente existe
      const client = await Client.findById(id);
      if (!client) {
        throw new Error("Cliente no encontrado");
      }

      //Puede verlo quien lo creo
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales para cer este cliente");
      }

      return client;
    },

    //ORDERS
    getOrder: async () => {
      try {
        const order = await Order.find();
        return order;
      } catch (error) {
        console.log(error);
      }
    },
    getOrderBySeller: async (_, {}, ctx) => {
      try {
        const order = await Order.find({ seller: ctx.user.id });
        return order;
      } catch (error) {
        console.log(error);
      }
    },
    getOrderById: async (_, { id }, ctx) => {
      //Verificar si existe el pedido
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("Pedido no encontrado");
      }

      //Solo quien lo creó
      if (order.seller.toString() !== ctx.user.id) {
        throw new Error("No tiene permisos para obtener este vendedor");
      }
      //Retornar resultado
      return order;
    },
    getOrderByStatus: async (_, { status }, ctx) => {
      const order = await Order.find({ seller: ctx.user.id, status });

      return order;
    },

    //BESTCLIENTS
    bestClients: async () => {
      const clients = await Order.aggregate([
        {
          $match: { status: "COMPLETADO" }, //operador que fiiltra
        },
        {
          $group: { _id: "$client", total: { $sum: "$total" } },
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $sort: { total: -1 },
        },
      ]); //aggregate: toman diferentes valores y agrupar en cliente, suma, etc
      return clients;
    },

    //BEST SELLERSS
    bestSellers: async () => {
      const sellers = await Order.aggregate([
        { $match: { status: "COMPLETADO" } },
        {
          $group: {
            _id: "$seller",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ]);

      return sellers;
    },

    //SEARCH PRODUCT
    searchProduct: async (_, { text }) => {
      const products = await Product.find({ $text: { $search: text } }).limit(10);
      return products;
    },
  },
  Mutation: {
    ///USERS///
    newUser: async (_, { input }) => {
      const { email, password } = input;

      //Revisar si el usuario ya está registrado
      const existUser = await User.findOne({ email });
      if (existUser) {
        throw new Error("El usuario y está registrado");
      }

      //Hashear el password
      const salt = await bcryptjs.genSaltSync(10); //si se le pone 12 hace el hash un poco mas tardado de decifrar y consume mas recursos del servidor
      input.password = await bcryptjs.hash(password, salt);

      //Guardar en la bdd
      try {
        const user = new User(input);
        user.save();
        return user; //Se retorna el usuario creado de la bdd con la forma del Schema
      } catch (error) {
        console.log(error);
      }
    },
    authenticateUser: async (_, { input }) => {
      const { email, password } = input;

      //Si el usuario existe
      const existeUser = await User.findOne({ email });
      if (!existeUser) {
        throw new Error("El usuario no existe");
      }

      //Revisar si la  contraseña es correcta
      const passwordSuccess = await bcryptjs.compare(
        password,
        existeUser.password
      ); //Comparar una contra con la de la bdd con bcrypt

      if (!passwordSuccess) {
        throw new Error("Contraseña incorrecta");
      }

      //Crear el token
      return {
        token: createToken(existeUser, process.env.SECRETWORD, "24h"),
      };
    },

    ///PRODUCTS///
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);

        //Almacenar en la bdd
        const resp = await product.save();
        return resp;
      } catch (error) {
        console.log(error);
      }
    },
    updateProducts: async (_, { id, input }) => {
      //Revisar si el producto existe
      let product = await Product.findById(id);

      if (!product) {
        throw new Error("El proucto no existe");
      }

      //si existe guardar en la bdd
      product = await Product.findOneAndUpdate({ _id: id }, input, {
        new: true,
      }); //el findOneAndpdate encuentra el objeto y lo actualiza en ese momento
      //new:true es para que se actualice y retorne el nuevo objeto

      return product;
    },
    deleteProduct: async (_, { id }) => {
      //comprobar si existe
      const product = await Product.findById(id);

      if (!product) {
        throw new Error("El producto no existe");
      }

      //Eliminar producto en caso de que si exista
      await Product.findByIdAndRemove({ _id: id });
      return "Producto eliminado";
    },

    ///CLIENTS///
    newClient: async (_, { input }, ctx) => {
      console.log(ctx);

      const { email } = input;

      //Verificar si el cliente ya está reggistrado
      const client = await Client.findOne({ email });
      if (client) {
        throw new Error("Cliente registrado");
      }

      const newC = new Client(input);
      //Asignar vendedor
      newC.seller = ctx.user.id;

      //GUardar en la BDD
      try {
        const resul = await newC.save();
        return resul;
      } catch (error) {
        console.log(error);
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      //Verificar si existe el client o no
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("El cliente no existe");
      }
      //Verificar si el vendedor es el que edita
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tiene permiso para editar este cliente");
      }

      //Guardar el cliente
      client = await Client.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return client;
    },
    deleteClient: async (_, { id }, ctx) => {
      //Verificar si existe el client o no
      let client = await Client.findById(id);
      if (!client) {
        throw new Error("El cliente no existe");
      }
      //Verificar si el vendedor es el que edita
      if (client.seller.toString() !== ctx.user.id) {
        throw new Error("No tiene permiso para eliminar este cliente");
      }

      //Eliminar
      await Client.findOneAndDelete({ _id: id });
      return "Cliente Eliminado";
    },

    ///ORDERS///
    newOrder: async (_, { input }, ctx) => {
      const { client } = input;

      //verificiar si el cliente existe o no
      let clientExist = await Client.findById(client);

      if (!clientExist) {
        throw new Error("El cliente no existe.");
      }

      //Verificar si el cliente es el vendedor
      if (clientExist.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales.");
      }

      //Revisar si el stock esta disponible
      //Operador asincrono nuevo de node
      for await (const article of input.order) {
        const { id } = article;
        const product = await Product.findById(id);

        if (article.stock > product.stock) {
          throw new Error(
            `El artículo: ${product.name} excede a cantidad disponible.`
          );
        } else {
          //restar cantidad de stock disponible en productos
          product.stock = product.stock - article.stock;

          await product.save();
        }
      }
      //Crer un nuevo pedido
      const newOrder = new Order(input);

      //Asignar un vendedor
      newOrder.seller = ctx.user.id;

      //Guardar en la BDD
      const result = await newOrder.save();
      return result;
    },
    updateOrder: async (_, { id, input }, ctx) => {
      const { client } = input;

      //Verificar si el pedido existe
      const existOrder = await Order.findById(id);
      if (!existOrder) {
        throw new Error("El pedido no existe");
      }

      //Verificar si el cliente existe
      const existClient = await Client.findById(client);
      if (!existClient) {
        throw new Error("El cliente no existe");
      }

      //Verificar si el cliente y pedido pertenece al vendedor
      if (existClient.seller.toString() !== ctx.user.id) {
        throw new Error("No tienes las credenciales para realizar la acción");
      }

      //revisar el stock
      if (input.order) {
        //Operador asincrono nuevo de node
        for await (const article of input.order) {
          const { id } = article;
          const product = await Product.findById(id);

          if (article.stock > product.stock) {
            throw new Error(
              `El artículo: ${product.name} excede a cantidad disponible.`
            );
          } else {
            //restar cantidad de stock disponible en productos
            product.stock = product.stock - article.stock;

            await product.save();
          }
        }
      }

      //Guardar pedido
      const resp = await Order.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return resp;
    },
    deleteOrder: async (_, { id }, ctx) => {
      //Verificar si el pedido existe
      const order = await Order.findById(id);

      if (!order) {
        throw new Error("El pedido no existe");
      }

      //verificar si el vendedor es quien intenta elminar
      if (order.seller.toString() !== ctx.user.id) {
        throw new Error("No tiene permisos para elminar el pedido");
      }

      //Eliminar de la bdd
      await Order.findOneAndDelete({ _id: id });
      return "Pedido Eliminado";
    },
  },
};

module.exports = resolvers;
