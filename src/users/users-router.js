const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const path = require('path')
const UsersService = require('./users-service')

const userRouter = express.Router()
const jsonParser = express.json();

const sanitizeUser = user => ({
    id: user.id,
    username: xss(user.username),
    date_created: user.date_created,
})

userRouter
.route('/')
.get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
        .then(users => {
        res.json(users.map(sanitizeUser))
        })
        .catch(next)
})
.post(jsonParser, (req, res, next) => {
    const { username, password } = req.body
    const newUser = { username }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }
    const passwordError = UsersService.validatePassword(password)
    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithUserName(
        req.app.get('db'),
        username
    )
    .then(hasUserWithUserName => {
        if (hasUserWithUserName)
            return res.status(400).json({ error: `Username already taken` })
        
        newUser.username = username;
        newUser.password = password;

        UsersService.insertUser(
          req.app.get('db'),
          newUser
        )
          .then(user => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(sanitizeUser(user))
          })
    })
      .catch(next)
  })


userRouter
.route('/:user_id')
.all((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
})
.get((req, res, next) => {
    res.json(sanitizeUser(res.user))
})
.delete((req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})
.patch(jsonParser, (req, res, next) => {
    const { username, password } = req.body
    const userToUpdate = { username, password }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'username' or 'password'`
        }
      })

    UsersService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
})


module.exports = userRouter