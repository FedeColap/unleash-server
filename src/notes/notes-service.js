const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    getById(knex, id) {
        return knex.from('notes').select('*').where('id', id).first()
    },
}

module.exports = NotesService