BEGIN;
INSERT INTO notes
    (content, author, created)
VALUES 
    ('today I saw a funny Grumpy-cat meme', '1', '2020-01-15T19:27:34.061Z'),
    ('My friend thinks he is smart. He told me an onion is the only food that makes you cry, so I threw a coconut at his face.', '2', '2019-12-15T19:17:34.061Z'),
    ('Light travels faster than sound. This is why some people appear bright until you hear them speak.', '3', '2020-01-15T19:17:34.061Z'),
    ('Question: Who does Polyphemus hate more than Odysseus?', '4', '2019-01-15T19:17:34.061Z'),
    ('Mary was very mean to me, today :-(', '5', '2019-02-15T19:17:34.061Z'),
    ('Life is a wheel, Mary has arrived late today, ha ha!', '6', '2019-05-15T19:17:34.061Z'),
    ('God made rivers, God made lakes, God made you, Hell, everyone makes mistakes.', '4', '2019-01-21T19:17:34.061Z');

COMMIT;
    