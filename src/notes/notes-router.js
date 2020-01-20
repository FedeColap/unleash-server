const uuid = require('uuid/v4');
const express = require('express')
const logger = require('../logger')
const noteRouter = express.Router()
const bodyParser = express.json()
const { notes } = require('../data-store')
const NotesService = require('./notes-service')

noteRouter
  .route('/notes')
  .get((req, res) => {
    res
         .json(notes);
  })
  .post(bodyParser, (req, res) => {
        const { content } = req.body;
        if (!content) {
            logger.error(`Content is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        const id = uuid();
        const d = new Date();
        const created = d.toISOString();
        const note = {
            id,
            content,
            created
        };

        notes.push(note);
        logger.info(`Note with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/notes/${id}`)
            .json(note);
})

  noteRouter
  .route('/notes/:id')
  .get((req, res) => {
        const { id } = req.params;
        const note = notes.find(n => n.id == id);
    
        // make sure we found a note
        if (!note) {
            logger.error(`Note with id ${id} not found.`);
            return res
                .status(404)
                .send('Note Not Found');
        }
    
        res.json(note);
  })
  .delete((req, res) => {
        const { id } = req.params;
    
        const noteIndex = notes.findIndex(n => n.id == id);
    
        if (noteIndex === -1) {
        logger.error(`Note with id ${id} not found.`);
        return res
            .status(404)
            .send('Not Found');
        }
    
        notes.splice(noteIndex, 1);
    
        logger.info(`Note with id ${id} deleted.`);
        res
        .status(204)
        .end();
  })

module.exports = noteRouter