const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const path = require('path')
// const uuid = require('uuid/v4');
// const { users } = require('../data-store')
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
      .catch(next)
  })
//   .post(bodyParser, (req, res) => {
//         // get the data
//         const { username, password } = req.body;
//         // validation code here
//         if (!username) {
//             return res
//                 .status(400)
//                 .send('Name required');
//         }
//         if (!password) {
//             return res
//                 .status(400)
//                 .send('Password required');
//         }
//         if (username.length < 3 || username.length > 20) {
//             return res
//                 .status(400)
//                 .send('Username must be between 3 and 20 characters');
//         }
//         // password length
//         if (password.length < 6 || password.length > 72) {
//             return res
//             .status(400)
//             .send('Password must be between 6 and 72 characters');
//         }
        
//         // password contains digit, using a regex here
//         if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
//             return res
//                 .status(400)
//                 .send('Password must be contain at least one digit');
//         }
//         // at this point all validation passed
//         const id = uuid();
//         const newUser = {
//             id,
//             username,
//             password
//         };

//     users.push(newUser);

//     res
//         .status(201)
//         .location(`http://localhost:8000/users/${id}`)
//         .json(newUser);
//   })

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
//   .route('/users/:id')
//   .get((req, res) => {
//         const { id } = req.params;
//             const user = users.find(u => u.id == id);
        
//             // make sure we found a note
//             if (!user) {
//                 logger.error(`User with id ${id} not found.`);
//                 return res
//                     .status(404)
//                     .send('User Not Found');
//             }
        
//             res.json(user);
//   })
//   .delete((req, res) => {
//         const { userId } = req.params;
    
//         const index = users.findIndex(u => u.id === userId);
    
//         // make sure we actually find a user with that id
//         if (index === -1) {
//         return res
//             .status(404)
//             .send('User not found');
//         }
    
//         users.splice(index, 1);
    
//         res
//             .status(204)
//             .end();
//  })

module.exports = userRouter