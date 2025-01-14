require('dotenv').config()

let MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT

module.exports = {
    MONGODB_URI,
    PORT,
    AWS_CONFIG: {
      host: process.env.AWS_HOST,
      port: process.env.AWS_PORT,
      user: process.env.AWS_USER,
      password: process.env.AWS_PASSWORD,
      database: process.env.AWS_DATABASE
    }
}
