import dotenv from 'dotenv';
dotenv.config();

import App from './App';

async function init(): Promise<void> {
  const app = new App();
  await app.start();
  app.listen();
}

export default init().catch((err) => {
  console.log(err);
  process.exit(1);
});
