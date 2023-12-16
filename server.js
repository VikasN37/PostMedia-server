const dotenv = require('dotenv');
const moongoose = require('mongoose');

dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

moongoose.connect(DB).then(() => {
  console.log('Database Connection Successful');
});

app.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
});
