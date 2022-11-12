const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  },
  Mutation: {
    //USERS
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
        token: createToken(existeUser, process.env.SECRETWORD, '24h'),
      };
    },

    //PRODUCTS
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

    //CLIENTS
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
  },
};

module.exports = resolvers;
