const app = require('../src/app')


describe('GET /notes', () => {
 
    it.skip('should return an array of notes', () => {
      return supertest(app)
      .post('')
        .get('/notes')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
            expect(res.body).to.be.an('array')
            expect(res.body).to.have.lengthOf.at.least(1)
            const note = res.body[0]
            expect(note).to.include.all.keys(
                'id', 'content', 'created'
            );
        });
    })
});


describe('App', () => {
    //missing authorization
    it.skip('GET / responds with 200 containing "Fede, Speranza e Carita"', () => {
        return supertest(app)
                            .get('/')
                            .expect(200, 'Fede, Speranza e Carita')
    })
})