require('dotenv').config()

const connectDB = require('./db/connect')
const Product = require('./models/product')

const jsonProducts = require('./products.json')

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)

    // remove any product that may already be there
    await Product.deleteMany()
    // create new DB using the jsonProducts array
    await Product.create(jsonProducts)
    // run node populate.js in terminal to connectr and create DB

    console.log('success')
    process.exit(0) // exiting the process
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

start()
