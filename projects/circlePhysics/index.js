/*
 * Trivial web server that serves the contents of the public/ directory.
 */

import express from 'express';

const port = 0;

const app = express();

app.use(express.static('public'));

app.listen(port, function () {
  console.log(`Listening on port ${this.address().port}`);
}); 
