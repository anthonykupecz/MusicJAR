const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/User')


userRouter.get('/', async (req, res, next) => {
  try {
    const users = await User.find({})
      .populate('songs', { title : 1, hyperlink : 1, rating : 1, artist : 1, genre: 1 })
    res.json(users)
  } catch(err) {
    next(err)
  }
})

userRouter.get('/:id', async (req, res, next) => {
    try {
      const id = req.params.id
      const users = await User.findById({id})
        .populate('songs', { title : 1, hyperlink : 1, rating : 1, artist : 1, genre: 1 })
      res.json(users)
    } catch(err) {
      next(err)
    }
  })


userRouter.post('/', async (req, res, next) => {
  const body = req.body
  const rounds = 10
  try {
    if (body.password.length < 3) {
      res.status(500)
        .json(
          { error : 'Password length must be creater than 3!' }
        )
    }

    const hash = await bcrypt.hash(body.password, rounds)
    const user = {
      email : body.email,
      username : body.username,
      passwordHash : hash,
    }
    const newUser = new User(user)
    const userAsJson = await newUser.save()
    res.json(userAsJson)
  } catch(error) {
    if (error.name === 'ValidationError') {
      res.status(500)
        .json(
          { error : 'ValidationError' }
        )
    }    next(error)
  }
})


userRouter.put('/:id', async(req, res, next) => {
  try {
    console.log("here we are")
    console.log("params", req.params)
    const id = req.params.id
    const user = await User.findById(id)
    if (!req.body.artistName) {
      res.status(500).json(
        {error : "Missing artistname"}
      )
    } 
    let newOptions = req.body.add ? 
    {
      artists : user.artists.concat(req.body.artistName)
    } :
    {
      artists : user.artists.filter(a => a !== req.body.artistName)
    }
    const newUser = await User.findByIdAndUpdate(id, newOptions)
    console.log("saved user stuff")
    res.json(newUser)
  }
  catch (error) {
    console.log("The error is...", error)
  }
})

module.exports = userRouter