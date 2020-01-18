const express = require('express')
const userRouter = express.Router()
const bodyParser = express.json();
const logger = require('../logger')
const uuid = require('uuid/v4');
const { users } = require('../data-store')

// const users = [
//     {
//          "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
//          "username": "sallyStudent",
//          "password": "c00d1ng1sc00l"
//     },
//     {
//          "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
//          "username": "johnBlocton",
//          "password": "veryg00dpassw0rd"
//     }
// ];

userRouter
  .route('/users')
  .get((req, res) => {
    res
         .json(users);
  })
  .post(bodyParser, (req, res) => {
        // get the data
        const { username, password } = req.body;
        // validation code here
        if (!username) {
            return res
                .status(400)
                .send('Name required');
        }
        if (!password) {
            return res
                .status(400)
                .send('Password required');
        }
        if (username.length < 3 || username.length > 20) {
            return res
                .status(400)
                .send('Username must be between 3 and 20 characters');
        }
        // password length
        if (password.length < 6 || password.length > 72) {
            return res
            .status(400)
            .send('Password must be between 6 and 72 characters');
        }
        
        // password contains digit, using a regex here
        if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
            return res
                .status(400)
                .send('Password must be contain at least one digit');
        }
        // at this point all validation passed
        const id = uuid();
        const newUser = {
            id,
            username,
            password
        };

    users.push(newUser);

    res
        .status(201)
        .location(`http://localhost:8000/users/${id}`)
        .json(newUser);
  })

userRouter
  .route('/users/:id')
  .get((req, res) => {
        const { id } = req.params;
            const user = users.find(u => u.id == id);
        
            // make sure we found a note
            if (!user) {
                logger.error(`User with id ${id} not found.`);
                return res
                    .status(404)
                    .send('User Not Found');
            }
        
            res.json(user);
  })
  .delete((req, res) => {
        const { userId } = req.params;
    
        const index = users.findIndex(u => u.id === userId);
    
        // make sure we actually find a user with that id
        if (index === -1) {
        return res
            .status(404)
            .send('User not found');
        }
    
        users.splice(index, 1);
    
        res
            .status(204)
            .end();
  })

module.exports = userRouter