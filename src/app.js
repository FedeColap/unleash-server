require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const noteRouter = require('./notes/notes-router')
const userRouter = require('./users/users-router')
const authRouter = require('./users/aut-router')

const logger = require('./logger')


const app = express()

const morganOption = (NODE_ENV === 'production')? 'tiny': 'common';

app.use(morgan(morganOption))
app.use(express.json());
app.use(helmet())
app.use(cors())

// console.log(process.env.API_TOKEN)


// COMMENTING OUT FOR TESTING- the validation is made in the notesrouter-------------------------------------------
// app.use(function validateBearerToken(req, res, next) {

//      const apiToken = process.env.API_TOKEN
//      const authToken = req.get('Authorization')
//      if (!authToken || authToken.split(' ')[1] !== apiToken) {
//          logger.error(`Unauthorized request to path: ${req.path}`);
//          return res.status(401).json({ error: 'Unauthorized request' })
//      }
//      next()
// })


app.use(function errorHandler(error, req, res, next) {
     let response
     if (NODE_ENV === 'production') {
          response = { error: { message: 'server error' } }
     } else {
          console.error(error)
          response = { message: error.message, error }
     }
     res.status(500).json(response)
})

app.use('/api/notes', noteRouter)
app.use('/api/users', userRouter)
app.use('/api/login', authRouter)




app.get('/', (req, res) => {
       res.send('Fede, Speranza e Carita')
})

module.exports = app;
