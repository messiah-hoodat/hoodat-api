import * as express from 'express';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './validation/errorHandler';

dotenv.config();

const { DB_CONNECTION_STRING, PORT } = process.env;

const app = express();
app.use(express.json());

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
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

const port = PORT || 8000;
app.listen(port, () => console.log(`Server started listening to port ${port}.`));