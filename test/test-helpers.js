const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
      {
        id: 1,
        username: 'SuperRookie',
        password: 'secretPas123!',
      },
      {
        id: 2,
        username: 'Tenshou',
        password: 'odioRukawa123!',
      },
      {
        id: 3,
        username: 'Gorilla',
        password: 'totheFinals123!',
      },
      {
        id: 4,
        username: 'Teppista',
        password: 'lastYear123!',
      },
      {
        id: 5,
        username: 'Tappetto',
        password: 'gamePlayer123!',
      },
    ]
}

function makeNotesArray () {
    return [
        {
            id: 1,
            content: 'First test post!',
            author: 1,
            created: '2029-01-22T16:28:32.615Z',
        },
        {
            id: 2,
            content: 'Second test post!',
            author: 1,
            created: '2100-05-22T16:28:32.615Z',
        },
        {
            id: 3,
            content: 'Third test post!',
            author: 2,
            created: '1919-12-22T16:28:32.615Z',
        },
        {
            id: 4,
            content: 'Fourth test post!',
            author: 2,
            created: '1919-12-22T16:28:32.615Z',
        },
    ];
}
function makeNotesFixtures() {
  const testUsers = makeUsersArray()
  const testNotes =  makeNotesArray(testUsers)
  return { testUsers, testNotes }
}

function makeExpectedNotes(users, noteId) {
  const expectedNotes = notes
    .filter(note => note.id === noteId)

  return expectedNotes.map(trip => {
    const noteUser = users.find(user => user.id === note.author)
    return {
      id: note.id,
      content: note.content,
      created: note.created,
      author: {
        id: noteUser.id,
        username: noteUser.author,
      }
    }
  })
}


function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        notes,
        users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE notes_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('notes_id_seq', 0)`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
      ])
    )
  )
}

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() =>
        // update the auto sequence to stay in sync
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
  }

function seedNotesTables(db, users, notes) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('notes').insert(notes)
    // update the auto sequence to match the forced id values
    await trx.raw(
        `SELECT setval('notes_id_seq', ?)`,
        [notes[notes.length - 1].id],
    )
  })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ author: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}


module.exports = {
    makeUsersArray,
    makeNotesArray,
    makeNotesFixtures,
    makeExpectedNotes,
    cleanTables,
    seedUsers,
    seedNotesTables,
    makeAuthHeader
  }