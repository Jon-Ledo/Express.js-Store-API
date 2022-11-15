const Product = require('../models/product')

// for testing
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } }) // find func from mongoose docs
    .sort('price') // sort alphabetically
    .select('name price') // only shows these values
    .limit(10) // limit hits per page
  res.status(200).json({ products, nbHits: products.length })
}

// real
const getAllProducts = async (req, res) => {
  // destructure only the queries our DB cares about
  // removes errors if unknown keys are searched for
  const { featured, company, name, sort, fields, numericFilters } = req.query

  // create a new query Object to pass to the find
  const queryObject = {}

  if (featured) {
    queryObject.featured = featured === 'true' ? true : false
  }
  if (company) {
    queryObject.company = company
  }
  if (name) {
    // regex func found from mongoDB query operators
    queryObject.name = { $regex: name, $options: 'i' }
  }

  if (numericFilters) {
    //operator map
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    }

    const regEx = /\b(>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(regEx, (match) => {
      return `-${operatorMap[match]}-`
    })
    const options = ['price', 'rating']
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-')
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) }
      }
    })
  }

  // If user searches for param that doesnt exist, then the query Object is empty.
  // When mongoose searches using an empty object, it still returns ALL items
  console.log(queryObject)
  let result = Product.find(queryObject)

  // sorting
  if (sort) {
    const sortList = sort.split(',').join(' ')
    result = result.sort(sortList)
  } else {
    // hard code property
    result = result.sort('createdAt')
  }

  if (fields) {
    const fieldsList = fields.split(',').join(' ')
    result = result.select(fieldsList)
  }

  // pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  result = result.skip(skip).limit(limit)

  const products = await result
  res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
  getAllProductsStatic,
  getAllProducts,
}
