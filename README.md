# Unleash Server

Back-end application for storing and retrieving Information about the users and their next trips abroad. 
This Repo works with the Front-end Repo [Unleash-react](https://github.com/FedeColap/Unleash-react)

### Link
## [Live App Demo](https://unleash-react.now.sh/)
### __Demo-User__ : Username: __Juju__ , Password: __qwerty17__
___

#### This App has been built with: 

* React
* Node.js 
* Morgan and Winston for logging
* PostgreSQL database
* Knex.js for query building
* Postgrator for versioning
* Testing on Mocha framework using Chai and Supertest
___

### API Documentation
While the Homepage is visible to everyone, 
you need to authenticate (register and login) in order to see your personal notes. The app works with "application/json" body for post requests, and returns JSON data.

#### Create Account:
`POST /api/users`

Post `{ username, password, repeatPassword }` object to create a new user entry in the table
The database will reject the entry if a `username` has already been taken.
The password must be 8 - 72 character and must contain at least one lowercase letter, uppercase letter, number, and special character

#### Login:
`POST /api/login`

Post `{ username, password }` object to log in to the application

#### Retrieve all your notes:
`GET /api/notes`

Protected endpoint: header must include basic Authorization.
Successful get request will return an array of JSON objects containing `{id, content, created, author}` of the notes of a specific user (empty screen if there are no notes).

#### Add a new note
`POST /api/notes`

Protected endpoint: header must include basic Authorization , needed to automatically calculate the `author` 
Successful post request will perform the `POST` request and redirect to the *Landing Page*, where all the notes are immediately available.

#### Update a note
`PATCH /api/notes`

Protected endpoint: header must include basic Authorization , needed to automatically calculate the `author`.
Clicking the "update" button of a note redirects to a form where is possible to update the `{content}` of the selected note, while `{id, author}` and `{created}` will remain untouched.
Successful patch request will perform the `PATCH` request and redirect to the *Landing Page*, where all the notes are immediately available.

#### Delete a note
`DELETE /api/notes`

Protected endpoint: header must include basic Authorization , needed to automatically calculate the `author`.
Clicking the "delete" performs the `DELETE` operation immediately, displaying all the remaining notes. 