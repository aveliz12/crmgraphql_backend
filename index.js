const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB=require("./config/db")

//Conectar a la BDD
connectDB();

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const myContext = "Hola";

    return {
      myContext,
    };
  },
});

//arrancar servidor
server.listen().then(({ url }) => {
  console.log(`Server running in the URL ${url}`);
});
