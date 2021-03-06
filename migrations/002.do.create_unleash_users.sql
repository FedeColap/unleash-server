CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  created TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE notes
    ADD COLUMN author INTEGER REFERENCES users(id)
    ON DELETE SET NULL;