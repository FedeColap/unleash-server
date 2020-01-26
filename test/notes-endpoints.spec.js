const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes-testSeeds.js')
const { makeUsersArray } = require('./users-testSeeds.js')


describe.only('Notes Endpoints', function() {
    let db

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.username}:${user.password}`).toString('base64')
        return `Basic ${token}`
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE notes, users RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE notes, users RESTART IDENTITY CASCADE'))

    describe(`GET /api/notes`, () => {
        context('Given there are notes in the database', () => {
            const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
               return db
                 .into('users')
                 .insert(testUsers)
                 .then(() => {
                    return db
                      .into('notes')
                      .insert(testNotes)
                  })
            })

            it('GET /api/notes responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, testNotes)
            })
        })
        context(`Given no notes`, () => {
            const testUsers = makeUsersArray();
        
            beforeEach('insert notes', () => {
               return db
                 .into('users')
                 .insert(testUsers)
            })
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })
    })


    describe(`GET /api/notes/:note_id`, () => {
        context('Given there are notes in the database', () => {
            const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
                return db
                  .into('users')
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                       .insert(testNotes)
                   })
            })
            it('GET /api/notes/:note_id responds with 200 and the specified note', () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(200, expectedNote)
            })
        })
        context(`Given no notes`, () => {
            const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
                return db
                  .into('users')
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                       .insert(testNotes)
                   })
            })
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })
        context.skip(`Given an XSS attack note`, () => {
            const maliciousNote = {
                id: 911,
                author: 'NaughtyMan',
                content: 'Naughty naughty very naughty <script>alert("xss");</script>',
            }
            
            beforeEach('insert malicious note', () => {
                const testUsers = makeUsersArray();
                const testNotes = makeNotesArray()
                return db
                  .into('users')
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                    .insert([ maliciousNote ])
                  })
            })
            
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/notes/${maliciousNote.id}`)
                    .set('Authorization', makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.content).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    })
            })
        })
    })

    describe(`POST /api/notes`, () => {
        const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
                return db
                  .into('users')
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                       .insert(testNotes)
                   })
            })
            function makeAuthHeader(user) {
                const token = Buffer.from(`${user.username}:${user.password}`).toString('base64')
                return `Basic ${token}`
            }
                
        it(`responds 401 'Unauthorized request' when invalid password`, () => {
            const userInvalidPass = { username: testUsers[0].username, password: 'wrong' }
            return supertest(app)
                .post('/api/notes')
                .set('Authorization', makeAuthHeader(userInvalidPass))
                .expect(401, { error: `Unauthorized request` })
        })        
        it(`creates a note, responding with 201 and the new note`,  function() {
            const testUser = testUsers[0]
            const newNote = {
                 content: 'Test new note content'
            }
            
            return supertest(app)
                .post('/api/notes')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body).to.have.property('id')
                    expect(res.body.author).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/notes/${postRes.body.id}`)
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(postRes.body)
                )
        })
        it(`responds with 400 and an error message when the 'content' is missing`, () => {
            return supertest(app)
                .post('/api/notes')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'content' in request body` }
                })
        })
    })

    describe(`DELETE /api/notes/:note_id`, () => {
        
        context('Given there are notes in the database', () => {
            const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
                return db
                  .into('users') 
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                       .insert(testNotes)
                   })
            })
        
            it('responds with 204 and removes the note', () => {
               const idToRemove = 2
               const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
               return supertest(app)
                    .delete(`/api/notes/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes`)
                            .set('Authorization', makeAuthHeader(testUsers[0]))
                            .expect(expectedNotes)
                    )
            })
        })
        context(`Given no notes`, () => {
            const testUsers = makeUsersArray();
        
            beforeEach('insert notes', () => {
                return db
                  .into('users') 
                  .insert(testUsers)
            })
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .delete(`/api/notes/${noteId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })
    })

    describe(`PATCH /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
            const testUsers = makeUsersArray();
        
            beforeEach('insert notes', () => {
                return db
                  .into('users') 
                  .insert(testUsers)
            })
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })
        context('Given there are notes in the database', () => {
            const testUsers = makeUsersArray();
            const testNotes = makeNotesArray()
            
            beforeEach('insert notes', () => {
                return db
                  .into('users')
                  .insert(testUsers)
                  .then(() => {
                     return db
                       .into('notes')
                       .insert(testNotes)
                   })
            })
            
            it('responds with 204 and updates the note', () => {
                const idToUpdate = 2
                const updateNote = {
                    content: 'updated note content',
                }
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updateNote
                }
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send(updateNote)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/api/notes/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(expectedNote)
                    )
            })
            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(testUsers[0]))
                    .send({})
                    .expect(400, {
                        error: {
                           message: `Request body must contain content`
                        }
                    })
            })
        })
    })
   
})