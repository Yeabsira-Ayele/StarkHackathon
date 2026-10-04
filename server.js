require('dotenv').config();

const app = require('./src/app');
const { connectDb } = require('./src/config/db');

const port = Number(process.env.PORT) || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Lewegene API listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
