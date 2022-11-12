const { gql } = require("apollo-server");

//Schema
const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
  }

  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    stock: Int
    cost: Float
    created: String
  }

  type Client {
    id: ID
    name: String
    lastName: String
    business: String
    email: String
    phone: String
    created: String
    seller: ID
  }

  #USER

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  #PRODUCT

  input ProductInput {
    name: String!
    stock: Int!
    cost: Float!
  }

  #CLIENTS
  input ClientInput {
    name: String!
    lastName: String!
    business: String!
    email: String!
    phone: String
  }

  #CONSULTAS
  type Query {
    #Users
    getUser(token: String!): User

    #Products
    getProducts: [Product]
    getProductsById(id: ID!): Product

    #Clients
    getAllClients: [Client]
    getClientsSeller: [Client]
    getClientsById(id: ID!): Client
  }

  type Mutation {
    #Users
    newUser(input: UserInput): User
    authenticateUser(input: AuthenticateInput): Token

    #Products
    newProduct(input: ProductInput): Product
    updateProducts(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    #Clients
    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id: ID!): String
  }
`;

module.exports = typeDefs;
