const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes-testSeeds.js')


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

    describe(`GET /notes`, () => {
        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
               return db
                 .into('notes')
                 .insert(testNotes)
            })

            it('GET /notes responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, testNotes)
            })
        })
        context(`Given no notes`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, [])
            })
        })
    })


    describe(`GET /notes/:note_id`, () => {
        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray()
        
            beforeEach('insert notes', () => {
               return db
                 .into('notes')
                 .insert(testNotes)
            })
            it('GET /notes/:note_id responds with 200 and the specified note', () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(200, expectedNote)
            })
        })
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist` } })
            })
        })
    })

    describe.only(`POST /notes`, () => {
        it(`creates a note, responding with 201 and the new note`,  function() {
            const newNote = {
                 content: 'Test new note content'
            }
            return supertest(app)
                .post('/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.created).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
    })
   
})