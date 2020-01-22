const xss = require('xss')
const path = require('path')
const express = require('express')
const logger = require('../logger')
const noteRouter = express.Router()
const jsonParser = express.json()
// const { notes } = require('../data-store')
const NotesService = require('./notes-service')
const { requireAuth } = require('../middleware/basic-auth')

const sanitizeNote = note => ({
  id: note.id,
  content: xss(note.content),
  created: note.created,
  // author: note.author
})

noteRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    NotesService.getAllUserNotes(
        req.app.get('db'), req.user.id
    )
    .then(notes => {
        res.json(notes.map(sanitizeNote))
    })
    .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { content } = req.body
    console.log(req.body)
    const newNote = { content }
    if (!content) {
        return res.status(400).json({
            error: { message: `Missing 'content' in request body` }
        })
    }
    newNote.author = req.user.id
    
    NotesService.insertNote(
         req.app.get('db'),
         newNote
    )
    .then(note => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${note.id}`))
        .json(sanitizeNote(note))
    })
    .catch(next)
})

  noteRouter
  .route('/:note_id')
  .all(requireAuth)
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
  .patch(jsonParser, (req, res, next) => {
      const { content } = req.body
      const noteToUpdate = { content }
      const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain content`
        }
      })
   }
      NotesService.updateNote(
          req.app.get('db'),
          req.params.note_id,
          noteToUpdate
      )
      .then(numRowsAffected => {
          res.status(204).end()
      })
      .catch(next)
  })

module.exports = noteRouter