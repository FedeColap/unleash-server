const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes-testSeeds.js')
const { makeUsersArray } = require('./users-testSeeds.js')

describe.only('Protected endpoints', function() {
    let db

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

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.username}:${user.password}`).toString('base64')
        return `Basic ${token}`
    }

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

    const protectedEndpoints = [
        {
        name: 'GET /api/notes/:note_id',
        path: '/api/notes/1',
        method: supertest(app).get,
        },
        {
        name: 'POST /api/notes',
        path: '/api/notes',
        method: supertest(app).post,
        },
    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
        it(`responds 401 'Missing basic token' when no basic token`, () => {
            return endpoint.method(endpoint.path)
            .expect(401, { error: `Missing basic token` })
        })

        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
            const userNoCreds = { username: '', password: '' }
            return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(userNoCreds))
            .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid user`, () => {
            const userInvalidCreds = { username: 'user-not', password: 'existy' }
            return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(userInvalidCreds))
            .expect(401, { error: `Unauthorized request` })
        })

        it(`responds 401 'Unauthorized request' when invalid password`, () => {
            const userInvalidPass = { username: testUsers[0].username, password: 'wrong' }
            return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(userInvalidPass))
            .expect(401, { error: `Unauthorized request` })
        })
        })
    })
})