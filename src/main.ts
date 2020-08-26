import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

import { RegisterRoutes } from './routes/routes';

dotenv.config();

const app = express();
app.use(express.json())
const port = process.env.PORT || 8000;

const connectionString = process.env.DB_CONNECTION_STRING;

mongoose.connect(connectionString, (err) => {
  if (err) {
    console.log(err);
    throw new Error(err.errmsg);
  }
  console.log('Connected to database!')
});


RegisterRoutes(app);

const swaggerDocument = require('../api/dist/swagger.json');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Server started listening to port ${port}`));