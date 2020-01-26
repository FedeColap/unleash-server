const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('users')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },

    getUserWithUserName(db, username) {
      return db('users')
        .where({ username })
        .first()
    },
  
    // getById(knex, id) {
    //   return knex
    //     .from('users')
    //     .select('*')
    //     .where('id', id)
    //     .first()
    // },
  
    deleteUser(knex, id) {
      return knex('users')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('users')
        .where({ id })
        .update(newUserFields)
    },
    validatePassword(password) {
        if (password.length < 8) {
          return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
          return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
          return 'Password must not start or end with empty spaces'
        }
    },
    hasUserWithUserName(db, username) {
        return db('users')
            .where({ username })
            .first()
            .then(user => !!user)
    },
  }
  
  module.exports = UsersService