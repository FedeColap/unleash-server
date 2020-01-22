const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    getAllUserNotes(db, id ) {
        console.log(id)
        return db
        .from('notes')
        .rightJoin(
            'users',
            'notes.author',
            'users.id'
        )
        .select(
            'notes.id',
            'notes.content',
            'notes.created',
            'notes.author',
        )
        .where('author', id)
    },
    getById(knex, id) {
        return knex.from('notes').select('*').where('id', id).first()
    },
    insertNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteNote(knex, id) {
        return knex('notes')
          .where({ id })
          .delete()
    },
    updateNote(knex, id, newNoteFields) {
        return knex('notes')
          .where({ id })
          .update(newNoteFields)
    },
}

module.exports = NotesService