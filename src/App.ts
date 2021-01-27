import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './validation/errorHandler';

const { DB_CONNECTION_STRING, PORT } = process.env;

export default class App {
  private database?: typeof mongoose;
  public express?: express.Express;

  public async start(): Promise<void> {
    const app = express();
    this.express = app;

    app.use(express.json({ limit: '50mb' }));

    try {
      const database = await mongoose.connect(DB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.database = database;
    } catch (error) {
      throw new Error('Error connecting to database');
    }

    RegisterRoutes(app);

    const swaggerDocument = require('../api/dist/swagger.json');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use('/static', express.static('public'));

    app.use(errorHandler);
  }

  public listen(port?: number): void {
    const p = PORT || port || 8000;
    this.express.listen(p, () =>
      console.log(`Started listening to port ${p}.`)
    );
  }

  public async stop(): Promise<void> {
    await this.database?.disconnect();
  }
}
