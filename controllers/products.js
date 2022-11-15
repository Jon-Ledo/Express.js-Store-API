const { query } = require('express')
const Product = require('../models/product')

// for testing
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({
    featured: true,
  }) // find func from mongoose docs
  res.status(200).json({ products, nbHits: products.length })
}

// real
const getAllProducts = async (req, res) => {
  // destructure only the queries our DB cares about
  // removes errors if unknown keys are searched for
  const { featured } = req.query
  // create a new query Object to pass to the find
  const queryObject = {}
  if (featured) {
    queryObject.featured = featured === 'true' ? true : false
  }

  // If user searches for param that doesnt exist, then the query Object is empty.
  // When mongoose searches using an empty object, it still returns ALL items
  const products = await Product.find(queryObject)
  res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
  getAllProductsStatic,
  getAllProducts,
}
