import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes/routes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json())
const port = process.env.PORT || 8000;

RegisterRoutes(app);

const swaggerDocument = require('../api/dist/swagger.json');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Server started listening to port ${port}`));