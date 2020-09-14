import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './validation/errorHandler';

dotenv.config();

const { DB_CONNECTION_STRING, PORT } = process.env;

const app = express();
app.use(express.json({ limit: '50mb' }));

mongoose.connect(
  DB_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
      throw new Error(err.errmsg);
    }
    console.log('Connected to database.');
  }
);

RegisterRoutes(app);

const swaggerDocument = require('../api/dist/swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

const port = PORT || 8000;
app.listen(port, () => console.log(`Server started listening to port ${port}.`));