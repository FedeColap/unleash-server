const express = require('express')
const UsersService = require('./users-service')
const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const { username, password } = req.body
        const loginUser = { username, password }

        for (const [key, value] of Object.entries(loginUser))
        if (value == null)
            return res.status(400).json({
            error: `Missing '${key}' in request body`
            })

            UsersService.getUserWithUserName(
            req.app.get('db'),
            loginUser.username
        )
        .then(dbUser => {
            if (!dbUser)
                return res.status(400).json({
                    error: 'Incorrect username or password',
                })  
            if(loginUser.password !== dbUser.password)
                return res.status(400).json({
                    error: 'Incorrect username or password',
                }) 
                res
                    .status(201)
                    .json(dbUser);
                
                
        })
        .catch(next)
    })

module.exports = authRouter