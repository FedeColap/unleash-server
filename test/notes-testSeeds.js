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
module.exports = {
    makeNotesArray,
}