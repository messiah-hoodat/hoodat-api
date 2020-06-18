import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes/routes';

const app = express();
const port = 8000;

RegisterRoutes(app);

const swaggerDocument = require('../api/dist/swagger.json');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Server started listening to port ${port}`));