const xss = require('xss')
const express = require('express')
const logger = require('../logger')
const noteRouter = express.Router()
const jsonParser = express.json()
const { notes } = require('../data-store')
const NotesService = require('./notes-service')

const sanitizeNote = note => ({
  id: note.id,
  content: xss(note.content),
  created: note.created,
})

noteRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(
        req.app.get('db')
    )
    .then(notes => {
        res.json(notes.map(sanitizeNote))
    })
    .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { content } = req.body
    const newNote = { content }
    if (!content) {
        return res.status(400).json({
            error: { message: `Missing 'content' in request body` }
        })
    }
    NotesService.insertNote(
         req.app.get('db'),
         newNote
    )
    .then(note => {
      res
        .status(201)
        .location(`/notes/${note.id}`)
        .json(sanitizeNote(note))
    })
    .catch(next)
})

  noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
      NotesService.getById(
          req.app.get('db'),
          req.params.note_id
      )
      .then(note => {
          if (!note) {
              return res.status(404).json({
                error: { message: `Note doesn't exist` }
              })
          }
          res.note = note // save the note for the next middleware
          next() // don't forget to call next so the next middleware happens!
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(sanitizeNote(res.note))
  })
  .delete((req, res, next) => {
      res.status(204).end()
      NotesService.deleteNote(
          req.app.get('db'),
          req.params.note_id
      )
      .then(() => {
          res.status(204).end()
      })
      .catch(next)
  })

module.exports = noteRouter