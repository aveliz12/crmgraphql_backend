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

  type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: ID
    seller: ID
    date: String
    status: StatusOrder
  }

  type OrderGroup {
    id: ID
    stock: Int
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

  #ORDER

  input OrderProductInput {
    id: ID
    stock: Int
  }

  input OrderInput {
    order: [OrderProductInput]
    total: Float
    client: ID
    status: StatusOrder
  }

  enum StatusOrder {
    PENDIENTE
    COMPLETADO
    CANCELADO
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

    #Orders
    getOrder: [Order]
    getOrderBySeller: [Order]
    getOrderById(id: ID!): Order
    getOrderByStatus(status: String!): [Order]
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

    #Orders
    newOrder(input: OrderInput): Order
    updateOrder(id: ID!, input: OrderInput): Order
    deleteOrder(id: ID!): String
  }
`;

module.exports = typeDefs;
