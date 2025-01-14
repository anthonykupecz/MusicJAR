const mongoose = require('mongoose')
const uv = require('mongoose-unique-validator')


const userSchema = mongoose.Schema({
  username : {
    type : String,
    unique : true,
    required : true,
    minlength : 3
  },
  email : {
    type : String,
    required : true,
    minlength : 3
  },
  passwordHash : String,
  artists : [ 
  {
    type: String
  }
]
})

userSchema.set('toJSON', {
  transform : (doc, user) => {
    user.id = user._id.toString()
    delete user._id
    delete user.__v
    delete user.passwordHash
  }
})

userSchema.plugin(uv)

module.exports = mongoose.model('User', userSchema)