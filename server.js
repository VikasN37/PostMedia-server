/* eslint-disable no-console */
const dotenv = require('dotenv');
const moongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception , Shutting down application.....');

  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

moongoose.connect(DB).then(() => {
  console.log('Database Connection Successful');
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled exception , Shutting down application.....');

  server.close(() => {
    process.exit(1);
  });
});
