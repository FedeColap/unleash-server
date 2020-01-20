const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

describe.only('Notes Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('notes').truncate())

    afterEach('cleanup', () => db('notes').truncate())

    context('Given there are notes in the database', () => {
            const testNotes = [
                {
                    id: 1,
                    content: 'First test post!',
                    created: '2029-01-22T16:28:32.615Z',
                },
                {
                    id: 2,
                    content: 'Second test post!',
                    created: '2100-05-22T16:28:32.615Z',
                },
                {
                    id: 3,
                    content: 'Third test post!',
                    created: '1919-12-22T16:28:32.615Z',
                },
                {
                    id: 4,
                    content: 'Fourth test post!',
                    created: '1919-12-22T16:28:32.615Z',
                },
             ];
        
            beforeEach('insert notes', () => {
               return db
                 .into('notes')
                 .insert(testNotes)
            })

        it('GET /notes responds with 200 and all of the notes', () => {
            return supertest(app)
                .get('/notes')
                .expect(200, testNotes)
            // TODO: add more assertions about the body
        })
        it('GET /notes/:note_id responds with 200 and the specified note', () => {
            const noteId = 2
            const expectedNote = testNotes[noteId - 1]
            return supertest(app)
                .get(`/notes/${noteId}`)
                .expect(200, expectedNote)
        })
    })
})